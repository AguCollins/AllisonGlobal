/**
 * Production environment validation.
 *
 * In production (NODE_ENV=production), required environment variables MUST
 * exist. If any are missing, the application logs a clear error and exits.
 *
 * In development, missing variables produce a warning but do not block
 * startup (allows local dev without Neon/Upstash).
 *
 * NEVER prints secret values — only variable names.
 */

const REQUIRED_PROD_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const REQUIRED_PROD_REDIS_VARS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function validateEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];
  const warnings: string[] = [];

  if (isProd) {
    // Hard-fail in production
    for (const key of REQUIRED_PROD_VARS) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // Redis is required in production (no in-memory fallback)
    for (const key of REQUIRED_PROD_REDIS_VARS) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // DATABASE_URL must NOT be SQLite in production
    if (process.env.DATABASE_URL?.startsWith("file:")) {
      missing.push("DATABASE_URL (must be PostgreSQL, not SQLite)");
    }

    if (missing.length > 0) {
      // Cannot use process.exit in Edge Runtime (instrumentation).
      // Throw an error that prevents the app from starting.
      const errorMsg =
        "PRODUCTION STARTUP FAILED — Missing required environment variables: " +
        missing.join(", ") +
        ". Set these in your .env.local or deployment environment. See .env.example.";
      console.error("\n❌ " + errorMsg + "\n");
      throw new Error(errorMsg);
    }
  } else {
    // Development — warn only
    for (const key of REQUIRED_PROD_VARS) {
      if (!process.env[key]) {
        warnings.push(`${key} not set (OK for dev)`);
      }
    }
    for (const key of REQUIRED_PROD_REDIS_VARS) {
      if (!process.env[key]) {
        warnings.push(`${key} not set (using in-memory rate limiter)`);
      }
    }
    if (process.env.DATABASE_URL?.startsWith("file:")) {
      warnings.push("DATABASE_URL is SQLite (using static data fallback)");
    }
    if (warnings.length > 0) {
      console.warn(
        "⚠ Development mode — some production variables not set:\n" +
          warnings.map((w) => `  ${w}`).join("\n"),
      );
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}
