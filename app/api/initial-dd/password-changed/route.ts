import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Clear the must_change_password flag on the authenticated user.
 *
 * Called by /initial-due-diligence/set-password after the applicant
 * successfully updates their password. Uses service-role to write
 * app_metadata (which the user themselves cannot touch from the browser).
 *
 * Required: an active Supabase session. The session's user.id is the
 * only identifier we trust — never read the id from the request body.
 */

export async function POST() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[password-changed] SUPABASE_SERVICE_ROLE_KEY not set");
    return NextResponse.json(
      { ok: false, error: "Server not configured." },
      { status: 500 }
    );
  }

  // Preserve existing app_metadata keys; just flip the flag off.
  const existing =
    (user.app_metadata as Record<string, unknown> | undefined) ?? {};
  const nextMeta = { ...existing, must_change_password: false };

  const admin = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: nextMeta,
  });
  if (error) {
    console.error("[password-changed] updateUserById failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not clear password-change flag." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
