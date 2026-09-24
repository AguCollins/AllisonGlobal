import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { getClientIp } from "@/lib/ratelimit";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";

/** Wrapper for admin API routes — checks auth and optionally role. */
export function withAdmin(
  handler: (req: Request, ctx: { user: { id: string; email: string; name: string; role: string }; ip: string }) => Promise<NextResponse>,
  options?: { superadminOnly?: boolean },
) {
  return async (req: Request) => {
    const user = options?.superadminOnly ? await requireSuperAdmin() : await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ip = getClientIp(req);
    return handler(req, { user, ip });
  };
}

export { db, NextResponse, recordAudit };
