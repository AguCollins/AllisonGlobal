/**
 * Global site settings — CompanySettings (key/value JSON) store.
 *
 * GET  /api/admin/settings              → { settings: Record<key, value> }
 * PUT  /api/admin/settings              → { ok: true }   body: { key, value }
 *
 * Reads are open to any admin; writes require superadmin (global site config).
 * Revalidates the public site root on every write so changes propagate.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Known setting keys (validation allowlist). */
const ALLOWED_KEYS = new Set([
  "company",
  "contact",
  "social",
  "founder",
  "footer",
  "stats",
  "navigation",
  "ctas",
  "process",
  "jobs",
  "legal_privacy",
  "legal_terms",
]);

/** Recursively sanitize all string values inside a JSON-like object. */
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

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db.companySettings.findMany();
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.value as unknown;
    }
    return NextResponse.json({ settings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] settings GET failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Database error" }, { status: 500 });
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
  if (!body || typeof body.key !== "string") {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  const { key, value } = body as { key: string; value: unknown };
  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: `Unknown settings key: ${key}` },
      { status: 400 },
    );
  }

  try {
    const sanitized = sanitizeValue(value);
    await db.companySettings.upsert({
      where: { key },
      create: {
        key,
        value: sanitized as import("@prisma/client").Prisma.InputJsonValue,
      },
      update: {
        value: sanitized as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "settings",
      resourceId: key,
      ip: getClientIp(req),
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] settings PUT failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
