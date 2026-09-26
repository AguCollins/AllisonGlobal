/**
 * Call-to-action (CTA) management — array stored under CompanySettings key "ctas".
 *
 * GET    /api/admin/ctas                → { items: Cta[] }
 * POST   /api/admin/ctas                → { item: Cta }      body: Cta draft
 * PATCH  /api/admin/ctas                → { item: Cta }      body: { id, ...fields }
 * DELETE /api/admin/ctas?id=<id>        → { ok: true }
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

const SETTING_KEY = "ctas";
const ALLOWED_THEMES = new Set(["brand", "ink", "light", "amber"]);

interface Cta {
  id: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  theme: string;
  visible: boolean;
}

function newId(): string {
  return `cta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeItem(input: unknown, existingId?: string): Cta {
  const obj = (input ?? {}) as Record<string, unknown>;
  const theme =
    typeof obj.theme === "string" && ALLOWED_THEMES.has(obj.theme)
      ? obj.theme
      : "brand";
  return {
    id:
      typeof obj.id === "string" && obj.id.trim()
        ? sanitizeText(obj.id)
        : existingId ?? newId(),
    title: sanitizeText(String(obj.title ?? "")),
    description: sanitizeText(String(obj.description ?? "")),
    primaryLabel: sanitizeText(String(obj.primaryLabel ?? "")),
    primaryHref: sanitizeText(String(obj.primaryHref ?? "")),
    secondaryLabel: sanitizeText(String(obj.secondaryLabel ?? "")),
    secondaryHref: sanitizeText(String(obj.secondaryHref ?? "")),
    theme,
    visible: Boolean(obj.visible ?? true),
  };
}

async function loadItems(): Promise<Cta[]> {
  const row = await db.companySettings.findUnique({
    where: { key: SETTING_KEY },
  });
  const items = (row?.value as unknown as Cta[] | undefined) ?? [];
  return Array.isArray(items) ? items : [];
}

async function saveItems(items: Cta[]) {
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
    console.error("[admin] ctas GET failed:", msg.slice(0, 200));
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
      resource: "cta",
      resourceId: item.id,
      ip: getClientIp(req),
    });

    revalidateContent("ctas");
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] ctas POST failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to create CTA" }, { status: 500 });
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
      return NextResponse.json({ error: "CTA not found" }, { status: 404 });
    }
    items[idx] = patched;
    await saveItems(items);

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "cta",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("ctas");
    return NextResponse.json({ item: patched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] ctas PATCH failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to update CTA" }, { status: 500 });
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
      return NextResponse.json({ error: "CTA not found" }, { status: 404 });
    }
    await saveItems(next);

    await recordAudit({
      userId: user.id,
      action: "DELETE",
      resource: "cta",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("ctas");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] ctas DELETE failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to delete CTA" }, { status: 500 });
  }
}
