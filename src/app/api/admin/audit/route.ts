import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden — superadmin required" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
