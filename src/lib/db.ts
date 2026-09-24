import { PrismaClient } from "@prisma/client";

/**
 * Prisma client initialization — Vercel/serverless compatible.
 *
 * PROBLEM: Prisma validates DATABASE_URL against the schema provider at
 * import time. If the schema says "postgresql" but the env var is a
 * SQLite `file:` path (or missing), Prisma throws immediately —
 * crashing the build.
 *
 * SOLUTION: Only instantiate PrismaClient when DATABASE_URL is a valid
 * PostgreSQL URL. In development without a DB, return a no-op proxy that
 * throws controlled errors (caught by data-access.ts) instead of crashing
 * at import time.
 */

function isValidPostgresUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

function createSafeProxy(): PrismaClient {
  // A proxy that throws a clear error on any method access, instead of
  // crashing at import time. The data-access layer catches these.
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === "$queryRaw" || prop === "$executeRaw") {
        return async () => {
          throw new Error("Database not configured (DATABASE_URL is not a PostgreSQL URL)");
        };
      }
      if (prop === "$connect" || prop === "$disconnect") {
        return async () => {};
      }
      if (typeof prop === "string") {
        return new Proxy({}, {
          get(_t, p) {
            if (p === "then") return undefined; // Not a promise
            return async () => {
              throw new Error(`Database not configured — cannot call ${prop}.${String(p)}`);
            };
          },
        });
      }
      return undefined;
    },
  };

  return new Proxy({} as Record<string, unknown>, handler) as unknown as PrismaClient;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  // If no valid PostgreSQL URL, return a safe proxy (no crash)
  if (!isValidPostgresUrl(url)) {
    if (process.env.NODE_ENV === "production" && url) {
      // In production with a non-PostgreSQL URL — this is a misconfiguration
      console.error(
        "[database] DATABASE_URL is not a PostgreSQL URL. " +
        "Set it to your Neon connection string (postgresql://...). " +
        "See .env.example for details.",
      );
    }
    return createSafeProxy();
  }

  // Valid PostgreSQL URL — create real PrismaClient
  const log: ("query" | "error" | "warn")[] =
    process.env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "error", "warn"];

  return new PrismaClient({ log });
}

// Singleton pattern — prevent multiple instances in dev (hot reload)
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
