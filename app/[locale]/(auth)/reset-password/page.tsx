"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/programs");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update your password right now."
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
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(62,143,120,0.12)", border: "1px solid rgba(62,143,120,0.3)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 28, color: "#3e8f78", fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Password updated
              </h2>
              <p className="text-sm" style={{ color: "#8f9095" }}>
                Redirecting you now...
              </p>
            </div>
          ) : (
            <>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Set a new password
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
              >
                Enter your new password below.
              </p>

              {error && (
                <div
                  className="mb-6 rounded-xl p-4 text-sm"
                  style={{
                    background: "rgba(184,92,107,0.1)",
                    border: "1px solid rgba(184,92,107,0.3)",
                    color: "#b85c6b",
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
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
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
                    }}
                    onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)"; }}
                    onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)"; }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#8f9095", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
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
                    }}
                    onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)"; }}
                    onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)"; }}
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
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
