"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  FAQ_ITEMS,
  PROGRAMS,
  TESTIMONIALS,
  type Program,
} from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { ShaderBackground } from "@/components/ui/shaders-hero-section";
import { OpenQualifyButton } from "./OpenQualifyButton";

const EASE = [0.22, 1, 0.36, 1] as const;
const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
};
const BODY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
};
const SERIF_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
};

const primaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-6 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-colors hover:bg-[#a9b3ea] sm:w-auto";
const secondaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold tracking-[0.01em] text-[#dfe2eb] transition-colors hover:bg-white/[0.08] sm:w-auto";
const darkSecondaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#bbc4f7]/35 bg-[#bbc4f7]/12 px-6 text-sm font-semibold tracking-[0.01em] text-[#dfe2eb] transition-colors hover:bg-[#bbc4f7]/18 sm:w-auto";
const sectionPaddingClass = "py-[clamp(4.75rem,8vw,6.75rem)]";
const eyebrowClass =
  "text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]";
const sectionTitleClass =
  "mt-4 max-w-[11ch] text-balance text-[clamp(2.45rem,4.8vw,4.35rem)] leading-[0.98] tracking-[-0.04em] text-[#dfe2eb]";
const sectionBodyClass = "mt-5 max-w-[54ch] text-base leading-8 text-[#c6c6cb]";

const proofItems = [
  {
    value: "500+",
    label: "clients guided",
    detail: "Private advisory across citizenship, residency, and global positioning.",
  },
  {
    value: "15+",
    label: "active programmes",
    detail: "Real routes across the Caribbean, Europe, the Middle East, and the Americas.",
  },
  {
    value: "98%",
    label: "approval rate",
    detail: "Careful screening, document discipline, and experienced submission support.",
  },
] as const;

const processSteps = [
  {
    step: "01",
    title: "Assessment",
    description:
      "We map nationality, family composition, liquidity, timeline, and strategic objectives before discussing routes.",
    outcome: "Clear constraints and viable jurisdictions.",
  },
  {
    step: "02",
    title: "Matching",
    description:
      "We narrow the market to the jurisdictions that genuinely fit your access goals, tax posture, and lifestyle preferences.",
    outcome: "A short list with tradeoffs explained plainly.",
  },
  {
    step: "03",
    title: "Due diligence",
    description:
      "Before formal submission, we pressure-test documents, source of funds, and background checks to reduce avoidable friction.",
    outcome: "Cleaner files and fewer surprises downstream.",
  },
  {
    step: "04",
    title: "Execution",
    description:
      "From advisor coordination to submission and issuance, the process stays structured, discreet, and tightly managed.",
    outcome: "One guided track from qualification to approval.",
  },
] as const;

const valuePillars = [
  {
    title: "Discretion",
    body: "Sensitive planning handled with a private-client tone, measured communication, and disciplined disclosure.",
  },
  {
    title: "Strategy",
    body: "Route selection framed around mobility, tax exposure, family inclusion, and long-term optionality rather than hype.",
  },
  {
    title: "Execution",
    body: "Advisory support that stays involved after the first conversation, through paperwork, diligence, and submission.",
  },
] as const;

const featuredProgramOrder = [
  "portugal",
  "dubai",
  "st-kitts-and-nevis",
  "grenada",
  "serbia",
  "dominica",
] as const;

const featuredPrograms = featuredProgramOrder
  .map((slug) => PROGRAMS.find((program) => program.slug === slug))
  .filter((program): program is Program => Boolean(program));

const heroProgram = featuredPrograms.find((program) => program.slug === "dubai");
const heroSelectedPrograms = featuredPrograms.slice(0, 3);
const optimiseItems = [
  "Jurisdictions aligned to family inclusion and long-term flexibility.",
  "Qualification-first screening before time or capital gets committed.",
  "Execution that stays sober about diligence, timelines, and edge cases.",
] as const;

function formatInvestment(program: Program) {
  return `From ${formatCurrency(program.minInvestment, program.currency)}`;
}

function formatTimeline(program: Program) {
  if (!program.processingTimeMonths) {
    return "Timeline varies";
  }

  return `${program.processingTimeMonths} month${
    program.processingTimeMonths > 1 ? "s" : ""
  }`;
}

function getProgramImage(program: Program) {
  return `/images/programs/${program.slug}.jpg`;
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-96px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function FeaturedProgramCard({
  program,
  className,
  priority = false,
  variant = "feature",
}: {
  program: Program;
  className?: string;
  priority?: boolean;
  variant?: "feature" | "compact";
}) {
  const isCompact = variant === "compact";

  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-[28px] border border-white/8 bg-[#1B1A2B] text-[#dfe2eb]",
        className
      )}
    >
      <Image
        src={getProgramImage(program)}
        alt={program.country}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 48vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#11101C] via-[#11101C]/55 via-38% to-transparent" />
      <div className="relative flex h-full min-h-[20rem] flex-col justify-between p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#bbc4f7]">
          <span className="rounded-full border border-[#bbc4f7]/25 bg-[#23233A]/80 px-3 py-1">
            {program.type}
          </span>
          {program.exclusive ? (
            <span className="rounded-full border border-[#bbc4f7]/25 bg-[#23233A]/80 px-3 py-1">
              Exclusive
            </span>
          ) : null}
        </div>

        <div className={cn("space-y-4", isCompact && "space-y-3.5")}>
          <div className="space-y-2.5">
            <div
              className={cn(
                "max-w-[9ch] text-balance leading-[0.96] tracking-[-0.035em] text-[#dfe2eb]",
                isCompact
                  ? "text-[clamp(1.35rem,2.2vw,2rem)]"
                  : "text-[clamp(1.55rem,3vw,2.45rem)]"
              )}
              style={DISPLAY_FONT}
            >
              {program.country}
            </div>
            <p
              className={cn(
                "text-sm text-[#c6c6cb]",
                isCompact ? "max-w-[28ch] leading-6" : "max-w-[34ch] leading-6"
              )}
              style={BODY_FONT}
            >
              {program.marketingHook}
            </p>
          </div>

          <dl
            className={cn(
              "gap-3 text-sm text-[#dfe2eb]",
              isCompact ? "grid grid-cols-2" : "flex flex-wrap"
            )}
          >
            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-[#11101C]/55 px-4 py-3",
                isCompact ? "min-w-0" : "min-w-[7.7rem] flex-1"
              )}
            >
              <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                Entry point
              </dt>
              <dd className="mt-2 font-semibold">{formatInvestment(program)}</dd>
            </div>
            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-[#11101C]/55 px-4 py-3",
                isCompact ? "min-w-0" : "min-w-[7.7rem] flex-1"
              )}
            >
              <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                Timeline
              </dt>
              <dd className="mt-2 font-semibold">{formatTimeline(program)}</dd>
            </div>
            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-[#11101C]/55 px-4 py-3",
                isCompact ? "col-span-2 min-w-0" : "min-w-[7.7rem] flex-1"
              )}
            >
              <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                Access
              </dt>
              <dd className="mt-2 font-semibold">
                {program.visaFreeCount
                  ? `${program.visaFreeCount} visa-free`
                  : "Structured planning"}
              </dd>
            </div>
          </dl>

          <div
            className={cn(
              "inline-flex items-center gap-2 pt-1 text-sm font-semibold text-[#dfe2eb]",
              isCompact && "pt-0.5"
            )}
          >
            Review route
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LandingV2Page() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="relative overflow-x-hidden bg-[#11101C] text-[#F5F5F6]">
      <section className="border-b border-white/8">
        <ShaderBackground>
          <div className="relative z-10 mx-auto max-w-7xl px-6 pb-[clamp(3rem,min(8vw,7vh),7.5rem)] pt-[clamp(3rem,min(8vw,7vh),7rem)] lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:items-start">
              <Reveal className="lg:col-span-7">
                <div className="max-w-[44rem] space-y-7 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#bbc4f7]/20 bg-[#23233A]/70 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]">
                  <span className="h-2 w-2 rounded-full bg-[#bbc4f7]" />
                  Private advisory for global mobility
                </div>

                <div className="space-y-6">
                  <h1
                    className="max-w-[11ch] text-balance text-[clamp(3rem,7vw,6.15rem)] leading-[0.92] tracking-[-0.05em] text-[#dfe2eb]"
                    style={DISPLAY_FONT}
                  >
                    Build a more sovereign life with a jurisdiction strategy that
                    fits.
                  </h1>
                  <p
                    className="max-w-[58ch] text-base leading-8 text-[#c6c6cb] sm:text-[1.125rem] sm:leading-9"
                    style={BODY_FONT}
                  >
                    Concierge advises founders, investors, and globally mobile
                    families on second citizenship, residency planning, and
                    international positioning. Start with a discreet
                    qualification review, then move forward with a route built
                    around your actual constraints.
                  </p>
                </div>

                <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
                  <OpenQualifyButton className={primaryButtonClass}>
                    Get Qualified
                    <ArrowRight className="h-4 w-4" />
                  </OpenQualifyButton>
                  <Link href="/programs" className={secondaryButtonClass}>
                    Browse Programmes
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                </div>
              </Reveal>

              <Reveal className="lg:col-span-5 lg:pt-10 xl:pt-12" delay={0.08}>
                <div className="space-y-4">
                  <article className="relative isolate min-h-[28rem] overflow-hidden rounded-[38px] border border-white/8 bg-[#1B1A2B] sm:min-h-[30rem]">
                    {heroProgram ? (
                      <Image
                        src={getProgramImage(heroProgram)}
                        alt={heroProgram.country}
                        fill
                        priority
                        className="object-cover"
                        sizes="(min-width: 1024px) 34vw, 100vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11101C] via-[#11101C]/48 via-45% to-transparent" />
                    <div className="relative flex h-full flex-col justify-end p-6 sm:p-7 lg:p-8">
                      <div className="max-w-[30rem] space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#bbc4f7]/25 bg-[#23233A]/75 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
                          Focus route
                        </div>

                        <div className="space-y-3">
                          <p
                            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
                            style={BODY_FONT}
                          >
                            {heroProgram?.type ?? "Residency"}
                          </p>
                          <div
                            className="max-w-[10ch] text-balance text-[clamp(2.15rem,4vw,3.45rem)] leading-[0.94] tracking-[-0.045em] text-[#dfe2eb]"
                            style={DISPLAY_FONT}
                          >
                            {heroProgram?.country ?? "UAE"}
                          </div>
                          <p className="max-w-[44ch] text-base leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                            {heroProgram?.marketingHook ??
                              "A strategic base for entrepreneurs who want speed, tax efficiency, and world-class infrastructure."}
                          </p>
                        </div>

                        <dl className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-[#11101C]/60 px-4 py-3">
                            <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                              Entry point
                            </dt>
                            <dd className="mt-2 font-semibold text-[#dfe2eb]">
                              {heroProgram ? formatInvestment(heroProgram) : "From AED 100,000"}
                            </dd>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-[#11101C]/60 px-4 py-3">
                            <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                              Timeline
                            </dt>
                            <dd className="mt-2 font-semibold text-[#dfe2eb]">
                              {heroProgram ? formatTimeline(heroProgram) : "2 months"}
                            </dd>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-[#11101C]/60 px-4 py-3">
                            <dt className="text-[0.63rem] uppercase tracking-[0.2em] text-[#bbc4f7]">
                              Access
                            </dt>
                            <dd className="mt-2 font-semibold text-[#dfe2eb]">
                              {heroProgram?.visaFreeCount
                                ? `${heroProgram.visaFreeCount} visa-free`
                                : "Structured planning"}
                            </dd>
                          </div>
                        </dl>

                        {heroProgram ? (
                          <Link
                            href={`/programs/${heroProgram.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#dfe2eb]"
                          >
                            Review route
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>

                  <dl className="grid gap-x-6 gap-y-5 border-t border-white/10 pt-5 sm:grid-cols-3">
                    {proofItems.map((item) => (
                      <div key={item.label} className="space-y-2.5">
                        <dt
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]"
                          style={BODY_FONT}
                        >
                          {item.label}
                        </dt>
                        <dd
                          className="text-[1.7rem] leading-none tracking-[-0.04em] text-[#dfe2eb]"
                          style={DISPLAY_FONT}
                        >
                          {item.value}
                        </dd>
                        <p className="max-w-[22ch] text-sm leading-6 text-[#c6c6cb]" style={BODY_FONT}>
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>
        </ShaderBackground>
      </section>

      <section className="border-b border-white/8 bg-[#151423] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-start">
                <div className="max-w-[28rem] space-y-3">
                  <p className={eyebrowClass} style={BODY_FONT}>
                    Selected pathways
                  </p>
                  <p className="max-w-[44ch] text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                    A quick comparison of the routes that most often enter the conversation first.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {heroSelectedPrograms.map((program) => (
                    <Link
                      key={program.slug}
                      href={`/programs/${program.slug}`}
                      className="rounded-[24px] border border-white/8 bg-[#1B1A2B] px-5 py-4 text-[#dfe2eb] transition-colors hover:bg-[#222136]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-base font-semibold" style={BODY_FONT}>
                            {program.country}
                          </p>
                          <p className="text-sm text-[#c6c6cb]" style={BODY_FONT}>
                            {program.type}
                          </p>
                        </div>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#bbc4f7]" />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]">
                          Entry point
                        </span>
                        <span className="text-sm font-semibold text-[#dfe2eb]" style={SERIF_FONT}>
                          {formatInvestment(program)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {optimiseItems.map((item) => (
                  <article
                    key={item}
                    className="rounded-[24px] border border-white/8 bg-[#1B1A2B] px-5 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#bbc4f7]" />
                      <p className="text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                        {item}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={cn("border-b border-white/8", sectionPaddingClass)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-28">
                <p className={eyebrowClass} style={BODY_FONT}>
                  Programme snapshots
                </p>
                <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
                  A wider read on six real pathways.
                </h2>
                <p className={sectionBodyClass} style={BODY_FONT}>
                  The shortlist above is a starting point. This section opens
                  the aperture with a broader read across six jurisdictions,
                  entry points, and strategic use cases.
                </p>
                <Link href="/programs" className={secondaryButtonClass}>
                  View full directory
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <div className="space-y-5 lg:col-span-8">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
                <Reveal delay={0.04}>
                  <FeaturedProgramCard
                    program={featuredPrograms[0]}
                    className="min-h-[34rem]"
                    priority
                    variant="feature"
                  />
                </Reveal>

                <div className="grid gap-5">
                  {featuredPrograms.slice(1, 3).map((program, index) => (
                    <Reveal key={program.slug} delay={0.08 + index * 0.05}>
                      <FeaturedProgramCard
                        program={program}
                        className="min-h-[18.5rem]"
                        priority={index === 0}
                        variant="compact"
                      />
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {featuredPrograms.slice(3).map((program, index) => (
                  <Reveal key={program.slug} delay={0.1 + index * 0.05}>
                    <FeaturedProgramCard
                      program={program}
                      className="min-h-[24rem]"
                      variant="compact"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("border-b border-white/8 bg-[#151423]", sectionPaddingClass)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <p className={eyebrowClass} style={BODY_FONT}>
                Advisory process
              </p>
              <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
                A quieter process, handled with more rigor.
              </h2>
              <p className={sectionBodyClass} style={BODY_FONT}>
                The goal is not to overwhelm you with options. It is to reduce
                noise quickly, then run one route with discipline.
              </p>
            </Reveal>

            <div className="space-y-5 lg:col-span-8">
              {processSteps.map((step, index) => (
                <Reveal key={step.step} delay={index * 0.05}>
                  <div className="grid gap-5 rounded-[28px] border border-white/8 bg-[#1B1A2B] p-6 md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-6 md:p-7 lg:grid-cols-[5.5rem_minmax(0,1fr)_14rem] lg:gap-7">
                    <div
                      className="text-[2.8rem] leading-none tracking-[-0.05em] text-[#bbc4f7] sm:text-[3.2rem]"
                      style={DISPLAY_FONT}
                    >
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl text-[#dfe2eb]" style={DISPLAY_FONT}>
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-[58ch] text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                        {step.description}
                      </p>
                    </div>
                    <div className="border-t border-white/8 pt-4 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p
                        className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
                        style={BODY_FONT}
                      >
                        Outcome
                      </p>
                      <p className="mt-3 max-w-[22ch] text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                        {step.outcome}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={cn("border-b border-white/8", sectionPaddingClass)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className={eyebrowClass} style={BODY_FONT}>
              Why Concierge
            </p>
            <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
              Strategic guidance for people who want optionality, not noise.
            </h2>
            <p className={sectionBodyClass} style={BODY_FONT}>
              This version shifts the page away from abstract luxury signals and
              toward the qualities that matter more in this category: judgment,
              discretion, and execution.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {valuePillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.06}>
                <article className="h-full rounded-[30px] border border-white/8 bg-[#1B1A2B] p-7">
                  <p
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
                    style={BODY_FONT}
                  >
                    Pillar {index + 1}
                  </p>
                  <h3
                    className="mt-5 max-w-[11ch] text-balance text-[clamp(2rem,3vw,2.5rem)] leading-[0.97] tracking-[-0.04em] text-[#dfe2eb]"
                    style={DISPLAY_FONT}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mt-4 max-w-[34ch] text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("border-b border-white/8 bg-[#151423]", sectionPaddingClass)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className={eyebrowClass} style={BODY_FONT}>
              Testimonials
            </p>
            <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
              A calmer way to present client proof.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-12">
            <Reveal className="lg:col-span-7" delay={0.04}>
              <article className="h-full rounded-[34px] border border-white/8 bg-[#23233A] p-8 text-[#dfe2eb] sm:p-10">
                <p className={eyebrowClass} style={BODY_FONT}>
                  Client perspective
                </p>
                <blockquote
                  className="mt-6 max-w-[17ch] text-balance text-[clamp(1.9rem,3vw,3rem)] leading-[1.05] tracking-[-0.04em] text-[#dfe2eb]"
                  style={DISPLAY_FONT}
                >
                  “{TESTIMONIALS[0].quote}”
                </blockquote>
                <div className="mt-10 border-t border-white/10 pt-6">
                  <p className="text-base font-semibold text-[#dfe2eb]" style={BODY_FONT}>
                    {TESTIMONIALS[0].name}
                  </p>
                  <p className="mt-1 text-sm text-[#c6c6cb]" style={BODY_FONT}>
                    {TESTIMONIALS[0].role} · {TESTIMONIALS[0].program}
                  </p>
                </div>
              </article>
            </Reveal>

            <div className="grid gap-5 lg:col-span-5">
              {TESTIMONIALS.slice(1).map((testimonial, index) => (
                <Reveal key={testimonial.name} delay={0.08 + index * 0.05}>
                  <article className="rounded-[28px] border border-white/8 bg-[#1B1A2B] p-7">
                    <blockquote
                      className="max-w-[18ch] text-balance text-[clamp(1.35rem,2vw,1.7rem)] leading-[1.12] tracking-[-0.03em] text-[#dfe2eb]"
                      style={DISPLAY_FONT}
                    >
                      “{testimonial.quote}”
                    </blockquote>
                    <div className="mt-8 border-t border-white/8 pt-5">
                      <p className="text-sm font-semibold text-[#dfe2eb]" style={BODY_FONT}>
                        {testimonial.name}
                      </p>
                      <p className="mt-1 text-sm text-[#c6c6cb]" style={BODY_FONT}>
                        {testimonial.role} · {testimonial.program}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={cn("border-b border-white/8", sectionPaddingClass)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <div className="max-w-[28rem]">
                <p className={eyebrowClass} style={BODY_FONT}>
                FAQ
                </p>
                <h2
                  className="mt-4 max-w-[12ch] text-balance text-[clamp(2rem,3vw,3.35rem)] leading-[1.01] tracking-[-0.04em] text-[#dfe2eb]"
                  style={DISPLAY_FONT}
                >
                Questions that usually come up in the first conversation.
                </h2>
                <p className="mt-5 max-w-[42ch] text-base leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                The answers stay factual and specific. The tone should feel
                closer to an informed briefing than a sales page.
                </p>
              </div>
            </Reveal>

            <div className="space-y-3 lg:col-span-8">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <Reveal key={item.question} delay={index * 0.04}>
                    <article className="rounded-[26px] border border-white/8 bg-[#1B1A2B] px-6 py-5 sm:px-7">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-6 text-left"
                        onClick={() =>
                          setOpenFaq((current) => (current === index ? -1 : index))
                        }
                      >
                        <span
                          className="max-w-[22ch] text-balance text-[clamp(1.3rem,2.2vw,1.65rem)] leading-[1.12] tracking-[-0.03em] text-[#dfe2eb]"
                          style={DISPLAY_FONT}
                        >
                          {item.question}
                        </span>
                        <span
                          className={cn(
                            "mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#23233A] transition-transform duration-300",
                            isOpen && "rotate-180"
                          )}
                        >
                          <ChevronDown className="h-4 w-4 text-[#bbc4f7]" />
                        </span>
                      </button>
                      <div
                        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out"
                        style={{
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          opacity: isOpen ? 1 : 0.5,
                        }}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-[60ch] pt-5 text-sm leading-7 text-[#c6c6cb]" style={BODY_FONT}>
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-[clamp(4.75rem,8vw,6.75rem)] lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="overflow-hidden rounded-[40px] bg-[#1B1A2B] px-7 py-10 text-[#dfe2eb] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div className="space-y-6">
                  <p className={eyebrowClass} style={BODY_FONT}>
                    Final CTA
                  </p>
                  <h2
                    className="max-w-[12ch] text-balance text-[clamp(2.6rem,4.8vw,4.4rem)] leading-[0.96] tracking-[-0.04em] text-[#dfe2eb]"
                    style={DISPLAY_FONT}
                  >
                    Begin with a private qualification review.
                  </h2>
                  <p className="max-w-[56ch] text-base leading-8 text-[#c6c6cb]" style={BODY_FONT}>
                    No obligation, no generic intake. We start by narrowing the
                    field to the routes that actually suit your nationality,
                    capital, family structure, and time horizon.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap">
                    <OpenQualifyButton className={primaryButtonClass}>
                      Get Qualified
                      <ArrowRight className="h-4 w-4" />
                    </OpenQualifyButton>
                    <Link href="/programs" className={darkSecondaryButtonClass}>
                      Browse Programmes
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#23233A] px-5 py-4">
                    <div className="flex items-center gap-3 text-sm text-[#c6c6cb]" style={BODY_FONT}>
                      <Clock3 className="h-4 w-4 text-[#bbc4f7]" />
                      <span>Free initial review · qualification-first · routed privately</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
