import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const { status, checks } = await checkHealth();
  const httpStatus = status === "ok" ? 200 : 503;
  return NextResponse.json({ status, checks }, { status: httpStatus });
}
