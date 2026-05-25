"use client";

import type { CSSProperties } from "react";

/* HeroV6 — wide cinematic hero with a heavily blurred/darkened video
   spanning the full background and a left-aligned content stack. Bottom
   strip carries three stats across the full width. */

import { Link } from "@/i18n/navigation";
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";

const SANS = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
const SERIF = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
};

const stats = [
  { label: "Clients guided", value: "500+", sub: "Worldwide" },
  {
    label: "Active programmes",
    value: "15+",
    sub: "Across leading jurisdictions",
  },
  { label: "Approval rate", value: "98%", sub: "Success rate" },
];

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M6 4.2v7.6L12 8 6 4.2Z" />
    </svg>
  );
}

function CompassGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-3 6-6 3 3-6 6-3Z" />
    </svg>
  );
}

export function HeroV6() {
  return (
    <section
      aria-label="Concierge: jurisdiction strategy"
      /* Mobile: let the section grow with its content (the stats + Featured
         Programme stack into a tall column and would clip a fixed 100svh).
         Desktop (lg+): lock to exact viewport height so the stats sit at
         the visual fold. PublicLayout applies zoom: 0.88, so the desktop
         calc divides by 0.88 and subtracts the 72px sticky header. */
      className="relative flex w-full flex-col overflow-hidden bg-[#0d1017] min-h-[100svh] lg:min-h-0 lg:h-[var(--hero-h)]"
      style={
        {
          "--hero-h": "calc((100svh - 72px) / 0.88)",
        } as CSSProperties
      }
    >
      {/* full-bleed background video — softer blur on mobile so the
          subject reads, full blur on desktop where text overlays it */}
      <video
        src="/videos/hero-v4.mp4"
        poster="/images/programs/portugal.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover [filter:blur(2px)_saturate(0.85)] lg:[filter:blur(6px)_saturate(0.85)]"
        style={{ transform: "scale(1.05)" }}
      />

      {/* left-side darkening so the headline reads cleanly */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,20,0.92) 0%, rgba(11,13,20,0.78) 35%, rgba(11,13,20,0.45) 65%, rgba(11,13,20,0.35) 100%)",
        }}
      />
      {/* top/bottom softening for the stats strip + nav merge */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,13,20,0.55) 0%, transparent 20%, transparent 70%, rgba(11,13,20,0.7) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col justify-between px-6 pb-8 pt-32 sm:px-8 lg:px-12 lg:pt-[14rem] lg:pb-10">
        {/* ── HERO CONTENT (centered) ─────────────────────────────────── */}
        <div className="mx-auto max-w-[58rem] text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
            <p
              className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#9aa0b8]"
              style={SANS}
            >
              Private advisory for global mobility
            </p>
          </div>

          <h1
            className="mt-6 text-[#eef0f6]"
            style={{
              ...SANS,
              fontWeight: 500,
              fontSize: "clamp(2.6rem,6.2vw,6rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            <span className="block">Jurisdiction strategy</span>
            <span className="block">
              for a{" "}
              <span
                className="text-[#c4caf1]"
                style={{
                  ...SERIF,
                  fontSize: "1.05em",
                  letterSpacing: "-0.01em",
                }}
              >
                borderless
              </span>{" "}
              life.
            </span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-[36rem] text-[#c0c3d2]"
            style={{ ...SANS, fontSize: "1.0625rem", lineHeight: 1.65 }}
          >
            We design discreet, compliant strategies that fit your life, not
            the other way around.
          </p>

          <div className="mt-9 flex flex-wrap items-stretch justify-center gap-3">
            <Link
              href="/programs"
              className="group inline-flex items-center gap-3 rounded-full bg-[#bbc4f7] px-6 py-3.5 text-[0.95rem] font-semibold text-[#242d58] transition-colors hover:bg-[#cbd1fa]"
              style={SANS}
            >
              Explore Programmes
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#242d58] text-[#bbc4f7]">
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 text-[0.95rem] font-semibold text-[#e9eaf0] transition-colors hover:border-white/30 hover:bg-white/[0.04]"
              style={SANS}
            >
              How We Work
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[#bbc4f7]">
                <PlayGlyph className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* ── BOTTOM GROUP (divider + stats + featured) ──────────────── */}
        <div className="mt-12 lg:mt-16">
          <div aria-hidden className="h-px w-full bg-white/12" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Stats with sublabels */}
          <dl className="grid grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex flex-col"
                style={{
                  paddingLeft: index === 0 ? 0 : "1.5rem",
                  marginLeft: index === 0 ? 0 : "1.5rem",
                  borderLeft:
                    index === 0
                      ? "none"
                      : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <dt
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8f93a3]"
                  style={SANS}
                >
                  {stat.label}
                </dt>
                <dd
                  className="mt-2 text-[2rem] tracking-[-0.03em] text-[#eef0f6] sm:text-[2.4rem]"
                  style={{ ...SANS, fontWeight: 500 }}
                >
                  {stat.value}
                </dd>
                <span
                  className="mt-1 text-[0.82rem] text-[#9aa0b8]"
                  style={SANS}
                >
                  {stat.sub}
                </span>
              </div>
            ))}
          </dl>

          {/* Qualification quiz CTA — surfaces the discovery flow for visitors
              who don't yet know which programme suits them. Wrapped in
              LiquidGlassCard for the layered glass treatment (turbulence-
              displaced backdrop blur + rim highlights). draggable=false so
              the card doesn't move on click, the button inside owns the
              onClick. */}
          <LiquidGlassCard
            draggable={false}
            borderRadius="1.15rem"
            blurIntensity="xl"
            glowIntensity="sm"
            shadowIntensity="md"
            className="w-full"
          >
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-qualify-modal"))
              }
              className="group flex w-full items-center gap-5 px-6 py-5 text-left"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#bbc4f7]">
                <CompassGlyph className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFC864]" />
                  <span
                    className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#bbc4f7]"
                    style={SANS}
                  >
                    Qualification review
                  </span>
                </span>
                <span
                  className="mt-1.5 text-[1.35rem] text-[#f1f2f7]"
                  style={{ ...SANS, fontWeight: 600, letterSpacing: "-0.01em" }}
                >
                  Not Sure Where to Start?
                </span>
                <span
                  className="mt-0.5 text-[0.88rem] text-[#c0c3d2]"
                  style={SANS}
                >
                  Take our 4-step review and we&apos;ll map your route
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="flex flex-col items-end">
                  <span
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#a8accb]"
                    style={SANS}
                  >
                    Time
                  </span>
                  <span
                    className="text-[1.05rem] text-[#e9eaf0]"
                    style={{ ...SANS, fontWeight: 600 }}
                  >
                    2 min
                  </span>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#bbc4f7] transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
