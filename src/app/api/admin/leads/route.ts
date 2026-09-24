import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("q") || undefined;

  const where = search ? {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { subject: { contains: search, mode: "insensitive" as const } },
    ],
  } : {};

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, type: true, name: true, email: true, phone: true, company: true, subject: true, status: true, createdAt: true, services: true, message: true },
    }),
    db.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "qualified", "won", "lost"]).optional(),
});

export async function PATCH(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });

  const { id, status } = parsed.data;
  const lead = await db.lead.update({ where: { id }, data: { ...(status ? { status } : {}) }, select: { id: true, name: true, status: true } });
  await recordAudit({ userId: user.id, action: "STATUS_CHANGE", resource: "lead", resourceId: id, metadata: { status }, ip: getClientIp(req) });
  return NextResponse.json({ lead });
}

export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await db.lead.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", resource: "lead", resourceId: id, ip: getClientIp(req) });
  return NextResponse.json({ ok: true });
}
