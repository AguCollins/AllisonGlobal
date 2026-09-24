import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only enable verbose query logging in development — production should not
// log query args (they may contain user PII from the Lead model).
const log: ("query" | "error" | "warn")[] =
  process.env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "error", "warn"];

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
