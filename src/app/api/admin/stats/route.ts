import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalLeads, newLeads, recentLeads, totalServices, totalPosts, totalUsers] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "new" } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, type: true, status: true, createdAt: true } }),
    db.service.count(),
    db.blogPost.count(),
    db.adminUser.count(),
  ]);

  return NextResponse.json({
    stats: { totalLeads, newLeads, totalServices, totalPosts, totalUsers },
    recentLeads,
  });
}
