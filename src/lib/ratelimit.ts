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

/**
 * Extract the real client IP from a Request.
 *
 * On Vercel, the client IP is in `x-forwarded-for` (the FIRST entry —
 * each proxy appends to the end, so the first is the original client).
 * Vercel also sets `x-real-ip` to the client IP.
 *
 * The `x-vercel-forwarded-for` header is Vercel-specific and should be
 * preferred when present (it cannot be spoofed by the client).
 */
export function getClientIp(req: Request): string {
  return getClientIpFromHeaders(req.headers);
}

/** Extract client IP from a Headers object (works with any Request-like object). */
export function getClientIpFromHeaders(headers: Headers): string {
  // Vercel-specific header (most reliable on Vercel — set by the platform)
  const vercelFwd = headers.get("x-vercel-forwarded-for");
  if (vercelFwd && vercelFwd.trim()) {
    const parts = vercelFwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  // Standard x-forwarded-for (first entry = original client)
  const fwd = headers.get("x-forwarded-for");
  if (fwd && fwd.trim()) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  // x-real-ip (set by some proxies — single IP, not a list)
  const real = headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();
  return "unknown";
}

/**
 * Extract client IP from a NextRequest or similar object with a `.headers` property.
 * Used by NextAuth's authorize() callback where `req` is a NextRequest.
 */
export function getClientIpFromRequest(req: { headers?: Headers | Record<string, string | string[] | undefined> }): string {
  if (!req?.headers) return "unknown";
  // NextRequest.headers is a Headers object with .get()
  if (typeof (req.headers as Headers).get === "function") {
    return getClientIpFromHeaders(req.headers as Headers);
  }
  // Fallback for plain Record<string, string> headers
  const h = req.headers as Record<string, string | string[] | undefined>;
  const vercelFwd = h["x-vercel-forwarded-for"];
  if (typeof vercelFwd === "string" && vercelFwd.trim()) {
    return vercelFwd.split(",")[0].trim();
  }
  const fwd = h["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.trim()) {
    return fwd.split(",")[0].trim();
  }
  const real = h["x-real-ip"];
  if (typeof real === "string" && real.trim()) {
    return real.trim();
  }
  return "unknown";
}
