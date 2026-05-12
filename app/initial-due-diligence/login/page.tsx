"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

/**
 * Login page for the DD applicant portal.
 *
 * Mirrors the visual language of app/[locale]/(auth)/login/page.tsx but:
 * - no locale routing (this tree is outside [locale])
 * - no "Get Qualified" public-funnel link (private portal)
 * - default redirect is /initial-due-diligence (the wizard), not /results
 *
 * Applicants reach this page either by clicking the invite email (handled
 * by /initial-due-diligence/callback) or by returning later after they've
 * already set a password.
 */

const PRIMARY = "#bbc4f7";
const PRIMARY_INK = "#242d58";
const SURFACE = "rgba(28,32,38,0.8)";
const HAIRLINE = "rgba(69,71,75,0.3)";
const INK = "#dfe2eb";
const INK_SOFT = "#8f9095";
const ERR = "#b85c6b";
const FONT = "var(--font-manrope, 'Manrope', sans-serif)";

const inputStyle: React.CSSProperties = {
  background: "#0a0e14",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "0.625rem",
  color: INK,
  fontFamily: FONT,
  fontSize: "0.875rem",
  padding: "0.75rem 1rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: INK_SOFT, fontFamily: FONT }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete ?? (type === "password" ? "current-password" : type === "email" ? "email" : "off")}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          borderColor: error ? "rgba(184,92,107,0.6)" : HAIRLINE,
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = error
            ? "rgba(184,92,107,0.8)"
            : "rgba(187,196,247,0.4)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = error
            ? "rgba(184,92,107,0.6)"
            : HAIRLINE;
        }}
      />
      {error && (
        <p className="text-xs" style={{ color: ERR, fontFamily: FONT }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function DdLoginPage() {
  // useSearchParams() forces dynamic rendering; wrap in Suspense so static
  // prerender doesn't trip the CSR-bailout error.
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#10141a" }} />}>
      <DdLoginInner />
    </Suspense>
  );
}

function DdLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/initial-due-diligence";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (urlError === "auth") {
      setServerError(
        "That invite link has expired or already been used. Ask your advisor to resend it."
      );
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "A valid email address is required.";
    }
    if (!password || password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Sign-in failed. Please try again."
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
          <Logo size="sm" />
          <p className="text-sm" style={{ color: INK_SOFT, fontFamily: FONT }}>
            Initial Due Diligence — applicant portal
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: SURFACE,
            border: `1px solid ${HAIRLINE}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: INK, fontFamily: FONT }}
          >
            Sign in
          </h2>

          {serverError && (
            <div
              className="mb-6 rounded-xl p-4 text-sm"
              style={{
                background: "rgba(184,92,107,0.1)",
                border: "1px solid rgba(184,92,107,0.3)",
                color: ERR,
                fontFamily: FONT,
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <AuthInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@domain.com"
              error={errors.email}
            />
            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              error={errors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{
                background: PRIMARY,
                color: PRIMARY_INK,
                fontFamily: FONT,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: INK_SOFT, fontFamily: FONT }}
          >
            Don&apos;t have access? Your advisor will send an invite link to your email.
          </p>
        </div>
      </div>
    </div>
  );
}
