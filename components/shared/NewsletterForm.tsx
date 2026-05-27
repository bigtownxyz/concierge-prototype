"use client";

import { useState } from "react";

type Variant = "footer" | "page";

export function NewsletterForm({
  source,
  variant = "footer",
}: {
  source: string;
  variant?: Variant;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const isFooter = variant === "footer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Could not subscribe. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={
          isFooter
            ? "rounded-xl border border-[#bbc4f7]/25 bg-[#bbc4f7]/[0.06] px-4 py-3 text-sm text-[#bbc4f7]"
            : "rounded-2xl border border-[#bbc4f7]/30 bg-[#bbc4f7]/[0.06] px-6 py-5 text-center text-[#bbc4f7]"
        }
      >
        <span
          className="material-symbols-outlined align-middle"
          style={{ fontSize: 18, marginRight: 8, fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          check_circle
        </span>
        You&apos;re on the list. Keep an eye on your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      {/* Honeypot — visually hidden, kept in the form for bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      <div className={isFooter ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-3"}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className={
            isFooter
              ? "flex-1 rounded-xl border border-white/10 bg-[#0F0E1B] px-4 py-3 text-sm text-[#dfe2eb] placeholder:text-[#6c6e74] focus:border-[#bbc4f7]/40 focus:outline-none"
              : "w-full rounded-xl border border-white/10 bg-[#13131f] px-5 py-4 text-base text-[#dfe2eb] placeholder:text-[#6c6e74] focus:border-[#bbc4f7]/45 focus:outline-none"
          }
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={
            isFooter
              ? "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-5 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-colors hover:bg-[#a9b3ea] disabled:opacity-60"
              : "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-7 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-all duration-200 hover:scale-[1.01] disabled:opacity-60"
          }
          style={
            isFooter
              ? undefined
              : { boxShadow: "0 20px 60px rgba(187,196,247,0.25)" }
          }
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
          {status !== "loading" && (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden>
              arrow_forward
            </span>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#e8a4ad" }}>
          {error}
        </p>
      )}
    </form>
  );
}
