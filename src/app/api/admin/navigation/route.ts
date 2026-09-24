/**
 * Navigation management — full-array replace pattern.
 *
 * GET  /api/admin/navigation          → { items: NavItem[] }
 * PUT  /api/admin/navigation          → { ok: true }   body: NavItem[]
 *
 * Reads open to any admin; writes (full array replace) require superadmin.
 * Stored as a single JSON array in CompanySettings under key "navigation".
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SETTING_KEY = "navigation";
const ALLOWED_TYPES = new Set(["link", "dropdown", "cta"]);

interface NavItem {
  id: string;
  label: string;
  href: string;
  type: string;
  visible: boolean;
  openInNewTab: boolean;
  order: number;
}

function sanitizeItem(item: unknown): NavItem {
  const obj = (item ?? {}) as Record<string, unknown>;
  const type =
    typeof obj.type === "string" && ALLOWED_TYPES.has(obj.type)
      ? obj.type
      : "link";
  return {
    id:
      typeof obj.id === "string" && obj.id.trim()
        ? sanitizeText(obj.id)
        : `nav-${Math.random().toString(36).slice(2, 10)}`,
    label: sanitizeText(String(obj.label ?? "")),
    href: sanitizeText(String(obj.href ?? "")),
    type,
    visible: Boolean(obj.visible ?? true),
    openInNewTab: Boolean(obj.openInNewTab ?? false),
    order: Number.isFinite(obj.order as number) ? Number(obj.order) : 0,
  };
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const row = await db.companySettings.findUnique({
      where: { key: SETTING_KEY },
    });
    const items = (row?.value as unknown as NavItem[] | undefined) ?? [];
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] navigation GET failed:", msg.slice(0, 200));
    return NextResponse.json({ items: [] });
  }
}

export async function PUT(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden — superadmin required" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array of nav items" }, { status: 400 });
  }

  const items = body.map(sanitizeItem);

  try {
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

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "navigation",
      resourceId: SETTING_KEY,
      metadata: { count: items.length },
      ip: getClientIp(req),
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] navigation PUT failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to save navigation" }, { status: 500 });
  }
}
