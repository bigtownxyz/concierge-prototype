#!/usr/bin/env node
/**
 * Invite a Due Diligence applicant with a temporary password.
 *
 * Usage:
 *   node scripts/invite-dd-applicant.mjs client@example.com
 *   node scripts/invite-dd-applicant.mjs client@example.com "Real Name"
 *   node scripts/invite-dd-applicant.mjs client@example.com "Real Name" "ChosenTempPass!"
 *
 * What it does:
 *   1. Creates an auth user with the email + a temporary password (random by
 *      default, or supplied as the 3rd arg). The email is auto-confirmed so
 *      they can sign in immediately — no magic-link round-trip.
 *   2. Stamps app_metadata = { is_dd_applicant: true, must_change_password: true }
 *      so the middleware pins them to the DD portal AND forces a password
 *      change on first sign-in (their temp password becomes useless after).
 *   3. Seeds user_metadata.full_name so the existing handle_new_user trigger
 *      doesn't choke on the profiles NOT NULL constraint.
 *   4. Prints the three things you email to your client:
 *        Login URL · email · temporary password
 *
 * Send those three lines to your client over any channel (email, Telegram,
 * Signal, however). No URLs to prefetch, no one-time tokens that vendors
 * can consume by accident.
 *
 * If a user with that email already exists, run this with the `--reset`
 * flag (1st arg) to delete + recreate them first:
 *   node scripts/invite-dd-applicant.mjs --reset client@example.com
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

// Friendly 12-char password — readable but not guessable. Skips ambiguous
// chars (0/O, 1/l/I). Designed for "send in an email" usability.
function generateTempPassword() {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digit = "23456789";
  const symbol = "!@#$%^*+=";
  const all = upper + lower + digit + symbol;
  const pick = (set) => set[crypto.randomInt(0, set.length)];
  const chars = [pick(upper), pick(lower), pick(digit), pick(symbol)];
  for (let i = chars.length; i < 12; i++) chars.push(pick(all));
  // Fisher-Yates shuffle so the guaranteed-class chars aren't all at the start
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

async function findUser(url, headers, email) {
  let page = 1;
  while (true) {
    const r = await fetch(
      `${url}/auth/v1/admin/users?page=${page}&per_page=200`,
      { headers }
    );
    const j = await r.json();
    const list = j.users ?? [];
    const hit = list.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit;
    if (list.length < 200) return null;
    page++;
  }
}

async function deleteUser(url, headers, userId) {
  await fetch(`${url}/rest/v1/qualifications?user_id=eq.${userId}`, {
    method: "DELETE",
    headers,
  });
  await fetch(`${url}/rest/v1/due_diligence_submissions?user_id=eq.${userId}`, {
    method: "DELETE",
    headers,
  });
  const r = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers,
  });
  return r.status;
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args[0] === "--reset";
  const positional = reset ? args.slice(1) : args;
  const email = positional[0]?.toLowerCase();
  const fullNameArg = positional[1];
  const passwordArg = positional[2];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(
      'Usage: node scripts/invite-dd-applicant.mjs [--reset] <email> ["Full Name"] ["TempPass"]'
    );
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL not set in .env.local");
    process.exit(1);
  }
  if (!key) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY not set in .env.local");
    process.exit(1);
  }
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  // Login URL is canonical on the public domain. Override via INVITE_LOGIN_URL
  // if you want to send via the vercel.app URL for testing.
  const loginUrl =
    process.env.INVITE_LOGIN_URL ||
    `${(env.NEXT_PUBLIC_SITE_URL || "https://thecitizenshipconcierge.com").replace(/\/+$/, "")}/initial-due-diligence/login`;

  const fullName =
    fullNameArg?.trim() ||
    email.split("@")[0].replace(/[._-]+/g, " ");
  const tempPassword = passwordArg?.trim() || generateTempPassword();

  // Optional cleanup
  const existing = await findUser(url, headers, email);
  if (existing) {
    if (reset) {
      console.log(`→ --reset: deleting existing user ${existing.id}`);
      const status = await deleteUser(url, headers, existing.id);
      console.log(`  delete status: ${status}`);
    } else {
      console.error(
        `✗ User ${email} already exists (id ${existing.id}).\n` +
          `  Run with --reset as the first argument to wipe + reinvite:\n` +
          `    node scripts/invite-dd-applicant.mjs --reset ${email}`
      );
      process.exit(1);
    }
  }

  console.log(`→ Creating  ${email}`);
  console.log(`→ Full name ${fullName} (placeholder — wizard overwrites)`);

  const create = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password: tempPassword,
      // Confirm so they can log in without a verification round-trip
      email_confirm: true,
      // Trigger reads full_name from raw_user_meta_data
      user_metadata: { full_name: fullName, source: "dd-invite-script" },
      // Server-only flags the middleware reads
      app_metadata: {
        is_dd_applicant: true,
        must_change_password: true,
      },
    }),
  });

  if (!create.ok) {
    const body = await create.text();
    console.error("✗ Create user failed:", create.status, body);
    process.exit(1);
  }
  const user = await create.json();

  console.log("");
  console.log("════════════════════════════════════════════════════════════");
  console.log(" Send these three lines to your client:");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  URL:      ${loginUrl}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${tempPassword}`);
  console.log("════════════════════════════════════════════════════════════");
  console.log("");
  console.log("  On first sign-in, they'll be forced to set their own password");
  console.log("  before they can access the wizard.");
  console.log("");
  console.log(`  Supabase user id: ${user.id}`);
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});
