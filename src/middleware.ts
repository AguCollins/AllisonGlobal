import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware — handles:
 *  1. Nonce-based CSP (per-request nonce for script-src)
 *  2. Admin route protection (redirects to /admin/login if no session)
 */

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
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
}

export async function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  // --- Admin route protection ---
  const { pathname } = request.nextUrl;
  // Expose the active pathname to downstream server components (via `headers()`)
  // so layouts can branch on the current URL without inspecting the URL on the client.
  requestHeaders.set("x-pathname", pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isAdminRoute && !isLoginPage) || isAdminApi) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static/|_next/image/|favicon.png|logo-emblem.png|logo.png|og-image.png|robots.txt|sitemap.xml).*)",
  ],
};
