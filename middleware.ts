import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require an active session (matched against path WITHOUT locale prefix)
const PROTECTED_PREFIXES = ["/portal", "/admin"];

// Hosts that should show the coming-soon holding page instead of the full app.
// Lowercase, no port. The full app stays accessible on the vercel.app URL.
// Delete this block (and the early-return below) to flip the new domain live.
const HOLDING_HOSTS = new Set([
  "thecitizenshipconcierge.com",
  "www.thecitizenshipconcierge.com",
]);

export async function middleware(request: NextRequest) {
  // Holding-page short-circuit: on the public domain, rewrite every path to
  // /coming-soon. Skip locale routing and Supabase session refresh entirely —
  // there's nothing on the holding page that needs them.
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  if (HOLDING_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.rewrite(url);
  }

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
    // Exclude /coming-soon so the holding page renders cleanly without
    // re-entering locale routing (which would redirect to /en/coming-soon).
    "/((?!api|_next/static|_next/image|favicon.ico|coming-soon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
