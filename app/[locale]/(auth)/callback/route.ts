import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bootstrapProfile } from "@/lib/supabase/profile-bootstrap";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${locale}/programs`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        await bootstrapProfile(supabase);
      } catch (profileError) {
        console.error("[callback] Failed to bootstrap profile", profileError);
      }

      // Redirect to the portal (or wherever "next" points)
      const redirectTo = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectTo);
    }
  }

  // If something went wrong, send to login with error flag
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
