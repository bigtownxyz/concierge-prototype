import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

const NewsletterSchema = z.object({
  email: z.email("A valid email address is required.").max(200),
  source: z.string().trim().max(50).optional(),
  // Honeypot — bots will fill this; humans won't see it.
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = NewsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  // Honeypot hit — pretend success so the bot doesn't retry.
  if (parsed.data.website && parsed.data.website.length > 0) {
    console.warn("[newsletter] honeypot triggered — submission dropped.");
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const source = parsed.data.source?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") ?? null;

  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[newsletter] SUPABASE_SERVICE_ROLE_KEY not set");
    return NextResponse.json(
      { ok: false, error: "Server is not configured to accept subscriptions yet." },
      { status: 500 }
    );
  }
  const supabase = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email,
      source,
      user_agent: userAgent,
    });

  if (insertError) {
    // Duplicate email — treat as success so we don't reveal who's subscribed
    // and so the user gets the same confirmation either way.
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    console.error("[newsletter] insert failed", insertError);
    return NextResponse.json(
      { ok: false, error: "Could not save your subscription. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
