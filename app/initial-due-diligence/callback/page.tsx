"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Invite-link callback.
 *
 * Supabase's Auth Admin /invite endpoint uses the implicit flow by default:
 * tokens arrive in the URL hash (#access_token=...&refresh_token=...), not
 * the query string. @supabase/ssr's browser client defaults to PKCE flow,
 * which only processes ?code= — it ignores hash tokens entirely. So we
 * parse the hash ourselves and call setSession explicitly.
 *
 * Also handles the PKCE ?code= branch for forward compatibility.
 *
 * Must be a client page (not Route Handler) because URL hash is browser-only.
 */

const SURFACE_BG = "#10141a";
const INK_SOFT = "#8f9095";
const FONT = "var(--font-manrope, 'Manrope', sans-serif)";

export default function DdCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const goSetPassword = () =>
      router.replace("/initial-due-diligence/set-password");
    const goLoginError = () =>
      router.replace("/initial-due-diligence/login?error=auth");

    (async () => {
      // ─── 1. Implicit flow (Supabase Auth Admin /invite default) ──────────
      // Hash looks like: #access_token=...&refresh_token=...&type=invite&...
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (cancelled) return;
          if (error) {
            console.error("[dd-callback] setSession failed", error);
            setStatus(
              "This link has expired or already been used. Redirecting…"
            );
            setTimeout(goLoginError, 1400);
            return;
          }
          // Clear the hash from the address bar — cosmetic, and prevents a
          // reload from re-processing stale tokens.
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          goSetPassword();
          return;
        }
      }

      // ─── 2. PKCE flow (?code=...) ──────────────────────────────────────
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          console.error("[dd-callback] exchangeCodeForSession failed", error);
          setStatus(
            "This link has expired or already been used. Redirecting…"
          );
          setTimeout(goLoginError, 1400);
          return;
        }
        goSetPassword();
        return;
      }

      // ─── 3. Neither — bad link ─────────────────────────────────────────
      setStatus("This link is invalid or has expired. Redirecting…");
      setTimeout(goLoginError, 1400);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: SURFACE_BG }}
    >
      <p className="text-sm" style={{ color: INK_SOFT, fontFamily: FONT }}>
        {status}
      </p>
    </div>
  );
}
