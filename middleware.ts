import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require an active session (matched against path WITHOUT locale prefix)
const PROTECTED_PREFIXES = ["/portal"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the raw path for matching
  // e.g. /en/portal/dashboard -> /portal/dashboard
  const pathnameWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/|$)/, "") || "/";

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      pathnameWithoutLocale.startsWith(prefix + "/")
  );

  // 1. Refresh Supabase session on every request
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Guard portal routes — redirect to /login with ?next= if no session
  if (isProtected && !user) {
    // Determine the locale segment so we redirect to the right locale's login
    const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
    const localeSegment = localeMatch ? `/${localeMatch[1]}` : "";
    const loginUrl = new URL(`${localeSegment}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Run i18n middleware
  const intlResponse = intlMiddleware(request);

  // 4. Copy Supabase auth cookies into the i18n response so they are not lost
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      maxAge: cookie.maxAge,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
