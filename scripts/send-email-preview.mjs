// One-off: send a rendered Supabase email template to a test address.
// Reads .env.local for Gmail SMTP creds, substitutes {{ .ConfirmationURL }}
// with a preview link, sends. Run with: node scripts/send-email-preview.mjs

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load .env.local manually (no dotenv dependency)
const envFile = await readFile(resolve(projectRoot, ".env.local"), "utf8");
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}

const TO = process.argv[2];
const TEMPLATE = process.argv[3] ?? "confirm-signup";

if (!TO) {
  console.error("Usage: node scripts/send-email-preview.mjs <recipient> [template]");
  console.error("       template = confirm-signup | magic-link | reset-password");
  process.exit(1);
}

const subjects = {
  "confirm-signup": "[PREVIEW] Confirm your email — Concierge",
  "magic-link": "[PREVIEW] Your sign-in link",
  "reset-password": "[PREVIEW] Reset your password",
};

const previewUrl =
  "https://concierge-proto1231.vercel.app/?preview=email-template-test";

const templatePath = resolve(
  projectRoot,
  "supabase",
  "email-templates",
  `${TEMPLATE}.html`
);
const raw = await readFile(templatePath, "utf8");
const html = raw.replaceAll("{{ .ConfirmationURL }}", previewUrl);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const info = await transporter.sendMail({
  from: `"Concierge" <${process.env.GMAIL_FROM ?? process.env.GMAIL_USER}>`,
  to: TO,
  subject: subjects[TEMPLATE] ?? `[PREVIEW] ${TEMPLATE}`,
  html,
});

console.log(`Sent ${TEMPLATE} to ${TO}`);
console.log(`Message ID: ${info.messageId}`);
console.log(`Accepted: ${JSON.stringify(info.accepted)}`);
console.log(`Rejected: ${JSON.stringify(info.rejected)}`);
