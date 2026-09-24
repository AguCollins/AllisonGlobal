import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { checkLoginRateLimit } from "@/lib/ratelimit";
import type { NextRequest } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const rawReq = req as unknown as NextRequest;
        const ip = rawReq?.headers?.get?.("x-real-ip") ||
          (() => {
            const fwd = rawReq?.headers?.get?.("x-forwarded-for");
            if (fwd) {
              const parts = fwd.split(",").map((s) => s.trim());
              return parts[parts.length - 1] || "unknown";
            }
            return "unknown";
          })();

        // Rate limit login attempts (brute-force protection)
        const { limited } = await checkLoginRateLimit(`${email}:${ip}`);
        if (limited) {
          throw new Error("Too many login attempts. Please wait 15 minutes and try again.");
        }

        const user = await db.adminUser.findUnique({ where: { email } });

        if (!user || !user.active) {
          await recordAudit({ action: "LOGIN_FAILED", resource: "auth", metadata: { email }, ip });
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          await recordAudit({ userId: user.id, action: "LOGIN_FAILED", resource: "auth", ip });
          return null;
        }

        // Update lastLogin timestamp
        await db.adminUser.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        await recordAudit({ userId: user.id, action: "LOGIN", resource: "auth", ip });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: undefined,
      },
    },
  },
};

import { getServerSession } from "next-auth";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.user) return null;
  return session.user as { id: string; email: string; name: string; role: string };
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (!user || user.role !== "superadmin") return null;
  return user;
}
