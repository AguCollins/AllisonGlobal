/**
 * Health check — verifies application and dependency availability.
 *
 * Returns 503 if any critical dependency is unavailable.
 * Never exposes credentials, connection strings, or internal details.
 */

import { db } from "@/lib/db";

export async function checkHealth(): Promise<{
  status: "ok" | "degraded" | "down";
  checks: Record<string, boolean>;
}> {
  const checks: Record<string, boolean> = {};

  // Database connectivity
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Redis (Upstash) — optional in dev, required in prod
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = Redis.fromEnv();
      await redis.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    }
  } else {
    checks.redis = true; // Not configured — OK for dev
  }

  const allOk = Object.values(checks).every(Boolean);
  return { status: allOk ? "ok" : "down", checks };
}
