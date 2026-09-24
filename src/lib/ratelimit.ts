import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Distributed rate limiting via Upstash Redis.
 *
 * PRODUCTION: Upstash Redis is REQUIRED. If UPSTASH_REDIS_REST_URL or
 * UPSTASH_REDIS_REST_TOKEN is missing, the application will NOT start
 * (enforced by env-validate.ts at startup).
 *
 * DEVELOPMENT: Falls back to an in-memory limiter when Upstash is not
 * configured. This is clearly a dev-only behavior — never used in production.
 */

const isProd = process.env.NODE_ENV === "production";
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let limiter: Ratelimit | null = null;
let loginLimiter: Ratelimit | null = null;

if (hasUpstash) {
  const redis = Redis.fromEnv();
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "allison:lead",
    analytics: true,
  });
  loginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "900 s"), // 5 attempts / 15 min
    prefix: "allison:login",
  });
}

// --- In-memory fallback (DEV ONLY — never used in production) ---
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function inMemoryLimited(identifier: string, max: number = RATE_MAX): boolean {
  const now = Date.now();
  const arr = (hits.get(identifier) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= max) {
    hits.set(identifier, arr);
    return true;
  }
  arr.push(now);
  hits.set(identifier, arr);
  return false;
}

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX = 5;
const loginHits = new Map<string, number[]>();

function inMemoryLoginLimited(identifier: string): boolean {
  const now = Date.now();
  const arr = (loginHits.get(identifier) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  if (arr.length >= LOGIN_MAX) {
    loginHits.set(identifier, arr);
    return true;
  }
  arr.push(now);
  loginHits.set(identifier, arr);
  return false;
}

export async function checkRateLimit(identifier: string): Promise<{ limited: boolean }> {
  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return { limited: !success };
  }
  if (isProd) {
    // This should never happen — env-validate.ts blocks startup.
    // But if it does, fail CLOSED (deny all) rather than silently allowing.
    console.error("[rate-limit] CRITICAL: Upstash not configured in production — denying request");
    return { limited: true };
  }
  return { limited: inMemoryLimited(identifier) };
}

export async function checkLoginRateLimit(identifier: string): Promise<{ limited: boolean }> {
  if (loginLimiter) {
    const { success } = await loginLimiter.limit(identifier);
    return { limited: !success };
  }
  if (isProd) {
    console.error("[rate-limit] CRITICAL: Upstash not configured in production — denying login");
    return { limited: true };
  }
  return { limited: inMemoryLoginLimited(identifier) };
}

export function getClientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "unknown";
}
