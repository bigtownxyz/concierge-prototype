#!/usr/bin/env node
/**
 * Invite a Due Diligence applicant.
 *
 * Usage:
 *   node scripts/invite-dd-applicant.mjs client@example.com
 *
 * What it does:
 *   1. Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *   2. Calls Supabase Auth Admin "invite" REST endpoint with a `redirect_to`
 *      pointing at our /initial-due-diligence/callback route.
 *   3. Logs the result. Supabase emails the applicant a magic link with
 *      `?code=...` so they land on the callback and can set their password.
 *
 * Notes:
 *   - Run this from the project root.
 *   - The redirect target host defaults to the vercel.app URL because DNS
 *     for thecitizenshipconcierge.com may not be live yet. Override with
 *     INVITE_REDIRECT_BASE if you want to invite via the public domain.
 *   - Add the redirect URL to Supabase Auth → URL Configuration → Redirect
 *     URLs allowlist BEFORE running this, or Supabase will refuse the invite.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) {
    console.error("✗ .env.local not found at", file);
    process.exit(1);
  }
  const text = fs.readFileSync(file, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
  return env;
}

async function main() {
  const email = process.argv[2];
  // Optional second arg lets you pre-seed the profile full_name. If absent,
  // we use a placeholder derived from the email — the existing handle_new_user
  // trigger requires profiles.full_name to be NOT NULL, and the applicant will
  // overwrite it on Step 1 of the wizard.
  const fullNameArg = process.argv[3];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(
      "Usage: node scripts/invite-dd-applicant.mjs <email> [\"Full Name\"]"
    );
    process.exit(1);
  }
  const fullName =
    fullNameArg && fullNameArg.trim()
      ? fullNameArg.trim()
      : email.split("@")[0].replace(/[._-]+/g, " ");

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL not set in .env.local");
    process.exit(1);
  }
  if (!key) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY not set in .env.local");
    process.exit(1);
  }

  // Default to the vercel.app URL because DNS for the public domain may not
  // be live yet. Override via INVITE_REDIRECT_BASE if needed.
  const redirectBase =
    process.env.INVITE_REDIRECT_BASE ||
    env.NEXT_PUBLIC_SITE_URL ||
    "https://concierge-proto1231.vercel.app";

  const redirectTo = `${redirectBase.replace(/\/+$/, "")}/initial-due-diligence/callback`;

  console.log(`→ Inviting  ${email}`);
  console.log(`→ Full name ${fullName} (placeholder — the wizard overwrites this)`);
  console.log(`→ Redirect  ${redirectTo}`);

  const res = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/invite`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      // `data` becomes raw_user_meta_data on auth.users. The existing
      // handle_new_user trigger reads full_name from here when seeding
      // public.profiles (NOT NULL constraint).
      data: {
        full_name: fullName,
        source: "dd-invite-script",
      },
      // app_metadata is server-only — applicants cannot edit it from the
      // browser. The middleware uses this flag to pin DD applicants to
      // /initial-due-diligence and prevent them from loading the
      // marketing site (no /results, /programs, etc.).
      app_metadata: {
        is_dd_applicant: true,
      },
      // Supabase reads `redirect_to` and verifies it against the allowlist.
      redirect_to: redirectTo,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("✗ Invite failed:", res.status, json);
    if (
      json?.msg?.toLowerCase().includes("not allowed") ||
      json?.error_description?.toLowerCase().includes("redirect")
    ) {
      console.error(
        "\nTip: add this redirect URL to Supabase Auth → URL Configuration → Redirect URLs:\n  " +
          redirectTo
      );
    }
    process.exit(1);
  }

  console.log("✓ Invite sent. Supabase user id:", json.id ?? "(see response below)");
  console.log(json);
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});
