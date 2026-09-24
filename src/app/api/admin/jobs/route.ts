/**
 * Careers / job postings — array stored under CompanySettings key "jobs".
 *
 * GET    /api/admin/jobs               → { items: Job[] }
 * POST   /api/admin/jobs               → { item: Job }     body: job draft
 * PATCH  /api/admin/jobs               → { item: Job }     body: { id, ...fields }
 * DELETE /api/admin/jobs?id=<id>       → { ok: true }
 *
 * Reads open to any admin; writes require superadmin.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SETTING_KEY = "jobs";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  published: boolean;
}

function newId(): string {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function csvToCleanArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => sanitizeText(String(s))).filter(Boolean);
  }
  if (typeof input === "string") {
    return sanitizeText(input)
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function sanitizeItem(input: unknown, existingId?: string): Job {
  const obj = (input ?? {}) as Record<string, unknown>;
  return {
    id:
      typeof obj.id === "string" && obj.id.trim()
        ? sanitizeText(obj.id)
        : existingId ?? newId(),
    title: sanitizeText(String(obj.title ?? "")),
    department: sanitizeText(String(obj.department ?? "")),
    location: sanitizeText(String(obj.location ?? "")),
    type: sanitizeText(String(obj.type ?? "Full-time")),
    summary: sanitizeText(String(obj.summary ?? "")),
    responsibilities: csvToCleanArray(obj.responsibilities),
    requirements: csvToCleanArray(obj.requirements),
    niceToHave: csvToCleanArray(obj.niceToHave),
    published: Boolean(obj.published ?? true),
  };
}

async function loadItems(): Promise<Job[]> {
  const row = await db.companySettings.findUnique({
    where: { key: SETTING_KEY },
  });
  const items = (row?.value as unknown as Job[] | undefined) ?? [];
  return Array.isArray(items) ? items : [];
}

async function saveItems(items: Job[]) {
  await db.companySettings.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value: items as unknown as import("@prisma/client").Prisma.InputJsonValue,
    },
    update: {
      value: items as unknown as import("@prisma/client").Prisma.InputJsonValue,
    },
  });
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await loadItems();
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] jobs GET failed:", msg.slice(0, 200));
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden — superadmin required" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const item = sanitizeItem(body, newId());

  try {
    const items = await loadItems();
    items.push(item);
    await saveItems(items);

    await recordAudit({
      userId: user.id,
      action: "CREATE",
      resource: "job",
      resourceId: item.id,
      ip: getClientIp(req),
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] jobs POST failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden — superadmin required" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...fields } = body as { id: string; fields?: unknown };
  const patched = sanitizeItem({ ...(fields as object), id }, id);

  try {
    const items = await loadItems();
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    items[idx] = patched;
    await saveItems(items);

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "job",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ item: patched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] jobs PATCH failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden — superadmin required" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const items = await loadItems();
    const next = items.filter((it) => it.id !== id);
    if (next.length === items.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    await saveItems(next);

    await recordAudit({
      userId: user.id,
      action: "DELETE",
      resource: "job",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] jobs DELETE failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
