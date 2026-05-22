"use client";

/* HeroV4 — faithful build of the supplied "Jurisdiction strategy for a
   borderless life." hero mockup. Editorial composition: a diagonal
   photographic gash slicing the frame, scattered sans/serif headline
   words, an eyebrow with a connector spine, right-hand advisory copy, a
   Panama focus-route card, a stats row and a scroll cue.

   Desktop is a fixed-ratio stage (container-query scaled, so every element
   keeps the mockup's proportions at any width). A separate stacked layout
   serves narrow screens. Swapped into LandingV2Page through its `hero`
   slot, so the rest of the landing page is untouched. */

import Image from "next/image";
import { Link } from "@/i18n/navigation";

const SANS = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
const SERIF = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
};

const GASH_CLIP = "polygon(40% 0%, 66% 0%, 57% 100%, 35% 100%)";

const stats = [
  { label: "Clients guided", value: "500+" },
  { label: "Active programmes", value: "15+" },
  { label: "Approval rate", value: "98%" },
];

const focusRows = [
  { label: "Entry point", value: "From $300,000" },
  { label: "Timeline", value: "6 months" },
  { label: "Access", value: "142 visa-free" },
];

function scrollOnward() {
  if (typeof window !== "undefined") {
    window.scrollBy({ top: window.innerHeight * 0.86, behavior: "smooth" });
  }
}

/* ── Shared pieces ─────────────────────────────────────────────────────── */

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

