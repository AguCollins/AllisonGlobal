/**
 * Reusable admin CRUD API factory with field allowlisting.
 *
 * SECURITY: Each model has an explicit allowlist of fields that can be
 * created/updated. Any field not in the allowlist is silently dropped,
 * preventing mass assignment of `id`, `createdAt`, `passwordHash`, etc.
 *
 * CACHE: Every mutation calls `revalidateContent(type)` to invalidate all
 * public routes that depend on the mutated content type — no manual
 * `revalidatePath` calls scattered across handlers.
 */

import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { revalidateContent } from "@/lib/revalidate";

type ModelName =
  | "service"
  | "project"
  | "blogPost"
  | "industry"
  | "testimonial"
  | "faq"
  | "solution";

type ContentType =
  | "service" | "project" | "blog-post" | "industry"
  | "testimonial" | "faq" | "solution";

interface CrudConfig {
  model: ModelName;
  resourceLabel: string;
  contentType: ContentType;
  /** Fields that admins are allowed to set on create/update. */
  allowedFields: Set<string>;
}

/** Per-model field allowlists — ONLY these fields can be written. */
const FIELD_ALLOWLISTS: Record<ModelName, Set<string>> = {
  service: new Set([
    "slug", "name", "categoryId", "tagline", "shortDescription", "overview",
    "problem", "solution", "deliverables", "benefits", "tech",
    "relatedServices", "relatedIndustries", "faqs",
    "featured", "published", "iconName", "imageUrl", "sortOrder",
    // SEO
    "metaTitle", "metaDescription", "ogImage", "canonicalUrl", "noindex",
  ]),
  project: new Set([
    "slug", "title", "category", "industry", "services", "location", "scope",
    "description", "highlights", "gallery", "technologies", "client",
    "completionDate", "imageQuery", "year",
    "featured", "published", "sortOrder",
    // SEO
    "metaTitle", "metaDescription", "ogImage", "canonicalUrl", "noindex",
  ]),
  blogPost: new Set([
    "slug", "title", "excerpt", "category", "readTime", "date",
    "author", "authorRole", "authorId", "imageQuery", "featuredImage",
    "content", "tags",
    "featured", "status", "scheduledAt",
    // SEO
    "metaTitle", "metaDescription", "ogTitle", "ogDescription",
    "ogImage", "canonicalUrl", "noindex", "nofollow",
  ]),
  industry: new Set([
    "slug", "name", "tagline", "summary",
    "challenges", "solutions", "outcomes",
    "imageQuery", "imageUrl", "iconName",
    "published", "sortOrder",
    // SEO
    "metaTitle", "metaDescription", "ogImage", "canonicalUrl", "noindex",
  ]),
  testimonial: new Set([
    "quote", "authorName", "authorRole", "sector", "rating", "projectType",
    "published", "sortOrder",
  ]),
  faq: new Set([
    "category", "question", "answer",
    "published", "sortOrder",
  ]),
  solution: new Set([
    "slug", "name", "summary", "description",
    "components", "outcomes", "bestFor",
    "iconName", "imageUrl",
    "published", "sortOrder",
    // SEO
    "metaTitle", "metaDescription", "ogImage", "canonicalUrl", "noindex",
  ]),
};

export function createCrudHandlers(config: Omit<CrudConfig, "allowedFields">) {
  const { model, resourceLabel, contentType } = config;
  const allowedFields = FIELD_ALLOWLISTS[model] ?? new Set<string>();
  const table = (db as unknown as Record<string, unknown>)[model] as {
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
    count: (args: Record<string, unknown>) => Promise<number>;
    create: (args: Record<string, unknown>) => Promise<{ id: string }>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
    delete: (args: Record<string, unknown>) => Promise<unknown>;
    findUnique: (args: Record<string, unknown>) => Promise<{ slug?: string } | null>;
  };

  /** Filter body to only allowed fields + sanitize strings. */
  function filterAndSanitize(body: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        result[key] = sanitizeValue(body[key]);
      }
    }
    return result;
  }

  function sanitizeValue(input: unknown): unknown {
    if (typeof input === "string") return sanitizeText(input);
    if (Array.isArray(input)) return input.map(sanitizeValue);
    if (input && typeof input === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        out[k] = sanitizeValue(v);
      }
      return out;
    }
    return input;
  }

  async function GET(req: Request) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
    const search = searchParams.get("q") || undefined;
    const drafts = searchParams.get("drafts") === "true";

    const searchFields = model === "blogPost"
      ? ["title", "slug", "category"]
      : model === "testimonial"
        ? ["quote", "authorName", "sector"]
        : model === "faq"
          ? ["question", "category"]
          : ["name", "title", "slug"];

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      }));
    }
    // Admin sees all records (including drafts) when ?drafts=true
    if (!drafts) {
      // BlogPost uses `status` instead of `published`
      if (model === "blogPost") {
        where.status = "published";
      } else {
        // For models with a published field, filter to published only
        const modelsWithPublished = ["service", "project", "industry", "testimonial", "faq", "solution"];
        if (modelsWithPublished.includes(model)) {
          where.published = true;
        }
      }
    }

    try {
      const [items, total] = await Promise.all([
        table.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
        table.count({ where }),
      ]);
      return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`[admin] ${resourceLabel} GET failed:`, msg.slice(0, 200));
      return NextResponse.json({ items: [], total: 0, error: "Database error" }, { status: 500 });
    }
  }

  async function POST(req: Request) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
      const data = filterAndSanitize(body as Record<string, unknown>);
      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
      }
      const created = await table.create({ data });

      await recordAudit({
        userId: user.id,
        action: "CREATE",
        resource: resourceLabel,
        resourceId: created.id,
        ip: getClientIp(req),
      });

      // Centralized cache invalidation
      revalidateContent(contentType, (created as { slug?: string }).slug);

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
    if (!body?.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    try {
      const { id, ...updateBody } = body;
      const data = filterAndSanitize(updateBody as Record<string, unknown>);
      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
      }

      // If slug is changing on a blog post, create a redirect from old → new
      if (model === "blogPost" && "slug" in data && data.slug) {
        const existing = await table.findUnique({ where: { id } });
        if (existing?.slug && existing.slug !== data.slug) {
          await db.redirect.upsert({
            where: { from: `/blog/${existing.slug}` },
            create: {
              from: `/blog/${existing.slug}`,
              to: `/blog/${data.slug}`,
              type: 301,
              note: `Auto-redirect from slug change`,
            },
            update: { to: `/blog/${data.slug}`, type: 301 },
          }).catch(() => null); // non-fatal
        }
      }

      const updated = await table.update({ where: { id }, data });

      const wasPublish = "published" in data || "status" in data;
      await recordAudit({
        userId: user.id,
        action: wasPublish
          ? (data.published ? "PUBLISH" : data.status === "archived" ? "ARCHIVE" : "UNPUBLISH")
          : "UPDATE",
        resource: resourceLabel,
        resourceId: id,
        ip: getClientIp(req),
      });

      // Centralized cache invalidation
      const slug = (updated as { slug?: string }).slug;
      revalidateContent(contentType, slug);

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

      // Centralized cache invalidation
      revalidateContent(contentType);

      return NextResponse.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`[admin] delete ${resourceLabel} failed:`, msg.slice(0, 200));
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  }

  return { GET, POST, PATCH, DELETE };
}
