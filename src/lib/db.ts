import { PrismaClient } from "@prisma/client";

/**
 * Prisma client initialization — Vercel/serverless compatible.
 *
 * Only creates a real PrismaClient when DATABASE_URL is a valid
 * PostgreSQL URL. Otherwise returns a safe proxy that throws
 * controlled errors (caught by data-access layer).
 *
 * IMPORTANT: The global singleton is only used in development.
 * In production, a new client is created per serverless invocation
 * (Vercel handles this efficiently with connection pooling).
 */

function isValidPostgresUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

function createSafeProxy(): PrismaClient {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === "$queryRaw" || prop === "$executeRaw") {
        return async () => {
          throw new Error("Database not configured");
        };
      }
      if (prop === "$connect" || prop === "$disconnect") {
        return async () => {};
      }
      if (typeof prop === "string") {
        return new Proxy({}, {
          get(_t, p) {
            if (p === "then") return undefined;
            if (p === "toJSON") return undefined;
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

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!isValidPostgresUrl(url)) {
    return createSafeProxy();
  }

  const log: ("query" | "error" | "warn")[] =
    process.env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "error", "warn"];

  return new PrismaClient({ log });
}

// Singleton pattern — prevent multiple instances in dev (hot reload)
// In production (Vercel), each invocation gets a fresh client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