function ArrowUpRight({ className }: { className?: string }) {
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
      <path d="M5 11 11 5M5.5 5H11v5.5" />
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

function FocusCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative h-full overflow-hidden rounded-[1.15em] border border-white/10 bg-[#141826]/85 backdrop-blur-xl"
      style={{ boxShadow: "0 30px 60px -28px rgba(0,0,0,0.7)" }}
    >
      {/* teal focus glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(64,196,180,0.32), transparent 58%)",
        }}
      />
      <div
        className="relative flex h-full flex-col"
        style={{ padding: compact ? "1.5rem" : "9%" }}
      >
        <div className="flex items-start justify-between">
          <span
            className="inline-flex items-center gap-[0.5em] rounded-full border border-white/12 bg-[#0e1118]/70 font-semibold uppercase tracking-[0.18em] text-[#bbc4f7]"
            style={{
              ...SANS,
              fontSize: compact ? "0.6rem" : "max(9px,0.66cqw)",
              padding: "0.45em 0.85em",
            }}
          >
            <span className="h-[0.45em] w-[0.45em] rounded-full bg-[#5fcdbd]" />
            Focus route
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8f9bb3]" />
        </div>

        <p
          className="font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
          style={{
            ...SANS,
            fontSize: compact ? "0.62rem" : "max(9px,0.66cqw)",
            marginTop: compact ? "1.25rem" : "10%",
          }}
        >
          Residency
        </p>
        <p
          className="text-[#f1f2f7]"
          style={{
            ...SANS,
            fontWeight: 600,
            fontSize: compact ? "1.85rem" : "max(20px,2cqw)",
            letterSpacing: "-0.02em",
            marginTop: "0.25em",
          }}
        >
          Panama
        </p>
        <p
          className="text-[#aeb2c0]"
          style={{
            ...SANS,
            fontSize: compact ? "0.82rem" : "max(11px,0.86cqw)",
            lineHeight: 1.55,
            marginTop: "0.7em",
          }}
        >
          Territorial tax system and visa pathways for global entrepreneurs.
        </p>

        <div
          className="border-t border-white/10"
          style={{ marginTop: compact ? "1.15rem" : "8%" }}
        />

        <dl className="flex flex-col">
          {focusRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between border-b border-white/[0.07]"
              style={{ padding: compact ? "0.7rem 0" : "5.5% 0" }}
            >
              <dt
                className="font-semibold uppercase tracking-[0.16em] text-[#8f93a3]"
                style={{
                  ...SANS,
                  fontSize: compact ? "0.6rem" : "max(8.5px,0.62cqw)",
                }}
              >
                {row.label}
              </dt>
              <dd
                className="text-[#e9eaf0]"
                style={{
                  ...SANS,
                  fontWeight: 600,
                  fontSize: compact ? "0.8rem" : "max(10.5px,0.82cqw)",
                }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href="/programs/panama"
          className="group/card mt-auto inline-flex items-center gap-[0.55em] font-semibold text-[#e9eaf0] transition-colors hover:text-white"
          style={{
            ...SANS,
            fontSize: compact ? "0.8rem" : "max(10.5px,0.82cqw)",
            paddingTop: compact ? "1.1rem" : "7%",
          }}
        >
          View route details
          <ArrowRight className="h-[1.05em] w-[1.05em] text-[#bbc4f7] transition-transform duration-300 group-hover/card:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

export function HeroV4() {
  return (
    <>
      {/* ════ DESKTOP STAGE ════ */}
      <section
        aria-label="Concierge: jurisdiction strategy"
        className="hidden w-full bg-[#0d1017] lg:block"
      >
        <div
          className="relative mx-auto w-full max-w-[1200px] overflow-hidden"
          style={{ aspectRatio: "1700 / 952", containerType: "inline-size" }}
        >
        {/* ambient depth */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 22% 8%, rgba(187,196,247,0.07), transparent 70%), radial-gradient(50% 45% at 85% 88%, rgba(64,150,196,0.06), transparent 72%)",
          }}
        />

        {/* diagonal photographic gash */}
        <div
          className="absolute inset-0"
          style={{ clipPath: GASH_CLIP }}
        >
          <Image
            src="/images/programs/portugal.jpg"
            alt="Coastal advisory destination at dusk"
            fill
            priority
            sizes="60vw"
            className="object-cover object-[34%_42%]"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(165deg, rgba(11,13,20,0.34) 0%, rgba(11,13,20,0.46) 55%, rgba(11,13,20,0.66) 100%)",
            }}
          />
        </div>
        {/* gash edge highlight */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            clipPath: GASH_CLIP,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />

        {/* eyebrow spine */}
        <div
          aria-hidden
          className="absolute w-px bg-gradient-to-b from-[#bbc4f7]/45 to-transparent"
          style={{ left: "8.7%", top: "20%", height: "20%" }}
        />
        <div
          className="absolute flex items-start gap-[0.7em]"
          style={{ left: "8%", top: "14.5%" }}
        >
          <span
            className="mt-[0.35em] rounded-full bg-[#bbc4f7]"
            style={{ height: "0.42cqw", width: "0.42cqw", minHeight: 5, minWidth: 5 }}
          />
          <p
            className="font-semibold uppercase text-[#9aa0b8]"
            style={{
              ...SANS,
              fontSize: "max(10px,0.74cqw)",
              letterSpacing: "0.2em",
              lineHeight: 1.5,
            }}
          >
            Private advisory
            <br />
            for global mobility
          </p>
        </div>

        {/* headline — scattered words */}
        <h1 className="contents">
          <span
            className="absolute whitespace-nowrap text-[#eef0f6]"
            style={{ ...SANS, fontWeight: 500, left: "5.5%", top: "22%", fontSize: "8.5cqw", lineHeight: 1, letterSpacing: "-0.045em" }}
          >
            Jurisdiction
          </span>
          <span
            className="absolute whitespace-nowrap text-[#c4caf1]"
            style={{ ...SERIF, left: "8.8%", top: "37%", fontSize: "8.7cqw", lineHeight: 1, letterSpacing: "-0.01em" }}
          >
            strategy
          </span>
          <span
            className="absolute z-20 whitespace-nowrap text-[#eef0f6]"
            style={{ ...SANS, fontWeight: 500, left: "48%", top: "46.5%", fontSize: "6.6cqw", lineHeight: 1, letterSpacing: "-0.04em" }}
          >
            for a
          </span>
          <span
            className="absolute z-20 whitespace-nowrap text-[#c4caf1]"
            style={{ ...SERIF, left: "47.5%", top: "57.5%", fontSize: "7.4cqw", lineHeight: 1, letterSpacing: "-0.01em" }}
          >
            borderless
          </span>
          <span
            className="absolute z-20 whitespace-nowrap text-[#eef0f6]"
            style={{ ...SANS, fontWeight: 500, left: "60.5%", top: "70%", fontSize: "7.4cqw", lineHeight: 1, letterSpacing: "-0.045em" }}
          >
            life.
          </span>
        </h1>
        {/* connector line trailing "strategy" */}
        <div
          aria-hidden
          className="absolute h-px bg-gradient-to-r from-[#bbc4f7]/55 to-transparent"
          style={{ left: "33%", top: "45.5%", width: "9.5%" }}
        />

        {/* right-hand advisory copy */}
        <div
          aria-hidden
          className="absolute w-px bg-gradient-to-b from-transparent via-[#bbc4f7]/35 to-[#bbc4f7]/55"
          style={{ left: "65.5%", top: "20%", height: "15.5%" }}
        />
        <span
          aria-hidden
          className="absolute rounded-full bg-[#bbc4f7]"
          style={{ left: "65.5%", top: "35.5%", height: "0.4cqw", width: "0.4cqw", minHeight: 4, minWidth: 4, transform: "translate(-50%,0)" }}
        />
        <div
          className="absolute flex flex-col gap-[1.1em] text-[#b9bccb]"
          style={{ ...SANS, left: "67%", top: "20%", width: "17.5%", fontSize: "max(12px,0.92cqw)", lineHeight: 1.62 }}
        >
          <p>
            Concierge advises founders, investors, and globally mobile families
            on second citizenship, residency planning, and international
            positioning.
          </p>
          <p>
            We design discreet, compliant strategies that fit your life, not the
            other way around.
          </p>
        </div>

        {/* CTAs */}
        <div
          className="absolute z-20 flex items-stretch gap-[1cqw]"
          style={{ left: "6.9%", top: "67.5%" }}
        >
          <Link
            href="/programs"
            className="group inline-flex items-center gap-[0.8em] rounded-full bg-[#bbc4f7] font-semibold text-[#242d58] transition-colors hover:bg-[#cbd1fa]"
            style={{ ...SANS, fontSize: "max(12px,0.92cqw)", padding: "1.1em 1.5em 1.1em 1.7em" }}
          >
            Explore Programmes
            <span className="inline-flex items-center justify-center rounded-full bg-[#242d58] text-[#bbc4f7]" style={{ height: "2.2em", width: "2.2em" }}>
              <ArrowRight className="h-[1.05em] w-[1.05em] transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center gap-[0.8em] rounded-full border border-white/15 font-semibold text-[#e9eaf0] transition-colors hover:border-white/30 hover:bg-white/[0.04]"
            style={{ ...SANS, fontSize: "max(12px,0.92cqw)", padding: "1.1em 1.5em 1.1em 1.7em" }}
          >
            How We Work
            <span className="inline-flex items-center justify-center rounded-full border border-white/20 text-[#bbc4f7]" style={{ height: "2.2em", width: "2.2em" }}>
              <PlayGlyph className="h-[0.95em] w-[0.95em]" />
            </span>
          </Link>
        </div>

        {/* stats */}
        <div
          aria-hidden
          className="absolute h-px bg-white/12"
          style={{ left: "6.9%", top: "81.5%", width: "26%" }}
        />
        <dl
          className="absolute z-20 flex"
          style={{ left: "6.9%", top: "84%" }}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col"
              style={{
                paddingLeft: index === 0 ? 0 : "1.7cqw",
                marginLeft: index === 0 ? 0 : "1.7cqw",
                borderLeft: index === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <dt
                className="font-semibold uppercase text-[#8f93a3]"
                style={{ ...SANS, fontSize: "max(9px,0.66cqw)", letterSpacing: "0.16em" }}
              >
                {stat.label}
              </dt>
              <dd
                className="text-[#eef0f6]"
                style={{ ...SANS, fontWeight: 500, fontSize: "max(20px,1.9cqw)", letterSpacing: "-0.03em", marginTop: "0.35em" }}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Panama focus card */}
        <div
          className="absolute z-20"
          style={{ left: "78.6%", top: "39%", width: "14.4%", height: "35.5%" }}
        >
          <FocusCard />
        </div>

        {/* scroll cue */}
        <button
          type="button"
          onClick={scrollOnward}
          className="group absolute z-20 flex items-center gap-[0.9em]"
          style={{ left: "78.6%", top: "87.5%" }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full border border-white/20 text-[#c9ccd8] transition-colors group-hover:border-[#bbc4f7]/60 group-hover:text-[#bbc4f7]"
            style={{ height: "2.9cqw", width: "2.9cqw", minHeight: 34, minWidth: 34 }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[40%] w-[40%] transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden>
              <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
            </svg>
          </span>
          <span
            className="font-semibold uppercase text-[#8f93a3]"
            style={{ ...SANS, fontSize: "max(9px,0.66cqw)", letterSpacing: "0.22em" }}
          >
            Scroll to discover
          </span>
        </button>
        </div>
      </section>

      {/* ════ MOBILE / TABLET ════ */}
      <section className="relative overflow-hidden bg-[#0d1017] px-6 pb-16 pt-12 sm:px-8 lg:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 40% at 20% 0%, rgba(187,196,247,0.08), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
            <p
              className="text-[0.68rem] font-semibold uppercase leading-relaxed tracking-[0.2em] text-[#9aa0b8]"
              style={SANS}
            >
              Private advisory for global mobility
            </p>
          </div>

          <h1 className="mt-6 tracking-[-0.03em]">
            {[
              { t: "Jurisdiction", serif: false },
              { t: "strategy", serif: true },
              { t: "for a", serif: false },
              { t: "borderless", serif: true },
              { t: "life.", serif: false },
            ].map((word) => (
              <span
                key={word.t}
                className="block leading-[0.98]"
                style={{
                  ...(word.serif ? SERIF : SANS),
                  fontWeight: word.serif ? 400 : 500,
                  color: word.serif ? "#c4caf1" : "#eef0f6",
                  fontSize: word.serif
                    ? "clamp(3rem,15vw,4.6rem)"
                    : "clamp(2.7rem,13vw,4rem)",
                }}
              >
                {word.t}
              </span>
            ))}
          </h1>

          <div className="relative mt-8 overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 10" }}>
            <Image
              src="/images/programs/portugal.jpg"
              alt="Coastal advisory destination at dusk"
              fill
              sizes="100vw"
              className="object-cover object-[58%_50%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017]/70 to-transparent" />
          </div>

          <div className="mt-7 space-y-4 text-[0.95rem] leading-7 text-[#b9bccb]" style={SANS}>
            <p>
              Concierge advises founders, investors, and globally mobile families
              on second citizenship, residency planning, and international
              positioning.
            </p>
            <p>
              We design discreet, compliant strategies that fit your life, not
              the other way around.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            <Link
              href="/programs"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-6 text-sm font-semibold text-[#242d58] transition-colors hover:bg-[#cbd1fa]"
              style={SANS}
            >
              Explore Programmes
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-[#e9eaf0] transition-colors hover:bg-white/[0.04]"
              style={SANS}
            >
              How We Work
              <PlayGlyph className="h-3 w-3 text-[#bbc4f7]" />
            </Link>
          </div>

          <div className="mt-9" style={{ minHeight: "20rem" }}>
            <FocusCard compact />
          </div>

          <dl className="mt-9 grid grid-cols-3 gap-3 border-t border-white/12 pt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8f93a3]"
                  style={SANS}
                >
                  {stat.label}
                </dt>
                <dd
                  className="mt-1.5 text-[1.6rem] tracking-[-0.03em] text-[#eef0f6]"
                  style={{ ...SANS, fontWeight: 500 }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
