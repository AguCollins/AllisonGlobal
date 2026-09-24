/**
 * Next.js instrumentation — runs once at application startup.
 *
 * In production: warns if required environment variables are missing.
 * Does NOT throw (which would crash the Vercel build). Instead, the
 * data-access layer and ratelimit layer handle missing config gracefully
 * at runtime — showing user-friendly error states or denying requests.
 *
 * This allows the build to succeed even before database credentials are
 * configured, while the runtime correctly reports errors.
 */
export async function register() {
  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  } else if (process.env.DATABASE_URL.startsWith("file:")) {
    if (isProd) missing.push("DATABASE_URL (must be PostgreSQL, not file:)");
  } else if (
    !process.env.DATABASE_URL.startsWith("postgresql://") &&
    !process.env.DATABASE_URL.startsWith("postgres://")
  ) {
    if (isProd) missing.push("DATABASE_URL (must be a postgresql:// URL)");
  }

  if (isProd) {
    if (!process.env.NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");
    if (!process.env.NEXT_PUBLIC_SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL");
    if (!process.env.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) missing.push("UPSTASH_REDIS_REST_TOKEN");
  }

  if (missing.length > 0) {
    const msg = `Configuration warning — missing: ${missing.join(", ")}. ` +
      `See .env.example. The app will start but some features may not work.`;
    if (isProd) {
      console.warn("⚠ " + msg);
    } else {
      console.warn("⚠ Development — " + msg);
    }
  }
}
