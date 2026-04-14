"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { buildAbsoluteUrl } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const resetPath = `/${locale}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAbsoluteUrl(resetPath),
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to send reset email right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "#10141a" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Link href="/" aria-label="Home">
            <Logo size="sm" />
          </Link>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(28,32,38,0.8)",
            border: "1px solid rgba(69,71,75,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(187,196,247,0.1)", border: "1px solid rgba(187,196,247,0.25)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 28, color: "#bbc4f7" }}
                >
                  mail
                </span>
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Check your email
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                We sent a password reset link to <strong style={{ color: "#dfe2eb" }}>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link
                href="/login"
                className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: "rgba(187,196,247,0.1)",
                  border: "1px solid rgba(187,196,247,0.2)",
                  color: "#bbc4f7",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Reset your password
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div
                  className="mb-6 rounded-xl p-4 text-sm"
                  style={{
                    background: "rgba(184,92,107,0.1)",
                    border: "1px solid rgba(184,92,107,0.3)",
                    color: "#b85c6b",
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    autoComplete="email"
                    style={{
                      background: "#0a0e14",
                      border: "1px solid rgba(69,71,75,0.3)",
                      borderRadius: "0.625rem",
                      color: "#dfe2eb",
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      fontSize: "0.875rem",
                      padding: "0.75rem 1rem",
                      width: "100%",
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)";
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: "#bbc4f7",
                    color: "#242d58",
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p
                className="mt-6 text-center text-sm"
                style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Remember your password?{" "}
                <Link href="/login" className="font-semibold" style={{ color: "#bbc4f7" }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
