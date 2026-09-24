/**
 * Next.js instrumentation — runs once at application startup (before any
 * request is handled). Validates required environment variables.
 *
 * In production: fails hard if required variables are missing.
 * In development: warns but allows startup.
 */
export async function register() {
  const { validateEnvironment } = await import("@/lib/env-validate");
  validateEnvironment();
}
