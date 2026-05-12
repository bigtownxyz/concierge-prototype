"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Invite-link callback.
 *
 * Supabase's email auth uses the implicit flow by default for admin-issued
 * invites — tokens arrive in the URL hash (#access_token=...), NOT the query
 * string. The hash never reaches the server, so this has to be a client
 * page (not a Route Handler).
 *
 * The @supabase/ssr browser client auto-detects URL hash tokens on init and
 * sets the cookie-backed session via createBrowserClient. We listen for the
 * SIGNED_IN event and route onward to /set-password. We also handle the
 * PKCE ?code= case for completeness, since some flows use that.
 */

const SURFACE_BG = "#10141a";
const INK_SOFT = "#8f9095";
const FONT = "var(--font-manrope, 'Manrope', sans-serif)";

export default function DdCallbackPage() {
  return (
    <Suspense fallback={<Shell label="Signing you in…" />}>
      <DdCallbackInner />
    </Suspense>
  );
}

function DdCallbackInner() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const goSetPassword = () =>
      router.replace("/initial-due-diligence/set-password");
    const goLoginError = () =>
      router.replace("/initial-due-diligence/login?error=auth");

    // SIGNED_IN fires once the browser client finishes processing URL hash
    // tokens (or once exchangeCodeForSession resolves for PKCE).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        goSetPassword();
      }
    });

    (async () => {
      // 1. PKCE branch: ?code= present, exchange it explicitly.
      const params = new URL(window.location.href).searchParams;
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setStatus("This link has expired or already been used. Redirecting…");
          setTimeout(goLoginError, 1400);
        }
        // Success path is handled by onAuthStateChange.
        return;
      }

      // 2. Implicit branch: tokens come in the hash, the client auto-detects.
      // Give that a moment, then sanity-check.
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // No tokens in hash either — bad/expired link.
        setStatus("This link has expired or already been used. Redirecting…");
        setTimeout(goLoginError, 1400);
      }
      // Success path: onAuthStateChange already routed.
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  return <Shell label={status} />;
}

function Shell({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: SURFACE_BG }}
    >
      <p
        className="text-sm"
        style={{ color: INK_SOFT, fontFamily: FONT }}
      >
        {label}
      </p>
    </div>
  );
}
