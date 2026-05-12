import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Invite-link landing route.
 *
 * Supabase's Auth Admin "Invite user" flow emails the applicant a magic link
 * pointing here with `?code=...`. We exchange that code for a session, then
 * route them onward:
 *   - First-time invitee → /initial-due-diligence/set-password
 *   - Returning user → /initial-due-diligence (the wizard)
 *
 * Mirrors the pattern in app/[locale]/(auth)/callback/route.ts but skipped
 * the profile/qualification bootstrap — DD applicants are not leads in the
 * marketing funnel, they're already onboarded clients.
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/initial-due-diligence/set-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectTo);
    }
    console.error("[dd-callback] exchangeCodeForSession failed", error);
  }

  // Bad/expired link — send back to login with an error flag.
  return NextResponse.redirect(
    `${origin}/initial-due-diligence/login?error=auth`
  );
}
