import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { revalidateContent } from "@/lib/revalidate";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ───────────────────────── Allowlists ─────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const ALLOWED_CATEGORIES = new Set([
  "general",
  "hero",
  "service",
  "project",
  "blog",
  "team",
  "branding",
]);

const ALLOWED_PATCH_FIELDS = new Set(["altText", "caption", "category", "title", "folder"]);

// ───────────────────────── GET ─────────────────────────

export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("q") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);

  if (category && !ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { filename: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.media.count({ where }),
    ]);
    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] media GET failed:", msg.slice(0, 200));
    return NextResponse.json(
      { items: [], total: 0, error: "Database error" },
      { status: 500 },
    );
  }
}

// ───────────────────────── POST ─────────────────────────

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const url = sanitizeText(String(b.url ?? ""));
  const filename = sanitizeText(String(b.filename ?? ""));
  const mimeType = sanitizeText(String(b.mimeType ?? ""));
  const altText = sanitizeText(String(b.altText ?? ""));
  const caption = b.caption ? sanitizeText(String(b.caption)) : null;
  const category = sanitizeText(String(b.category ?? "general")) || "general";
  const folder = sanitizeText(String(b.folder ?? category)) || category;

  // Cloudinary-specific fields (optional — null for manual URL entries)
  const publicId = b.publicId ? sanitizeText(String(b.publicId)) : null;
  const originalUrl = b.originalUrl ? sanitizeText(String(b.originalUrl)) : null;
  const format = b.format ? sanitizeText(String(b.format)) : null;
  const title = b.title ? sanitizeText(String(b.title)) : null;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }
  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported MIME type: ${mimeType}` },
      { status: 400 },
    );
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: `Invalid category: ${category}` },
      { status: 400 },
    );
  }

  const size = Number(b.size ?? 0);
  if (!Number.isFinite(size) || size < 0) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  }

  // Max file size: 10MB (stored as metadata — actual upload goes to Cloudinary)
  if (size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 },
    );
  }

  const width = b.width != null ? Number(b.width) : null;
  const height = b.height != null ? Number(b.height) : null;

  try {
    const created = await db.media.create({
      data: {
        url,
        publicId,
        originalUrl,
        filename,
        mimeType,
        format,
        size,
        width: width != null && Number.isFinite(width) ? width : null,
        height: height != null && Number.isFinite(height) ? height : null,
        altText,
        caption,
        title,
        folder,
        category,
      },
    });

    await recordAudit({
      userId: user.id,
      action: "CREATE",
      resource: "media",
      resourceId: created.id,
      ip: getClientIp(req),
    });

    revalidateContent("media");

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] media POST failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}

// ───────────────────────── PATCH ─────────────────────────

export async function PATCH(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const id = String(b.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const key of ALLOWED_PATCH_FIELDS) {
    if (key in b) {
      const v = b[key];
      if (key === "category" || key === "folder") {
        const val = sanitizeText(String(v ?? ""));
        if (!ALLOWED_CATEGORIES.has(val)) {
          return NextResponse.json(
            { error: `Invalid ${key}: ${val}` },
            { status: 400 },
          );
        }
        data[key] = val;
      } else {
        data[key] = v == null ? null : sanitizeText(String(v));
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const updated = await db.media.update({ where: { id }, data });

    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      resource: "media",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("media");

    return NextResponse.json({ item: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] media PATCH failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

// ───────────────────────── DELETE ─────────────────────────

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
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    // Fetch the media record first (to get publicId for Cloudinary cleanup)
    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Cloudinary if it has a publicId
    if (media.publicId) {
      const { deleteCloudinaryAsset } = await import("@/lib/cloudinary");
      await deleteCloudinaryAsset(media.publicId).catch(() => null);
    }

    await db.media.delete({ where: { id } });

    await recordAudit({
      userId: user.id,
      action: "DELETE",
      resource: "media",
      resourceId: id,
      ip: getClientIp(req),
    });

    revalidateContent("media");

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] media DELETE failed:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
