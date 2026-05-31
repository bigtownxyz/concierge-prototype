import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require an active session (matched against path WITHOUT locale prefix)
const PROTECTED_PREFIXES = ["/portal", "/admin"];

// Public sub-routes inside /initial-due-diligence — anyone (no session) may
// reach these. Everything else under /initial-due-diligence requires a session.
const DD_PUBLIC_PATHS = new Set([
  "/initial-due-diligence/login",
  "/initial-due-diligence/callback",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DD applicant portal — lives outside the [locale] tree, runs Supabase
  // session refresh but NOT next-intl. Treat it the same on every host so
  // /initial-due-diligence works on both vercel.app AND
  // thecitizenshipconcierge.com (the holding-host rewrite below is bypassed).
  if (pathname.startsWith("/initial-due-diligence")) {
    const { supabaseResponse, user } = await updateSession(request);
    const isPublic = DD_PUBLIC_PATHS.has(pathname);
    if (!user && !isPublic) {
      const loginUrl = new URL("/initial-due-diligence/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Force password change on first sign-in for invited applicants.
    // app_metadata.must_change_password is stamped by the invite script and
    // cleared (via service-role API) once the applicant updates their pw.
    // The applicant cannot touch app_metadata from the browser, so this flag
    // can't be self-cleared.
    const mustChangePassword =
      (user?.app_metadata as { must_change_password?: boolean } | undefined)
        ?.must_change_password === true;
    if (
      user &&
      mustChangePassword &&
      pathname !== "/initial-due-diligence/set-password" &&
      !isPublic
    ) {
      return NextResponse.redirect(
        new URL("/initial-due-diligence/set-password", request.url)
      );
    }
    return supabaseResponse;
  }

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

  // 2. DD applicants are pinned to their portal. If a user with the
  //    app_metadata.is_dd_applicant flag tries to load any non-DD route,
  //    bounce them back to /initial-due-diligence. Prevents marketing-site
  //    bleed even if they paste in /login, /results, /programs, etc.
  //    app_metadata can only be set server-side (service role) — applicants
  //    cannot escape the flag from the browser.
  const isDdApplicant =
    (user?.app_metadata as { is_dd_applicant?: boolean } | undefined)
      ?.is_dd_applicant === true;
  if (isDdApplicant) {
    return NextResponse.redirect(
      new URL("/initial-due-diligence", request.url)
    );
  }

  // 3. Guard portal routes — redirect to /login with ?next= if no session
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
    // Exclude API, Next internals, and root metadata files (robots.txt,
    // sitemap.xml, llms.txt). Without excluding the metadata files, next-intl
    // rewrites them into the [locale] tree and they 404 instead of serving.
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mov|m4v)$).*)",
  ],
};
