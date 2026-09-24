import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getClientIp, checkLoginRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters")
    .max(200)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit password change attempts (brute-force protection)
  const ip = getClientIp(req);
  const { limited } = await checkLoginRateLimit(`pwchange:${ip}`);
  if (limited) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  // Verify current password
  const adminUser = await db.adminUser.findUnique({ where: { id: user.id } });
  if (!adminUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
  if (!valid) {
    await recordAudit({
      userId: user.id,
      action: "LOGIN_FAILED",
      resource: "password",
      resourceId: user.id,
      ip,
    });
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  // Prevent same password
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 },
    );
  }

  // Hash and update
  const newHash = await bcrypt.hash(newPassword, 10);
  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await recordAudit({
    userId: user.id,
    action: "PASSWORD_CHANGE",
    resource: "user",
    resourceId: user.id,
    ip,
  });

  return NextResponse.json({ ok: true, message: "Password changed successfully" });
}
