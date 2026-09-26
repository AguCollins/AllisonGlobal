/**
 * Process steps management — array stored under CompanySettings key "process".
 *
 * GET    /api/admin/process             → { items: ProcessStep[] }
 * POST   /api/admin/process             → { item: ProcessStep }  body: step draft
 * PATCH  /api/admin/process             → { item: ProcessStep }  body: { id, ...fields }
 * DELETE /api/admin/process?id=<id>     → { ok: true }
 *
 * Reads open to any admin; writes require superadmin.
 */
import { NextResponse } from "next/server";
import { revalidateContent } from "@/lib/revalidate";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SETTING_KEY = "process";

interface ProcessStep {
  id: string;
  step: number;
  title: string;
  summary: string;
  description: string;
  activities: string[];
  deliverable: string;
  iconName: string;
}

function newId(): string {
  return `proc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeItem(input: unknown, existingId?: string): ProcessStep {
  const obj = (input ?? {}) as Record<string, unknown>;
  const activities = Array.isArray(obj.activities)
    ? obj.activities.map((a) => sanitizeText(String(a))).filter(Boolean)
    : typeof obj.activities === "string"
      ? sanitizeText(obj.activities)
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  return {
    id:
      typeof obj.id === "string" && obj.id.trim()
        ? sanitizeText(obj.id)
        : existingId ?? newId(),
    step: Number.isFinite(obj.step as number) ? Number(obj.step) : 0,
    title: sanitizeText(String(obj.title ?? "")),
    summary: sanitizeText(String(obj.summary ?? "")),
    description: sanitizeText(String(obj.description ?? "")),
    activities,
    deliverable: sanitizeText(String(obj.deliverable ?? "")),
    iconName: sanitizeText(String(obj.iconName ?? "ClipboardList")),
  };
}

async function loadItems(): Promise<ProcessStep[]> {
  const row = await db.companySettings.findUnique({
    where: { key: SETTING_KEY },
  });
  const items = (row?.value as unknown as ProcessStep[] | undefined) ?? [];
  return Array.isArray(items) ? items : [];
}

async function saveItems(items: ProcessStep[]) {
  await db.companySettings.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value: items as unknown as string,
    },
    update: {
      value: items as unknown as string,
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
    console.error("[admin] process GET failed:", msg.slice(0, 200));
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
      resource: "process",
      resourceId: item.id,
      ip: getClientIp(req),
    });

    revalidateContent("process");
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] process POST failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to create process step" }, { status: 500 });
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
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }
    items[idx] = patched;
    await saveItems(items);

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "process",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("process");
    return NextResponse.json({ item: patched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] process PATCH failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to update process step" }, { status: 500 });
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
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }
    await saveItems(next);

    await recordAudit({
      userId: user.id,
      action: "DELETE",
      resource: "process",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("process");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] process DELETE failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to delete process step" }, { status: 500 });
  }
}
