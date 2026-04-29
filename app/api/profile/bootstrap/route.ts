import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { bootstrapProfile } from "@/lib/supabase/profile-bootstrap";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      accessToken?: string;
      full_name?: string;
      email?: string;
      phone?: string;
      country?: string;
      nationality?: string;
    };

    if (body.accessToken) {
      const { url, anonKey } = getSupabaseConfig();
      const supabase = createSupabaseClient(url, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${body.accessToken}`,
          },
        },
      });

      await bootstrapProfile(supabase, body);
    } else {
      const supabase = await createClient();
      await bootstrapProfile(supabase, body);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to bootstrap profile",
      },
      { status: 400 }
    );
  }
}
