import { PrismaClient } from "@prisma/client";

/**
 * Prisma client initialization — Vercel/serverless compatible.
 *
 * Supports both PostgreSQL (production/Neon) and SQLite (local dev).
 * In production with a valid PostgreSQL DATABASE_URL, a real PrismaClient
 * is created. In dev with a SQLite `file:` URL, a real PrismaClient is
 * also created (SQLite works in Node.js without a separate server).
 *
 * Only when DATABASE_URL is missing entirely or is an unsupported format
 * does this return a safe proxy that throws controlled errors.
 */

function isValidDbUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("file:")
  );
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

  if (!isValidDbUrl(url)) {
    return createSafeProxy();
  }

  const log: ("query" | "error" | "warn")[] =
    process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn"];

  return new PrismaClient({ log });
}

// Singleton pattern — prevent multiple instances in dev (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
