import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * The address that appears in the From header. Falls back to GMAIL_USER if
 * GMAIL_FROM is not set. Use GMAIL_FROM when GMAIL_USER is the underlying
 * Workspace account and you want to send as an alias (e.g. authenticate as
 * admin@ but send as concierge@). The alias must be configured in Workspace
 * Admin or Gmail "Send mail as" first.
 */
function getFromAddress(): string {
  const from = process.env.GMAIL_FROM || process.env.GMAIL_USER;
  if (!from) throw new Error("Missing GMAIL_USER environment variable.");
  return from;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendEmailParams): Promise<void> {
  await getTransporter().sendMail({
    from: `"Concierge" <${getFromAddress()}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}
