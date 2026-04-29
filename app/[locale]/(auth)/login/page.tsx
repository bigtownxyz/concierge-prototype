"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { buildAbsoluteUrl } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
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
};

function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          borderColor: error ? "rgba(184,92,107,0.6)" : "rgba(69,71,75,0.3)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = error
            ? "rgba(184,92,107,0.8)"
            : "rgba(187,196,247,0.4)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = error
            ? "rgba(184,92,107,0.6)"
            : "rgba(69,71,75,0.3)";
        }}
      />
      {error && (
        <p className="text-xs" style={{ color: "#b85c6b" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const next = searchParams.get("next") ?? "/results";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (urlError === "auth") {
      setServerError("Authentication failed. Please try again.");
    }
  }, [urlError]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "A valid email address is required.";
    }
    if (mode === "password" && (!password || password.length < 8)) {
      errs.password = "Password must be at least 8 characters.";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "magic") {
        const callbackPath = `/${locale}/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: buildAbsoluteUrl(callbackPath),
          },
        });
        if (error) {
          setServerError(error.message);
        } else {
          setSuccessMessage("Magic link sent! Check your email and click the link to sign in.");
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setServerError(error.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch("/api/profile/bootstrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: session?.access_token,
          email,
        }),
      }).catch(() => {
        // Best effort only; the callback and qualification flow also self-heal.
      });

      router.push(next);
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Authentication failed. Please try again."
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
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Link href="/" aria-label="Home">
            <Logo size="sm" />
          </Link>
          <p
            className="text-sm"
            style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            Sovereign wealth management, personalised.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(28,32,38,0.8)",
            border: "1px solid rgba(69,71,75,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            Sign In
          </h2>

          {/* Success message */}
          {successMessage && (
            <div
              className="mb-6 rounded-xl p-4 text-sm"
              style={{
                background: "rgba(187,196,247,0.1)",
                border: "1px solid rgba(187,196,247,0.3)",
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {successMessage}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div
              className="mb-6 rounded-xl p-4 text-sm"
              style={{
                background: "rgba(184,92,107,0.1)",
                border: "1px solid rgba(184,92,107,0.3)",
                color: "#b85c6b",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <AuthInput
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@domain.com"
              error={errors.email}
            />

            {mode === "password" && (
              <>
                <AuthInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Your password"
                  error={errors.password}
                />

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs transition-colors"
                    style={{
                      color: "#8f9095",
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{
                background: "#bbc4f7",
                color: "#242d58",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7";
              }}
            >
              {loading ? (mode === "magic" ? "Sending link..." : "Signing in...") : (mode === "magic" ? "Send Magic Link" : "Sign In")}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(69,71,75,0.3)" }} />
            <span className="text-xs" style={{ color: "#8f9095" }}>
              or
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(69,71,75,0.3)" }} />
          </div>

          <button
            type="button"
            onClick={() => { setMode(mode === "password" ? "magic" : "password"); setErrors({}); setServerError(""); setSuccessMessage(""); }}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
            style={{
              background: "rgba(69,71,75,0.15)",
              border: "1px solid rgba(69,71,75,0.3)",
              color: "#b7c6ed",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {mode === "password" ? "mail" : "lock"}
            </span>
            {mode === "password" ? "Sign in with Magic Link" : "Sign in with Password"}
          </button>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
              className="font-semibold transition-colors"
              style={{ color: "#bbc4f7" }}
            >
              Get Qualified
            </button>
          </p>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "rgba(143,144,149,0.5)", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "#8f9095" }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "#8f9095" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
