import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { sendEmail } from "@/lib/email";

const ContactSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required.").max(100),
  email: z.email("A valid email address is required.").max(200),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Please include a few sentences.").max(5000),
  // Honeypot — must be empty. Bots fill it.
  website: z.string().max(0).optional().or(z.literal("")),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  // Silently drop honeypot hits — pretend success so the bot doesn't retry.
  if (parsed.data.website && parsed.data.website.length > 0) {
    console.warn(
      "[contact] honeypot triggered — submission dropped. Value:",
      parsed.data.website.slice(0, 80)
    );
    return NextResponse.json({ ok: true });
  }

  const { fullName, email, subject, message } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? null;

  // Best-effort: pull the signed-in user if the request has a valid session.
  let sessionUser: { id: string; email: string | null } | null = null;
  try {
    const ssr = await createServerSupabase();
    const { data } = await ssr.auth.getUser();
    if (data.user) {
      sessionUser = { id: data.user.id, email: data.user.email ?? null };
    }
  } catch {
    sessionUser = null;
  }

  // Service-role client — bypasses RLS, server-only. Inputs are validated
  // by the zod schema above, so this is safe.
  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[contact] SUPABASE_SERVICE_ROLE_KEY not set");
    return NextResponse.json(
      { ok: false, error: "Server is not configured to accept submissions yet." },
      { status: 500 }
    );
  }
  const supabase = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: inserted, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      user_id: sessionUser?.id ?? null,
      full_name: fullName,
      email,
      subject: subject || null,
      message,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[contact] insert failed", insertError);
    return NextResponse.json(
      { ok: false, error: "Could not save your message. Please try again." },
      { status: 500 }
    );
  }

  const notifyTo =
    process.env.CONTACT_NOTIFY_TO ||
    process.env.GMAIL_FROM ||
    process.env.GMAIL_USER;
  if (!notifyTo) {
    console.error("[contact] no notification address configured");
    return NextResponse.json({ ok: true });
  }

  const subjectLine = subject?.trim() || "(no subject)";
  const text = `New contact form message

Name:    ${fullName}
Email:   ${email}
Subject: ${subjectLine}
${sessionUser ? `User:    ${sessionUser.email ?? "(no email)"} (${sessionUser.id})\n` : ""}
Message:
${message}
`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
  <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">New contact form message</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 6px 0; color: #666; width: 90px;">Name</td><td style="padding: 6px 0;"><strong>${escapeHtml(fullName)}</strong></td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Subject</td><td style="padding: 6px 0;">${escapeHtml(subjectLine)}</td></tr>
    ${sessionUser ? `<tr><td style="padding: 6px 0; color: #666;">User</td><td style="padding: 6px 0;">${escapeHtml(sessionUser.email ?? "")}</td></tr>` : ""}
  </table>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(message)}</div>
  <p style="margin-top: 24px; font-size: 12px; color: #999;">Reply to this email to respond directly to ${escapeHtml(fullName)}.</p>
</div>`;

  try {
    await sendEmail({
      to: notifyTo,
      subject: `[Concierge] ${subjectLine} — ${fullName}`,
      text,
      html,
      replyTo: `"${fullName}" <${email}>`,
    });

    await supabase
      .from("contact_messages")
      .update({ notified: true })
      .eq("id", inserted.id);
  } catch (emailError) {
    const errMsg =
      emailError instanceof Error ? emailError.message : "Unknown email error";
    console.error("[contact] email send failed", emailError);
    await supabase
      .from("contact_messages")
      .update({ notify_error: errMsg })
      .eq("id", inserted.id);
    // Message is still saved — don't fail the user-facing request.
  }

  return NextResponse.json({ ok: true });
}
