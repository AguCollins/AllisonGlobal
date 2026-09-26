/**
 * Legal documents editor — single-document PUT/GET per type.
 *
 * GET  /api/admin/legal/privacy  → { document: LegalDoc }
 * GET  /api/admin/legal/terms    → { document: LegalDoc }
 * PUT  /api/admin/legal/privacy  → { ok: true }  body: LegalDoc
 * PUT  /api/admin/legal/terms    → { ok: true }  body: LegalDoc
 *
 * Reads open to any admin; writes require superadmin.
 *
 * Stored in CompanySettings under keys "legal_privacy" and "legal_terms".
 *
 * `LegalDoc = { title, intro, updated, sections: [{ heading, body: string[] }] }`
 */
import { NextResponse } from "next/server";
import { revalidateContent } from "@/lib/revalidate";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  privacy: "legal_privacy",
  terms: "legal_terms",
};

interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalDoc {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

function sanitizeDoc(input: unknown): LegalDoc {
  const obj = (input ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(obj.sections)
    ? obj.sections.map((raw) => {
        const s = (raw ?? {}) as Record<string, unknown>;
        const body = Array.isArray(s.body)
          ? s.body.map((b) => sanitizeText(String(b))).filter(Boolean)
          : typeof s.body === "string"
            ? sanitizeText(s.body)
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean)
            : [];
        return {
          heading: sanitizeText(String(s.heading ?? "")),
          body,
        };
      })
    : [];
  return {
    title: sanitizeText(String(obj.title ?? "")),
    intro: sanitizeText(String(obj.intro ?? "")),
    updated: sanitizeText(String(obj.updated ?? "")),
    sections,
  };
}

interface RouteContext {
  params: Promise<{ type: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await ctx.params;
  const key = TYPES[type];
  if (!key) {
    return NextResponse.json({ error: "Unknown legal type" }, { status: 400 });
  }

  try {
    const row = await db.companySettings.findUnique({ where: { key } });
    const document = (row?.value as unknown as LegalDoc | undefined) ?? null;
    return NextResponse.json({ document });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[admin] legal/${type} GET failed:`, msg.slice(0, 200));
    return NextResponse.json({ document: null });
  }
}

export async function PUT(req: Request, ctx: RouteContext) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden — superadmin required" },
      { status: 403 },
    );
  }

  const { type } = await ctx.params;
  const key = TYPES[type];
  if (!key) {
    return NextResponse.json({ error: "Unknown legal type" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const document = sanitizeDoc(body);

  try {
    await db.companySettings.upsert({
      where: { key },
      create: {
        key,
        value: document as unknown as string,
      },
      update: {
        value: document as unknown as string,
      },
    });

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "legal",
      resourceId: key,
      metadata: { sections: document.sections.length },
      ip: getClientIp(req),
    });

    revalidateContent(type === "privacy" ? "legal-privacy" : "legal-terms");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[admin] legal/${type} PUT failed:`, msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
