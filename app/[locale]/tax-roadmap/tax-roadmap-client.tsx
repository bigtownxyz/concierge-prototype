"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { TAX_ROADMAP_CALENDLY_URL } from "@/lib/constants";

/* Tax Roadmap landing page. Standalone (no nav). The hero matches the
   marketing landing page (full-bleed video). Below the hero, a dense,
   wide layout that shows the deliverable rather than only listing it. */

const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
} as const;

const SERIF_ITALIC = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.02em",
};

const SERIF_FONT = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.015em",
};

const PRICE = "$500";

const sectionClass = "relative px-6 py-16 lg:px-8 lg:py-20";

// Opens Calendly's scheduling overlay (requires widget.js, loaded in
// BookingSection). Keeps the page compact instead of a tall inline embed.
function openCalendlyPopup() {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  };
  w.Calendly?.initPopupWidget({ url: TAX_ROADMAP_CALENDLY_URL });
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
      style={{ color: "#bbc4f7" }}
    >
      {children}
    </p>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className="mt-4 text-[clamp(1.85rem,3.4vw,2.7rem)] leading-[1.05] tracking-[-0.025em] text-[#f1f2f6]"
      style={DISPLAY_FONT}
    >
      {children}
    </h2>
  );
}

export default function TaxRoadmapClient() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#0D0D1A", color: "#dfe2eb", ...DISPLAY_FONT }}
    >
      {/* ambient depth so the sections below the hero aren't flat black */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-12%] top-[28%] h-[42rem] w-[42rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(187,196,247,0.07), transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-16%] top-[58%] h-[46rem] w-[46rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(140,165,240,0.05), transparent 70%)",
          }}
        />
      </div>

      <div className="relative">
        <Hero />
        <Deliverable />
        <HowItWorks />
        <Destinations />
        <ForWho />
        <Faq />
        <BookingSection />
        <Footer />
      </div>

      <StickyBookCta />
    </div>
  );
}

// ─── Hero (video background, mirrors the marketing landing hero) ─────────────

const HERO_GLIMPSE = [
  {
    icon: "forum",
    title: "A 1:1 call",
    body: "Around an hour. We map your full situation together.",
  },
  {
    icon: "description",
    title: "A written roadmap",
    body: "Delivered after the call. Yours to keep and act on.",
  },
  {
    icon: "alt_route",
    title: "Ranked options",
    body: "Each with costs, day-counts and a clear next step.",
  },
];

