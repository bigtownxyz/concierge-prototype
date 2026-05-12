import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { sendEmail } from "@/lib/email";

/**
 * Finalize a DD submission.
 *
 * POST /api/initial-dd/submit
 *
 * Requires a Supabase session. Sets submitted_at + IP/user-agent on the
 * applicant's row, then emails admin@learningcrypto.com (or whatever
 * CONTACT_NOTIFY_TO is set to) so the advisor is alerted.
 *
 * After submitted_at is set, RLS on due_diligence_submissions makes the
 * row read-only — applicant cannot edit further from the browser. This
 * route runs with the user's session client first to enforce ownership,
 * then escalates to service-role only to send the notification email.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString("en-US")}`;
}

function fmtBool(v: boolean | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return v ? "Yes" : "No";
}

export async function POST(request: Request) {
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

  // Pull a fresh copy of the row — and confirm not already submitted.
  const { data: row, error: fetchError } = await supabase
    .from("due_diligence_submissions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json(
      { ok: false, error: "No application found." },
      { status: 404 }
    );
  }

  if (row.submitted_at) {
    return NextResponse.json(
      { ok: false, error: "Application already submitted." },
      { status: 409 }
    );
  }

  // Capture IP + UA (Vercel sets x-forwarded-for; fall back to remote-addr).
  const xff = request.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : null;
  const ua = request.headers.get("user-agent") ?? null;

  // Mark submitted via the user's session — RLS WITH CHECK requires
  // submitted_at IS NULL in the predicate, so this update succeeds exactly
  // once. Any concurrent attempt sees the row already submitted and 0-affects.
  const submitted_at = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("due_diligence_submissions")
    .update({
      submitted_at,
      submitter_ip: ip,
      submitter_user_agent: ua,
    })
    .eq("user_id", user.id)
    .is("submitted_at", null);

  if (updateError) {
    console.error("[initial-dd/submit] mark-submitted failed", updateError);
    return NextResponse.json(
      { ok: false, error: "Could not finalize submission." },
      { status: 500 }
    );
  }

  // ── Notification email ──────────────────────────────────────────────────
  const notifyTo =
    process.env.CONTACT_NOTIFY_TO ||
    process.env.GMAIL_FROM ||
    process.env.GMAIL_USER;

  if (!notifyTo) {
    console.error("[initial-dd/submit] no notification address configured");
    // The submission is saved — don't fail the user-facing flow over email.
    return NextResponse.json({ ok: true });
  }

  // Service-role client to ensure we always render the email even if RLS
  // rules around storage signed URLs etc. evolve later.
  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let passportUrl: string | null = null;
  if (serviceKey && row.passport_file_path) {
    try {
      const admin = createSupabaseClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: signed } = await admin.storage
        .from("dd-passports")
        .createSignedUrl(row.passport_file_path, 60 * 60 * 24 * 7); // 7 days
      passportUrl = signed?.signedUrl ?? null;
    } catch (e) {
      console.error("[initial-dd/submit] signed-url failed", e);
    }
  }

  const fullName = [row.first_name, row.middle_name, row.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || "(name not provided)";

  const subject = `[Concierge] DD submitted — ${fullName}`;

  const additionalApplicants: { name?: string; relationship?: string }[] =
    Array.isArray(row.additional_applicants) ? row.additional_applicants : [];

  const text = `Initial Due Diligence submitted

Applicant: ${fullName}
Email:     ${user.email ?? "(unknown)"}
Submitted: ${submitted_at}
IP:        ${ip ?? "(unknown)"}

— START
Date of birth:          ${row.date_of_birth ?? "—"}
Country of birth:       ${row.country_of_birth ?? "—"}
Government birth cert:  ${fmtBool(row.has_government_birth_certificate)}
Address:                ${[row.address_street, row.address_city, row.address_state, row.address_postcode, row.address_country].filter(Boolean).join(", ") || "—"}
Marital status:         ${row.marital_status ?? "—"}

— PASSPORT
Issuing country:        ${row.passport_issuing_country ?? "—"}
Passport file:          ${passportUrl ? "see signed link in HTML email" : (row.passport_file_path ?? "—")}

— APPLICANTS
Sole applicant:         ${fmtBool(row.is_sole_applicant)}
${additionalApplicants.length > 0
  ? additionalApplicants.map((a, i) => `  ${i + 1}. ${a.name ?? "(no name)"} — ${a.relationship ?? "(no relationship)"}`).join("\n")
  : "(none)"}

— FUNDS
Employment status:      ${row.employment_status ?? "—"}
Source of funds:        ${row.funds_source ?? "—"}
Investment method:      ${row.investment_method ?? "—"}

— NET WORTH (USD)
Bank/savings:           ${fmtMoney(row.nw_bank_savings)}
Investments:            ${fmtMoney(row.nw_investments)}
Real estate:            ${fmtMoney(row.nw_real_estate)}
Business assets:        ${fmtMoney(row.nw_business_assets)}
Crypto:                 ${fmtMoney(row.nw_crypto)}
Notes:                  ${row.nw_notes ?? "—"}

— SECURITY
Visa/permit/citizenship denied:  ${fmtBool(row.security_visa_denied)}
Subject of criminal inv.:        ${fmtBool(row.security_criminal_investigation)}
Considered security threat:      ${fmtBool(row.security_threat)}
Communicable disease in appl.:   ${fmtBool(row.security_communicable_disease)}
Prior CBI application:           ${fmtBool(row.security_prior_cbi_application)}

— POLICE RECORDS
${row.police_records_notes ?? "(no notes)"}
`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 0 auto; padding: 32px; color: #111;">
  <p style="margin: 0 0 4px; color: #8f9095; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;">Concierge · Initial Due Diligence</p>
  <h2 style="margin: 0 0 24px; font-size: 22px; font-weight: 600;">${escapeHtml(fullName)} — submitted</h2>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
    <tr><td style="padding: 6px 0; color: #666; width: 140px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(user.email ?? "")}">${escapeHtml(user.email ?? "")}</a></td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Submitted</td><td style="padding: 6px 0;">${escapeHtml(submitted_at)}</td></tr>
    <tr><td style="padding: 6px 0; color: #666;">IP</td><td style="padding: 6px 0;">${escapeHtml(ip ?? "(unknown)")}</td></tr>
    ${passportUrl ? `<tr><td style="padding: 6px 0; color: #666;">Passport</td><td style="padding: 6px 0;"><a href="${escapeHtml(passportUrl)}">Download (signed link, 7-day expiry)</a></td></tr>` : ""}
  </table>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.6; color: #222; background: #f7f8fa; padding: 20px; border-radius: 8px;">${escapeHtml(text)}</pre>

  <p style="margin-top: 24px; font-size: 12px; color: #999;">Full data is also available in Supabase: due_diligence_submissions row id ${escapeHtml(row.id)}.</p>
</div>`;

  try {
    await sendEmail({
      to: notifyTo,
      subject,
      text,
      html,
    });
  } catch (e) {
    // Log but don't fail — applicant has already submitted.
    console.error("[initial-dd/submit] notification email failed", e);
  }

  return NextResponse.json({ ok: true });
}
