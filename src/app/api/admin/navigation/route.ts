/**
 * Navigation management — structured { main, utility, legal } shape.
 *
 * GET  /api/admin/navigation          → { main, utility, legal }
 * PUT  /api/admin/navigation          → { ok: true }   body: { main, utility, legal }
 *
 * Reads open to any admin; writes require superadmin.
 * Stored as a JSON object in CompanySettings under key "navigation".
 *
 * The public reader getNavigation() expects { main, utility, legal } —
 * this API matches that shape exactly so admin changes propagate.
 */
import { NextResponse } from "next/server";
import { revalidateContent } from "@/lib/revalidate";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json-helpers";

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

interface NavStructure {
  main: NavItem[];
  utility: NavItem[];
  legal: NavItem[];
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

function sanitizeGroup(items: unknown): NavItem[] {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeItem).filter((i) => i.label && i.href);
}

function sanitizeStructure(body: unknown): NavStructure {
  const obj = (body ?? {}) as Record<string, unknown>;
  return {
    main: sanitizeGroup(obj.main),
    utility: sanitizeGroup(obj.utility),
    legal: sanitizeGroup(obj.legal),
  };
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const row = await db.companySettings.findUnique({
      where: { key: SETTING_KEY },
    });
    const stored = parseJson<Record<string, unknown>>(row?.value, {});
    const structure: NavStructure = {
      main: Array.isArray(stored.main) ? sanitizeGroup(stored.main) : [],
      utility: Array.isArray(stored.utility) ? sanitizeGroup(stored.utility) : [],
      legal: Array.isArray(stored.legal) ? sanitizeGroup(stored.legal) : [],
    };
    return NextResponse.json(structure);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] navigation GET failed:", msg.slice(0, 200));
    return NextResponse.json({ main: [], utility: [], legal: [] });
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
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Expected { main, utility, legal } object" },
      { status: 400 },
    );
  }

  const structure = sanitizeStructure(body);

  try {
    await db.companySettings.upsert({
      where: { key: SETTING_KEY },
      create: {
        key: SETTING_KEY,
        value: structure as unknown as string,
      },
      update: {
        value: structure as unknown as string,
      },
    });

    const totalCount =
      structure.main.length + structure.utility.length + structure.legal.length;
    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "navigation",
      resourceId: SETTING_KEY,
      metadata: { count: totalCount },
      ip: getClientIp(req),
    });

    revalidateContent("navigation");

    return NextResponse.json({ ok: true, ...structure });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] navigation PUT failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to save navigation" }, { status: 500 });
  }
}
