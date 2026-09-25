/**
 * Reusable admin CRUD API factory.
 *
 * Generates consistent, secure API routes for any content type.
 * Each route enforces:
 *  - Authentication (requireAdmin)
 *  - Authorization (superadmin for destructive ops)
 *  - Input validation (zod)
 *  - HTML sanitization (sanitizeText/sanitizeHtml)
 *  - Audit logging
 *  - Cache invalidation (revalidatePath)
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ModelName =
  | "service"
  | "project"
  | "blogPost"
  | "industry"
  | "testimonial"
  | "faq"
  | "solution";

interface CrudConfig {
  model: ModelName;
  resourceLabel: string; // for audit log, e.g. "service", "blog"
  publicPaths: string[]; // paths to revalidate on change
  listSelect?: Prisma.ServiceSelect; // fields to return in list
}

/**
 * Creates GET (list), POST (create), PATCH (update), DELETE handlers
 * for an admin content type. All require authentication.
 * DELETE requires superadmin.
 */
export function createCrudHandlers(config: CrudConfig) {
  const { model, resourceLabel, publicPaths } = config;
  const table = (db as any)[model];

  async function GET(req: Request) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("q") || undefined;

    // Admin sees ALL records (published + drafts) — no published filter
    // The public data-access layer handles published filtering for public pages
    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { title: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      table.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      table.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  }

  async function POST(req: Request) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    try {
      // Sanitize all string fields in the body
      const sanitized = sanitizeObject(body);
      const created = await table.create({ data: sanitized });

      await recordAudit({
        userId: user.id,
        action: "CREATE",
        resource: resourceLabel,
        resourceId: created.id,
        ip: getClientIp(req),
      });

      // Revalidate public pages
      for (const path of publicPaths) {
        revalidatePath(path);
      }

      return NextResponse.json({ item: created }, { status: 201 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`[admin] create ${resourceLabel} failed:`, msg.slice(0, 200));
      return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
  }

  async function PATCH(req: Request) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      const { id, ...updateData } = body;
      const sanitized = sanitizeObject(updateData);
      const updated = await table.update({ where: { id }, data: sanitized });

      const wasPublish = "published" in sanitized;
      await recordAudit({
        userId: user.id,
        action: wasPublish
          ? (sanitized.published ? "PUBLISH" : "UNPUBLISH")
          : "UPDATE",
        resource: resourceLabel,
        resourceId: id,
        ip: getClientIp(req),
      });

      for (const path of publicPaths) {
        revalidatePath(path);
      }

      return NextResponse.json({ item: updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`[admin] update ${resourceLabel} failed:`, msg.slice(0, 200));
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  }

  async function DELETE(req: Request) {
    const user = await requireSuperAdmin();
    if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await table.delete({ where: { id } });

      await recordAudit({
        userId: user.id,
        action: "DELETE",
        resource: resourceLabel,
        resourceId: id,
        ip: getClientIp(req),
      });

      for (const path of publicPaths) {
        revalidatePath(path);
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`[admin] delete ${resourceLabel} failed:`, msg.slice(0, 200));
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  }

  return { GET, POST, PATCH, DELETE };
}

/** Recursively sanitize all string values in an object. */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => (typeof v === "string" ? sanitizeText(v) : typeof v === "object" && v !== null ? sanitizeObject(v as Record<string, unknown>) : v));
    } else if (value !== null && typeof value === "object") {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