function Hero() {
  return (
    <section
      aria-label="Tax Roadmap Call"
      className="relative flex w-full flex-col overflow-hidden bg-[#0d1017] min-h-[100svh]"
    >
      <video
        src="/videos/hero-v4.mp4"
        poster="/images/programs/portugal.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover [filter:blur(3px)_saturate(0.85)] lg:[filter:blur(6px)_saturate(0.85)]"
        style={{ transform: "scale(1.05)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 40%, rgba(11,13,20,0.55), rgba(11,13,20,0.82) 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,13,20,0.65) 0%, transparent 22%, transparent 68%, rgba(13,13,26,0.97) 100%)",
        }}
      />

      <div className="relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/" aria-label="Concierge home">
            <Image
              src="/logo.svg"
              alt="Concierge"
              width={958}
              height={160}
              className="h-6 w-auto sm:h-7"
              priority
            />
          </Link>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#9aa0b8]">
            Tax Roadmap Call
          </span>
        </div>
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-[58rem] flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center"
        >
          <h1
            className="text-[#eef0f6]"
            style={{
              ...DISPLAY_FONT,
              fontWeight: 500,
              fontSize: "clamp(2.6rem,6.2vw,5.4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            <span className="block">Keep more of</span>
            <span className="block">
              <span
                className="text-[#c4caf1]"
                style={{ ...SERIF_FONT, fontSize: "1.05em" }}
              >
                what you&apos;ve made.
              </span>
            </span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-[40rem] text-[#c0c3d2]"
            style={{ ...DISPLAY_FONT, fontSize: "1.0625rem", lineHeight: 1.65 }}
          >
            A private call where we map your situation to the legal routes,
            often a change of residency, that cut your tax bill. You leave with a
            written roadmap of your options, ranked and costed, yours to keep.
          </p>

          <div className="mt-11 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {HERO_GLIMPSE.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0D0D1A]/60 px-5 py-6 text-center backdrop-blur-md"
              >
                <span
                  className="material-symbols-outlined text-[#bbc4f7]"
                  style={{ fontSize: 26 }}
                >
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#f1f2f7]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#9aa0b8]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#included"
            className="mt-12 inline-flex flex-col items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#9aa0b8] transition-colors hover:text-[#c0c3d2]"
          >
            See what&apos;s included
            <motion.span
              className="material-symbols-outlined text-[#bbc4f7]"
              style={{ fontSize: 22 }}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              keyboard_arrow_down
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── The deliverable (2-col: value list + document preview) ──────────────────

const ROADMAP_INCLUDES = [
  {
    icon: "alt_route",
    title: "Your real options, ranked",
    body: "The routes that fit your holdings, nationality and appetite for change, in priority order.",
  },
  {
    icon: "payments",
    title: "What each one costs",
    body: "Rough cost to execute per option, weighed against the tax it saves.",
  },
  {
    icon: "event_available",
    title: "Time and presence required",
    body: "Day-count and substance rules, so you know what each route asks of your calendar.",
  },
  {
    icon: "footprint",
    title: "A sequence to follow",
    body: "The order to do things in, with the first concrete steps spelled out.",
  },
];

function Deliverable() {
  return (
    <section id="included" className={`${sectionClass} scroll-mt-8`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>What you get</Eyebrow>
            <SectionTitle>
              Every call ends with a{" "}
              <span style={SERIF_ITALIC}>written roadmap.</span>
            </SectionTitle>
            <p
              className="mt-4 max-w-xl text-[0.98rem] leading-relaxed"
              style={{ color: "#9aa0b8" }}
            >
              Most tax conversations end and you are left trying to remember what
              was said. This one ends with a document built from your answers,
              yours to keep whether or not we ever work together again.
            </p>

            <div className="mt-8 flex flex-col gap-2.5">
              {ROADMAP_INCLUDES.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-[#13131f] px-4 py-3.5"
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(187,196,247,0.1)",
                      border: "1px solid rgba(187,196,247,0.2)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[#bbc4f7]"
                      style={{ fontSize: 20 }}
                    >
                      {item.icon}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#f1f2f6]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[0.82rem] leading-relaxed text-[#8f9095]">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <RoadmapPreview />
          </Reveal>
        </div>

        {/* the genuinely-additional topics the roadmap also maps */}
        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#8f9095]">
              And mapped against your situation
            </p>
            <div className="mt-6 grid gap-7 sm:grid-cols-3">
              {ALSO_MAPPED.map((item) => (
                <div key={item.title} className="flex flex-col gap-3">
                  <span
                    className="material-symbols-outlined text-[#bbc4f7]"
                    style={{ fontSize: 24 }}
                  >
                    {item.icon}
                  </span>
                  <h3 className="text-[0.95rem] font-semibold text-[#f1f2f6]">
                    {item.title}
                  </h3>
                  <p className="text-[0.85rem] leading-relaxed text-[#8f9095]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const ALSO_MAPPED = [
  {
    icon: "account_balance",
    title: "Tax treatment by jurisdiction",
    body: "How income, gains and assets are taxed in the places you could move to.",
  },
  {
    icon: "trending_up",
    title: "Timing and exit",
    body: "When a move makes sense relative to your gains, and the timing traps to avoid.",
  },
  {
    icon: "family_restroom",
    title: "Family and dependants",
    body: "How a partner, children or a second nationality change what's realistic.",
  },
];

// Illustrative preview of the deliverable. Country names are real Concierge
// routes; the bars are profile-fit indicators, not tax figures (YMYL: no
// specific tax outcomes are asserted). Marked "Sample" so it reads as a layout.
const PREVIEW_ROUTES = [
  { rank: "1", name: "Portugal", kind: "Residency", fit: 92 },
  { rank: "2", name: "United Arab Emirates", kind: "Residency", fit: 78 },
  { rank: "3", name: "St Kitts & Nevis", kind: "Citizenship", fit: 64 },
];

function RoadmapPreview() {
  return (
    <div className="relative">
      {/* stacked pages behind, to imply a multi-page document */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-white/[0.05] bg-[#0f0f1a]"
        style={{ transform: "rotate(2.2deg) translateY(8px)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-[#121220]"
        style={{ transform: "rotate(1deg) translateY(4px)" }}
      />

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-7"
        style={{
          background: "linear-gradient(180deg, #17171f 0%, #101019 100%)",
          boxShadow: "0 30px 70px -25px rgba(0,0,0,0.75)",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#bbc4f7]" />
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]">
              Tax Roadmap
            </span>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
            style={{
              color: "#8f9095",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Sample
          </span>
        </div>

        <p className="mt-5 text-lg font-semibold text-[#f1f2f7]">
          Your route options
        </p>
        <p className="mt-1 text-[0.78rem] text-[#8f9095]">
          Ranked by fit with your profile
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {PREVIEW_ROUTES.map((route, i) => (
            <div
              key={route.name}
              className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={
                  i === 0
                    ? { background: "#bbc4f7", color: "#242d58" }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "#9aa0b8",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
              >
                {route.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#eef0f6]">
                  {route.name}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#9aa0b8]">
                    {route.kind}
                  </span>
                  <span className="h-2 w-9 rounded-full bg-white/[0.07]" />
                  <span className="h-2 w-6 rounded-full bg-white/[0.07]" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#6c6e74]">
                  Fit
                </span>
                <span className="block h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-[#bbc4f7]"
                    style={{ width: `${route.fit}%` }}
                  />
                </span>
              </div>
            </div>
          ))}

          {/* faded rows imply more content below */}
          <div className="relative">
            <div className="flex flex-col gap-2.5 opacity-30">
              {[0, 1].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-3.5 rounded-xl border border-white/[0.05] px-3.5 py-3"
                >
                  <span className="h-7 w-7 flex-shrink-0 rounded-full bg-white/5" />
                  <span className="h-3 w-1/2 rounded-full bg-white/[0.07]" />
                  <span className="ml-auto h-1.5 w-14 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent, #101019 90%)",
              }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-[#8f9095]">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              lock
            </span>
            Yours to keep
          </span>
          <span className="text-sm font-semibold text-[#bbc4f7]">
            {PRICE} one-off
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── How it works (step cards) ───────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    icon: "event",
    title: "Book and pay",
    body: `Pick a time and pay the ${PRICE} securely in one step. That locks in your slot and the work that follows.`,
  },
  {
    n: "02",
    icon: "forum",
    title: "We talk it through",
    body: "On the call I ask about your holdings, your goals, where you can and can't move, your timeline and your ties.",
  },
  {
    n: "03",
    icon: "description",
    title: "You get your roadmap",
    body: "I turn your answers into a written roadmap with options, costs and a sequence. Delivered after the call, yours to keep.",
  },
];

function HowItWorks() {
  return (
    <section
      className={sectionClass}
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>
            Three steps, <span style={SERIF_ITALIC}>start to plan.</span>
          </SectionTitle>
        </Reveal>

        <div className="relative mt-14">
          {/* connecting line behind the nodes (desktop) */}
          <div
            aria-hidden
            className="absolute inset-x-[14%] top-7 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(to right, rgba(187,196,247,0.35), rgba(187,196,247,0.12))",
            }}
          />
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="relative flex flex-col">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background: "#0D0D1A",
                      border: "1px solid rgba(187,196,247,0.3)",
                      boxShadow: "0 0 0 7px #0D0D1A",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[#bbc4f7]"
                      style={{ fontSize: 24 }}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span
                      className="text-[1.5rem] leading-none"
                      style={{ color: "rgba(187,196,247,0.5)", ...SERIF_ITALIC }}
                    >
                      {step.n}
                    </span>
                    <h3 className="text-lg font-semibold" style={{ color: "#f1f2f6" }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Destinations (real imagery, the aspirational beat) ──────────────────────

const DESTINATIONS = [
  { slug: "portugal", name: "Portugal", kind: "Residency" },
  { slug: "dubai", name: "United Arab Emirates", kind: "Residency" },
  { slug: "st-kitts-and-nevis", name: "St Kitts & Nevis", kind: "Citizenship" },
  { slug: "grenada", name: "Grenada", kind: "Citizenship" },
  { slug: "georgia", name: "Georgia", kind: "Residency" },
  { slug: "panama", name: "Panama", kind: "Residency" },
];

function Destinations() {
  return (
    <section
      className={sectionClass}
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Where this could take you</Eyebrow>
          <SectionTitle>
            Real places, <span style={SERIF_ITALIC}>real routes.</span>
          </SectionTitle>
          <p
            className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-relaxed"
            style={{ color: "#9aa0b8" }}
          >
            A few of the destinations a roadmap can point to. Which ones fit you
            comes down to your holdings, your nationality and how far you want to
            move.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {DESTINATIONS.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 3) * 0.06}>
              <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src={`/images/programs/${d.slug}.jpg`}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(13,13,26,0.3) 0%, rgba(13,13,26,0.68) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                  <p className="text-lg font-semibold text-white">{d.name}</p>
                  <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#e7e9f5] backdrop-blur-md">
                    {d.kind}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who it's for / not for ──────────────────────────────────────────────────

const FOR = [
  "You've made real gains and want to keep more of them, legally.",
  "You earn remotely and aren't tied to where you currently live.",
  "You're open to relocating, or already weighing a move.",
  "You want clarity and a written plan before committing to anything big.",
];

const NOT_FOR = [
  "You want someone to file your tax return for you.",
  "You're not willing to consider moving or changing residency.",
  "You're after a guaranteed loophole rather than real options.",
];

function ForWho() {
  return (
    <section
      className={sectionClass}
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <SectionTitle>
            Best for people ready to{" "}
            <span style={SERIF_ITALIC}>make a move.</span>
          </SectionTitle>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Reveal>
            <div
              className="relative h-full overflow-hidden rounded-2xl p-7 sm:p-8"
              style={{
                background:
                  "linear-gradient(160deg, rgba(187,196,247,0.10) 0%, rgba(187,196,247,0.03) 100%)",
                border: "1px solid rgba(187,196,247,0.25)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(187,196,247,0.55), transparent)",
                }}
              />
              <h3
                className="text-lg font-semibold"
                style={{ color: "#f1f2f6", ...DISPLAY_FONT }}
              >
                This is for you if
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {FOR.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#dfe2eb" }}>
                    <span
                      className="material-symbols-outlined mt-0.5 flex-shrink-0"
                      style={{ fontSize: 18, color: "#bbc4f7", fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div
              className="h-full rounded-2xl p-7 sm:p-8"
              style={{
                background: "#13131f",
                border: "1px solid rgba(69,71,75,0.35)",
              }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: "#f1f2f6", ...DISPLAY_FONT }}
              >
                It&apos;s probably not for you if
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {NOT_FOR.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
                    <span
                      className="material-symbols-outlined mt-0.5 flex-shrink-0"
                      style={{ fontSize: 18, color: "#6c6e74" }}
                    >
                      remove
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ (2-col grid) ────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is this formal tax or legal advice?",
    a: "No. The roadmap lays out strategic options based on what you share, so you can make an informed decision. Before you action anything, confirm the specifics with a licensed tax or legal professional in the relevant jurisdiction. The roadmap flags where that sign-off is needed.",
  },
  {
    q: "What do I need before the call?",
    a: "A rough sense of your holdings, your current residency and nationality, and what you're hoping to achieve. Nothing needs to be exact. The questions on the call will draw out the rest.",
  },
  {
    q: "How long is the call?",
    a: "Long enough to ask everything that shapes your options, typically around an hour. The written roadmap follows after, once the answers are turned into a plan.",
  },
  {
    q: "Do I really keep the roadmap?",
    a: `Yes. The ${PRICE} buys the call and the written roadmap that comes out of it. It's yours to keep and act on, with or without us.`,
  },
  {
    q: "What if I want help executing the plan?",
    a: "If you decide to move on one of the routes, we run a full concierge service that handles the application end to end. The roadmap call is a standalone first step with no obligation to go further.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Everything you share is held in strict confidence and never passed to third parties.",
  },
];

function Faq() {
  return (
    <section
      className={sectionClass}
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>Questions</Eyebrow>
          <SectionTitle>
            Before you <span style={SERIF_ITALIC}>book.</span>
          </SectionTitle>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={(i % 2) * 0.05}>
              <FaqItem q={faq.q} a={faq.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="h-full rounded-2xl"
      style={{
        background: "#13131f",
        border: "1px solid rgba(69,71,75,0.35)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[0.94rem] font-semibold" style={{ color: "#f1f2f6" }}>
          {q}
        </span>
        <span
          className="material-symbols-outlined flex-shrink-0 transition-transform duration-200"
          style={{
            fontSize: 22,
            color: "#bbc4f7",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          add
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          {a}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Sticky book button (fast path for high-intent visitors) ─────────────────

function StickyBookCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.8;
      // hide near the very bottom, where the booking embed already sits
      const nearBottom =
        window.scrollY + window.innerHeight >
        document.body.scrollHeight - 1100;
      setShow(past && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={openCalendlyPopup}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-50 inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-[0.01em]"
          style={{
            background: "#bbc4f7",
            color: "#242d58",
            boxShadow: "0 14px 44px rgba(187,196,247,0.4)",
          }}
        >
          Book the call · {PRICE}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Booking (the bottom CTA / climax) ───────────────────────────────────────

function BookingSection() {
  return (
    <section
      id="book"
      className={`${sectionClass} scroll-mt-8`}
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Book your call</Eyebrow>
          </div>
          <h2
            className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.025em] text-[#f1f2f6]"
            style={DISPLAY_FONT}
          >
            Book the call. <span style={SERIF_ITALIC}>Keep the roadmap.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-relaxed" style={{ color: "#8f9095" }}>
            Pick a time below and pay the {PRICE} securely. That confirms your
            call and the written roadmap that comes with it.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-9 flex flex-col items-center">
          <button
            type="button"
            onClick={openCalendlyPopup}
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full px-9 text-sm font-semibold tracking-[0.01em] transition-transform duration-200 hover:scale-[1.02]"
            style={{
              background: "#bbc4f7",
              color: "#242d58",
              boxShadow: "0 18px 50px rgba(187,196,247,0.3)",
            }}
          >
            Book your call · {PRICE}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </button>
          <p className="mt-4 text-center text-xs" style={{ color: "#6c6e74" }}>
            Secure payment and scheduling handled by Calendly. Held in strict
            confidence.
          </p>
        </Reveal>

        {/* Calendly popup assets: the scheduler opens in an overlay on click,
            so the page itself stays compact (no tall inline embed). */}
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
        />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </div>
    </section>
  );
}

// ─── Footer (minimal, no nav) ────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="relative px-6 py-14 lg:px-8"
      style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Link href="/" aria-label="Concierge home">
          <Image
            src="/logo.svg"
            alt="Concierge"
            width={958}
            height={160}
            className="h-5 w-auto opacity-70"
          />
        </Link>
        <p className="max-w-lg text-[0.7rem] leading-relaxed" style={{ color: "#6c6e74" }}>
          The tax roadmap presents strategic options based on the information you
          provide. It is not a substitute for formal tax or legal advice.
          Validate any course of action with a licensed professional in the
          relevant jurisdiction before acting.
        </p>
      </div>
    </footer>
  );
}
