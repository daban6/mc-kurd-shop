import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage =
    pathname.endsWith("/dashboard/login") ||
    pathname.endsWith("/dashboard/login/");

  // Skip all middleware for dashboard login to avoid intlMiddleware redirect loop
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Protect all /[locale]/dashboard routes (except /dashboard/login)
  const isDashboard = /^\/[^/]+\/dashboard(\/|$)/.test(pathname);

  if (isDashboard && !isLoginPage) {
    const session = getSessionCookie(req);
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/en/dashboard/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/",
  ],
};
