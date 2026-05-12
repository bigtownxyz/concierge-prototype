"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

/**
 * Set-password page for first-time invitees.
 *
 * Reached after /initial-due-diligence/callback exchanges the invite code
 * for a session. The applicant is already logged in at this point — this
 * page just gives them a chance to choose their own password before
 * entering the wizard.
 *
 * If somehow rendered without a session (someone bookmarked the URL),
 * we send them back to the login.
 */

const PRIMARY = "#bbc4f7";
const PRIMARY_INK = "#242d58";
const SURFACE = "rgba(28,32,38,0.8)";
const HAIRLINE = "rgba(69,71,75,0.3)";
const INK = "#dfe2eb";
const INK_SOFT = "#8f9095";
const ERR = "#b85c6b";
const OK = "#3e8f78";
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
};

export default function SetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify a session exists. Without one the updateUser call would fail
  // silently — better to bounce them to login with a clear message.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
    });
  }, []);

  useEffect(() => {
    if (hasSession === false) {
      router.replace("/initial-due-diligence/login?error=auth");
    }
  }, [hasSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/initial-due-diligence");
      }, 1400);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to set your password right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // Still resolving session state — render nothing rather than flash a form
  if (hasSession !== true) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#10141a" }}
      />
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "#10141a" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo size="sm" />
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: SURFACE,
            border: `1px solid ${HAIRLINE}`,
            backdropFilter: "blur(12px)",
          }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "rgba(62,143,120,0.12)",
                  border: "1px solid rgba(62,143,120,0.3)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 28,
                    color: OK,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  check_circle
                </span>
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: INK, fontFamily: FONT }}
              >
                Password set
              </h2>
              <p
                className="text-sm"
                style={{ color: INK_SOFT, fontFamily: FONT }}
              >
                Taking you to your due-diligence form…
              </p>
            </div>
          ) : (
            <>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: INK, fontFamily: FONT }}
              >
                Set your password
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: INK_SOFT, fontFamily: FONT }}
              >
                Choose a password you can use to sign back in later. Minimum 8
                characters.
              </p>

              {error && (
                <div
                  className="mb-6 rounded-xl p-4 text-sm"
                  style={{
                    background: "rgba(184,92,107,0.1)",
                    border: "1px solid rgba(184,92,107,0.3)",
                    color: ERR,
                    fontFamily: FONT,
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: INK_SOFT, fontFamily: FONT }}
                  >
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: INK_SOFT, fontFamily: FONT }}
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: PRIMARY,
                    color: PRIMARY_INK,
                    fontFamily: FONT,
                  }}
                >
                  {loading ? "Saving…" : "Set password & continue"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
