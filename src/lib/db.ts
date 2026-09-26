import { PrismaClient } from "@prisma/client";

/**
 * Prisma client initialization — Vercel/serverless compatible.
 *
 * CRITICAL: On Neon's connection pooler, prepared statements are cached
 * across serverless invocations. When the schema changes (e.g., TEXT →
 * JSONB column type), the cached plans become invalid and PostgreSQL
 * throws error 0A000 "cached plan must not change result type".
 *
 * FIX: We disable prepared statements when using a pooled connection
 * (Neon's `-pooler` URL or `pgbouncer=true` parameter). This forces
 * Prisma to re-plan every query, which is slightly slower but prevents
 * the cache invalidation error after schema migrations.
 *
 * Supports both PostgreSQL (production/Neon) and SQLite (local dev).
 */

function isValidDbUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("file:")
  );
}

function isPooledConnection(url: string): boolean {
  // Neon pooler URLs contain "-pooler" or have ?pgbouncer=true
  return (
    url.includes("-pooler") ||
    url.includes("pgbouncer=true") ||
    url.includes("mode=no-transaction")
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

  // At this point url is guaranteed to be a string (isValidDbUrl checks for it)
  const dbUrl = url as string;

  const log: ("query" | "error" | "warn")[] =
    process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn"];

  // Detect if we're using a pooled connection (Neon pooler, PgBouncer)
  const isPooled = isPooledConnection(dbUrl);

  // For pooled connections, add pgbouncer=true to the connection URL.
  // This prevents "cached plan must not change result type" errors after
  // schema migrations by ensuring Prisma doesn't use prepared statements.
  const connectionString = isPooled
    ? (dbUrl.includes("?")
        ? `${dbUrl}&pgbouncer=true&connect_timeout=15&pool_timeout=15`
        : `${dbUrl}?pgbouncer=true&connect_timeout=15&pool_timeout=15`)
    : dbUrl;

  // For pooled connections, disable prepared statements to prevent
  // "cached plan must not change result type" errors after schema changes.
  // This is the official Prisma + Neon recommendation.
  const client = new PrismaClient({
    log,
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  // On Vercel serverless, we need to handle the "cached plan" error
  // gracefully by reconnecting. Prisma 6.x doesn't auto-retry on this.
  // The $on('error') hook logs but doesn't retry — the retry happens
  // naturally on the next serverless invocation (fresh connection).
  client.$on("error", (e) => {
    console.error("[prisma] connection error:", e.message?.slice(0, 200));
  });

  return client;
}

// Singleton pattern — prevent multiple instances in dev (hot reload)
// In production (Vercel), each serverless invocation gets a fresh client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
