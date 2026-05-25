import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "Missing SMTP_USER or SMTP_PASSWORD environment variables."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.zoho.eu",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user, pass },
  });

  return cachedTransporter;
}

function getFromAddress(): string {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing SMTP_USER environment variable.");
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
