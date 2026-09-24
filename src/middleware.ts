import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' https://www.ui.com data:`,
  `media-src 'self' https://www.ui.com`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `frame-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Resource-Policy": "same-site",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isAdminRoute && !isLoginPage) || isAdminApi) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      if (isAdminApi) {
        const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
        return res;
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) response.headers.set(k, v);
  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static/|_next/image/|favicon.png|logo-emblem.png|logo.png|og-image.png|robots.txt|sitemap.xml).*)"],
};