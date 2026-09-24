import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

  const users = await db.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

const createSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().min(2).max(120),
  password: z.string().min(12, "Password must be at least 12 characters"),
  role: z.enum(["admin", "superadmin"]).default("admin"),
});

export async function POST(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });

  const { email, name, password, role } = parsed.data;
  const existing = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await db.adminUser.create({
    data: { email: email.toLowerCase(), name, passwordHash, role },
    select: { id: true, email: true, name: true, role: true },
  });

  await recordAudit({ userId: user.id, action: "CREATE", resource: "user", resourceId: newUser.id, metadata: { email, role }, ip: getClientIp(req) });
  return NextResponse.json({ user: newUser }, { status: 201 });
}

const updateSchema = z.object({
  id: z.string(),
  role: z.enum(["admin", "superadmin"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });

  const { id, role, active } = parsed.data;

  // Prevent self-demotion / self-deactivation
  if (id === user.id && (role === "admin" || active === false)) {
    return NextResponse.json({ error: "Cannot demote or deactivate yourself" }, { status: 400 });
  }

  const updated = await db.adminUser.update({
    where: { id },
    data: { ...(role ? { role } : {}), ...(active !== undefined ? { active } : {}) },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  await recordAudit({ userId: user.id, action: "ROLE_CHANGE", resource: "user", resourceId: id, metadata: { role, active }, ip: getClientIp(req) });
  return NextResponse.json({ user: updated });
}

export async function DELETE(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await db.adminUser.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", resource: "user", resourceId: id, ip: getClientIp(req) });
  return NextResponse.json({ ok: true });
}
