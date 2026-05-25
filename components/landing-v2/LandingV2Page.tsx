"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
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
import { OpenApplyButton } from "./OpenApplyButton";
import { useTracedShape } from "@/hooks/useTracedShape";
import { CARD_SHAPES } from "@/lib/cardShapes";

const EASE = [0.22, 1, 0.36, 1] as const;
const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
};
const BODY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
};
const SERIF_FONT = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.015em",
};

const primaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-6 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-colors hover:bg-[#a9b3ea] sm:w-auto";
const secondaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold tracking-[0.01em] text-[#dfe2eb] transition-colors hover:bg-white/[0.08] sm:w-auto";
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

const heroProgram = PROGRAMS.find((program) => program.slug === "panama");
// Scatter layout: each card's width/height ratio matches its CARD_SHAPES
// ratio (w/h × container_aspect 1159/880 = shape ratio) so the clip-path
// renders the blob undistorted. Cards are scaled up to nearly touch with
// ~1% gaps everywhere, no overlaps.
const snapshotCardLayouts = [
  {
    shapeKey: "portugal",
    programIndex: 0,
    variant: "feature",
    priority: true,
    left: "6%",
    top: "1%",
    width: "35.5%",
    height: "51%",
    z: "10",
    mobileClass: "min-h-[29rem]",
    parallax: 50,
  },
  {
    shapeKey: "uae",
    programIndex: 1,
    variant: "compact",
    priority: true,
    left: "42.5%",
    top: "-4%",
    width: "29.2%",
    height: "51%",
    z: "10",
    mobileClass: "min-h-[28rem]",
    parallax: 80,
  },
  {
    shapeKey: "stkitts",
    programIndex: 2,
    variant: "compact",
    left: "70.36%",
    top: "20%",
    width: "23.16%",
    height: "50%",
    z: "10",
    mobileClass: "min-h-[30rem]",
    parallax: 60,
  },
  {
    shapeKey: "grenada",
    programIndex: 3,
    variant: "compact",
    left: "2%",
    top: "53%",
    width: "22.7%",
    height: "45%",
    z: "10",
    mobileClass: "min-h-[25.5rem]",
    parallax: 75,
  },
  {
    // Serbia program rendered with the dominica shape (swapped).
    shapeKey: "dominica",
    programIndex: 4,
    variant: "compact",
    left: "26.3%",
    top: "48%",
    width: "21.78%",
    height: "47%",
    z: "10",
    mobileClass: "min-h-[26rem]",
    parallax: 90,
  },
  {
    // Dominica program rendered with the serbia shape (swapped).
    shapeKey: "serbia",
    programIndex: 5,
    variant: "compact",
    left: "49.2%",
    top: "48%",
    width: "20.15%",
    height: "45%",
    z: "10",
    mobileClass: "min-h-[25.5rem]",
    parallax: 65,
  },
] as const;
type SnapshotLayout = (typeof snapshotCardLayouts)[number];

function getSnapshotLayoutStyle(layout: SnapshotLayout) {
  return {
    "--snapshot-left": layout.left,
    "--snapshot-top": layout.top,
    "--snapshot-width": layout.width,
    "--snapshot-height": layout.height,
    "--snapshot-z": layout.z,
  } as CSSProperties;
}

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

function formatSnapshotAccess(program: Program) {
  if (program.slug === "portugal") {
    return "181 visa-free";
  }

  if (program.slug === "serbia") {
    return "138 visa-free";
  }

  return program.visaFreeCount
    ? `${program.visaFreeCount} visa-free`
    : "Structured planning";
}

function getProgramImage(program: Program) {
  return `/images/programs/${program.slug}.jpg`;
}

function getProgramImagePosition(program: Program) {
  switch (program.slug) {
    case "portugal":
      return "50% 58%";
    case "dubai":
      return "52% 48%";
    case "st-kitts-and-nevis":
      return "52% 54%";
    case "grenada":
      return "48% 48%";
    case "serbia":
      return "52% 52%";
    case "dominica":
      return "48% 52%";
    default:
      return "50% 50%";
  }
}

function Reveal({
  children,
  className,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
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
  shapeKey,
}: {
  program: Program;
  className?: string;
  priority?: boolean;
  variant?: "feature" | "compact";
  shapeKey?: string;
}) {
  const isCompact = variant === "compact";
  const shape = shapeKey ? CARD_SHAPES[shapeKey] : null;
  const { ref, clipPath, pathD, viewBox } = useTracedShape(shape?.pts ?? []);
  const glassBorderId = `snapshot-glass-border-${program.slug}`;

  return (
    <Link
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={`/programs/${program.slug}`}
      className={cn(
        "group relative isolate block text-[#dfe2eb]",
        className
      )}
    >
      <div
        className="absolute inset-0 overflow-hidden bg-[#0a0d18]/70"
        style={{
          clipPath,
          borderRadius: undefined,
          filter:
            "drop-shadow(0 30px 44px rgba(0, 0, 0, 0.46)) drop-shadow(0 10px 18px rgba(4, 9, 25, 0.34))",
        }}
      >
        <Image
          src={getProgramImage(program)}
          alt={program.country}
          fill
          priority={priority}
          className="object-cover brightness-[0.92] saturate-[1.04] contrast-[1.08]"
          style={{ objectPosition: getProgramImagePosition(program) }}
          sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 48vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050713]/88 via-[#071021]/50 via-55% to-[#172f60]/6" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/13 via-transparent to-transparent opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_7%,rgba(255,255,255,0.16),transparent_12rem)] opacity-65" />
        <div
          className={cn(
            "relative z-10 flex min-h-[inherit] flex-col p-[clamp(1.45rem,2vw,2.6rem)]",
            isCompact
              ? "gap-4 pb-[clamp(2.1rem,3vw,3.4rem)] xl:px-[clamp(1.95rem,2.6vw,2.75rem)] xl:pb-2"
              : "gap-6 pb-[clamp(2.35rem,3.4vw,3.9rem)] xl:px-[clamp(2.5rem,3.75vw,3.75rem)] xl:pb-2",
            program.slug === "st-kitts-and-nevis" && "xl:pb-16"
          )}
        >
          <div
            className={cn(
              "space-y-4",
              isCompact && "ml-6 space-y-3 pt-3 xl:ml-2 xl:pt-0",
              program.slug === "dubai" && "xl:pt-6",
              program.slug === "st-kitts-and-nevis" && "xl:ml-6",
              program.slug === "dominica" && "xl:-ml-1"
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 font-semibold uppercase tracking-[0.2em] text-[#bbc4f7]",
                isCompact ? "text-[0.56rem]" : "text-[0.6rem]"
              )}
            >
              <span className="rounded-full border border-[#bbc4f7]/20 bg-[#11162a]/78 px-2.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md [text-indent:0.2em]">
                {program.type}
              </span>
              {program.exclusive ? (
                <span className="rounded-full border border-[#bbc4f7]/20 bg-[#11162a]/78 px-2.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md [text-indent:0.2em]">
                  Exclusive
                </span>
              ) : null}
            </div>

            <div className={cn("space-y-3", isCompact && "space-y-2.5")}>
              <div
                className={cn(
                  "text-balance leading-[0.98] tracking-[-0.035em] text-[#f4f6fb]",
                  isCompact
                    ? "max-w-[8.8ch] text-[clamp(1.35rem,1.75vw,1.85rem)]"
                    : "max-w-[9.5ch] text-[clamp(1.65rem,2.45vw,2.25rem)]"
                )}
                style={DISPLAY_FONT}
              >
                {program.country}
              </div>
              <p
                className={cn(
                  "text-[#d7d9e1]",
                  isCompact
                    ? "max-w-[27ch] text-[0.78rem] leading-[1.45rem]"
                    : "max-w-[50ch] text-[0.82rem] leading-[1.55rem]"
                )}
                style={BODY_FONT}
              >
                {program.marketingHook}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mt-auto space-y-3.5",
              program.slug === "grenada" || program.slug === "dominica"
                ? "pt-0"
                : program.slug === "st-kitts-and-nevis"
                ? "pt-4"
                : program.slug === "dubai"
                ? "pt-8"
                : program.slug === "serbia"
                ? "pt-10"
                : "pt-16",
              isCompact && "space-y-2.5 xl:ml-[3%] xl:w-[88%] xl:max-w-[16rem]"
            )}
          >
            <dl
              className={cn(
                "grid grid-cols-2 overflow-hidden rounded-[0.5rem] border border-white/14 bg-[#050816]/62 text-[#f4f6fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md",
                isCompact ? "text-[0.72rem]" : "text-[0.78rem]"
              )}
            >
              <div className="border-r border-white/12 px-3 py-2.5 sm:px-3.5">
                <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
                  Entry point
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatInvestment(program)}
                </dd>
              </div>
              <div className="px-3 py-2.5 sm:px-3.5">
                <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
                  Timeline
                </dt>
                <dd className="mt-1 font-semibold">{formatTimeline(program)}</dd>
              </div>
              <div className="col-span-2 border-t border-white/12 px-3 py-2.5 sm:px-3.5">
                <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
                  Access
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatSnapshotAccess(program)}
                </dd>
              </div>
            </dl>

            <div
              className={cn(
                "inline-flex items-center gap-2 font-semibold text-[#f4f6fb]",
                isCompact ? "text-[0.78rem]" : "text-[0.82rem]",
                isCompact && "pt-0.5"
              )}
            >
              Review route
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
      {pathD ? (
        <svg
          className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
          viewBox={viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={glassBorderId}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0" stopColor="rgba(248, 251, 255, 0.62)" />
              <stop offset="0.24" stopColor="rgba(188, 205, 255, 0.34)" />
              <stop offset="0.56" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="0.82" stopColor="rgba(144, 171, 255, 0.36)" />
              <stop offset="1" stopColor="rgba(255, 255, 255, 0.48)" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke={`url(#${glassBorderId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </Link>
  );
}

function FloatingSnapshotCard({
  layout,
  index,
  scrollYProgress,
  prefersReducedMotion,
}: {
  layout: SnapshotLayout;
  index: number;
  scrollYProgress: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const program = featuredPrograms[layout.programIndex];
  const range = layout.parallax ?? 60;
  // top-of-section → bottom-of-section maps to +range → -range, so
  // each card drifts upward as the section travels down the viewport.
  const parallaxY = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const delay = 0.04 + index * 0.035;

  if (!program) return null;

  const card = (
    <FeaturedProgramCard
      program={program}
      className={cn(layout.mobileClass, "xl:h-full xl:min-h-0")}
      priority={layout.priority}
      variant={layout.variant}
      shapeKey={layout.shapeKey}
    />
  );

  if (prefersReducedMotion) {
    return (
      <div
        className="xl:absolute xl:left-[var(--snapshot-left)] xl:top-[var(--snapshot-top)] xl:z-[var(--snapshot-z)] xl:h-[var(--snapshot-height)] xl:w-[var(--snapshot-width)]"
        style={getSnapshotLayoutStyle(layout)}
      >
        {card}
      </div>
    );
  }

  // Per-card ambient drift: each shape bobs autonomously on its own loop
  // with varied amplitude / duration / phase so the section feels alive
  // without a "synchronized" tell.
  const driftAmp = 4 + (index % 3); // 4, 5, 6, 4, 5, 6
  const driftAmpX = 1.5 + (index % 2); // 1.5, 2.5, 1.5, 2.5, 1.5, 2.5
  const driftDuration = 13 + index * 0.8; // 13, 13.8, ..., 17
  const driftDelay = -index * 2; // negative delay → start mid-cycle

  return (
    <motion.div
      className="xl:absolute xl:left-[var(--snapshot-left)] xl:top-[var(--snapshot-top)] xl:z-[var(--snapshot-z)] xl:h-[var(--snapshot-height)] xl:w-[var(--snapshot-width)]"
      style={{ ...getSnapshotLayoutStyle(layout), y: parallaxY }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-96px" }}
        transition={{ duration: 0.75, delay, ease: EASE }}
      >
        <motion.div
          className="h-full w-full"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
          animate={{
            x: [0, driftAmpX, 0, -driftAmpX, 0],
            y: [0, -driftAmp, 0, driftAmp * 0.6, 0],
          }}
          transition={{
            duration: driftDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: driftDelay,
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        >
          {card}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function SimpleSnapshotCard({
  program,
  priority = false,
}: {
  program: Program;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group relative isolate flex min-h-[19rem] flex-col overflow-hidden rounded-[24px] border border-white/8 bg-[#0a0d18]/70 text-[#dfe2eb] shadow-[0_24px_40px_rgba(0,0,0,0.38)] sm:min-h-[20rem]"
    >
      <Image
        src={getProgramImage(program)}
        alt={program.country}
        fill
        priority={priority}
        className="object-cover brightness-[0.92] saturate-[1.04] contrast-[1.08]"
        style={{ objectPosition: getProgramImagePosition(program) }}
        sizes="(min-width: 1280px) 0px, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050713]/92 via-[#071021]/58 via-55% to-[#172f60]/14" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-65" />

      <div className="relative z-10 flex h-full flex-col gap-5 p-6 sm:gap-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#bbc4f7]">
          <span className="rounded-full border border-[#bbc4f7]/20 bg-[#11162a]/78 px-2.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md [text-indent:0.2em]">
            {program.type}
          </span>
          {program.exclusive ? (
            <span className="rounded-full border border-[#bbc4f7]/20 bg-[#11162a]/78 px-2.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md [text-indent:0.2em]">
              Exclusive
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-3">
          <div
            className="text-balance text-[clamp(2rem,5.5vw,2.5rem)] leading-[0.98] tracking-[-0.035em] text-[#f4f6fb]"
            style={DISPLAY_FONT}
          >
            {program.country}
          </div>
          <p
            className="max-w-[44ch] text-[0.85rem] leading-[1.55rem] text-[#d7d9e1]"
            style={BODY_FONT}
          >
            {program.marketingHook}
          </p>
        </div>

        <dl className="grid grid-cols-3 overflow-hidden rounded-[0.5rem] border border-white/14 bg-[#050816]/62 text-[0.78rem] text-[#f4f6fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
          <div className="border-r border-white/12 px-3 py-2.5 sm:px-3.5">
            <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
              Entry point
            </dt>
            <dd className="mt-1 font-semibold">{formatInvestment(program)}</dd>
          </div>
          <div className="border-r border-white/12 px-3 py-2.5 sm:px-3.5">
            <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
              Timeline
            </dt>
            <dd className="mt-1 font-semibold">{formatTimeline(program)}</dd>
          </div>
          <div className="px-3 py-2.5 sm:px-3.5">
            <dt className="whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-[#bbc4f7]">
              Access
            </dt>
            <dd className="mt-1 font-semibold">{formatSnapshotAccess(program)}</dd>
          </div>
        </dl>

        <div className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#f4f6fb]">
          Review route
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function LandingV2Page({
  hero,
}: {
  /** Optional override for the hero section (used by Landing-V3 to swap in
   *  a different hero while reusing the rest of the page). When omitted the
   *  default V2 shader-hero renders. */
  hero?: React.ReactNode;
} = {}) {
  const [openFaq, setOpenFaq] = useState(0);
  const snapshotsSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: snapshotsScroll } = useScroll({
    target: snapshotsSectionRef,
    offset: ["start end", "end start"],
  });
  const prefersReducedMotion = useReducedMotion() ?? false;


  return (
    <div className="relative overflow-x-hidden bg-[#11101C] text-[#F5F5F6]">
      {hero ?? (
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
                    international positioning. Explore programmes directly if you
                    know your route, or take a discreet qualification review and
                    we&apos;ll build one around your actual constraints.
                  </p>
                </div>

                <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
                  <Link href="/programs" className={primaryButtonClass}>
                    Explore Programmes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <OpenQualifyButton className={primaryButtonClass}>
                    Help Me Choose
                    <ArrowUpRight className="h-4 w-4" />
                  </OpenQualifyButton>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11101C] via-[#11101C]/65 via-45% to-transparent" />
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
      )}

      <section
        ref={snapshotsSectionRef}
        id="program-snapshots"
        className="relative overflow-hidden border-y border-white/8 pb-[clamp(5rem,8vw,7.5rem)] pt-[clamp(2rem,4vw,3.25rem)] xl:min-h-[1000px] xl:pb-12 xl:pt-16"
      >
        <Image
          src="/images/snapshots-bg.jpg"
          alt=""
          fill
          className="object-cover object-[42%_54%] brightness-[1.08] saturate-[1.12] contrast-[1.04]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050713]/20 to-[#050713]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050713]/12" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#050713]/24 via-[#050713]/6 to-[#050713]/44"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent, black)",
            maskImage: "linear-gradient(to right, transparent, black)",
          }}
        />
        {prefersReducedMotion ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_53%_30%,rgba(187,196,247,0.2),transparent_27rem)]" />
        ) : (
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_53%_30%,rgba(187,196,247,0.2),transparent_27rem)]"
            animate={{ opacity: [0.78, 1, 0.78] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8% 18%, rgba(218,226,255,0.95) 0 1px, transparent 1.7px), radial-gradient(circle at 22% 7%, rgba(218,226,255,0.65) 0 1px, transparent 1.6px), radial-gradient(circle at 38% 8%, rgba(218,226,255,0.72) 0 1px, transparent 1.7px), radial-gradient(circle at 64% 5%, rgba(218,226,255,0.9) 0 1px, transparent 1.7px), radial-gradient(circle at 72% 15%, rgba(218,226,255,0.85) 0 1px, transparent 1.7px), radial-gradient(circle at 88% 28%, rgba(218,226,255,0.72) 0 1px, transparent 1.7px), radial-gradient(circle at 58% 56%, rgba(218,226,255,0.52) 0 1px, transparent 1.7px)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[113rem] px-6 lg:px-8 xl:origin-center xl:scale-[0.92]">
          <div className="grid gap-12 xl:grid-cols-[32rem_minmax(0,1fr)] xl:gap-4">
            <Reveal>
              <div className="space-y-6 xl:sticky xl:top-28 xl:pl-12 xl:pt-4">
                <p className={eyebrowClass} style={BODY_FONT}>
                  Programme snapshots
                </p>
                <h2 className="mt-4 max-w-[30rem] text-[clamp(3rem,5.6vw,5.15rem)] leading-[0.96] tracking-[-0.045em] text-[#f4f6fb]">
                  <span className="block" style={DISPLAY_FONT}>
                    A wider
                  </span>
                  <span className="block" style={DISPLAY_FONT}>
                    read on six
                  </span>
                  <em className="block font-normal" style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif", fontStyle: "italic", letterSpacing: "-0.01em" }}>
                    real pathways.
                  </em>
                </h2>
                <p className="mt-7 max-w-[34ch] text-base leading-8 text-[#d7d9e1]" style={BODY_FONT}>
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

            {/* Below desktop: simple stacked rectangular cards */}
            <div className="grid gap-5 xl:hidden">
              {snapshotCardLayouts.map((layout, index) => {
                const program = featuredPrograms[layout.programIndex];
                if (!program) return null;
                return (
                  <Reveal key={layout.shapeKey} delay={index * 0.04}>
                    <SimpleSnapshotCard
                      program={program}
                      priority={"priority" in layout ? layout.priority : false}
                    />
                  </Reveal>
                );
              })}
            </div>

            {/* Desktop: scatter shape-clipped cards with parallax */}
            <div className="hidden xl:relative xl:-ml-[4.5rem] xl:mt-6 xl:block xl:aspect-[1159/880] xl:w-[min(84vw,1304px)] xl:max-w-none">
              {/* Soft blue glow pinned behind Portugal's bottom-left in container coords. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15.5%_40%,rgba(140,165,240,0.32),transparent_10rem)]"
              />
              {snapshotCardLayouts.map((layout, index) => (
                <FloatingSnapshotCard
                  key={layout.shapeKey}
                  layout={layout}
                  index={index}
                  scrollYProgress={snapshotsScroll}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "relative overflow-hidden border-b border-white/8 bg-[#11101C]",
          sectionPaddingClass
        )}
      >
        {/* Atmospheric backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 18% 15%, rgba(187,196,247,0.08), transparent 65%), radial-gradient(ellipse 50% 70% at 85% 92%, rgba(140,165,240,0.06), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bbc4f7]/30 to-transparent"
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className={eyebrowClass} style={BODY_FONT}>
                  Advisory process
                </p>
                <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
                  A quieter process,{" "}
                  <span style={SERIF_FONT} className="font-normal">
                    handled with more rigor.
                  </span>
                </h2>
                <p className={sectionBodyClass} style={BODY_FONT}>
                  The goal is not to overwhelm you with options. It is to
                  reduce noise quickly, then run one route with discipline.
                </p>
                <div className="mt-10 flex items-center gap-3 text-[#8f9095]">
                  <span className="h-px w-12 bg-[#bbc4f7]/40" />
                  <span
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]/70"
                    style={BODY_FONT}
                  >
                    Four stages · No surprises
                  </span>
                </div>
              </div>
            </Reveal>

            <div className="relative lg:col-span-8">
              {/* Vertical connector glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[2.1rem] top-8 bottom-8 hidden w-px sm:block"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(187,196,247,0.35) 12%, rgba(187,196,247,0.18) 85%, transparent)",
                }}
              />

              <div className="space-y-7">
                {processSteps.map((step, index) => (
                  <Reveal key={step.step} delay={index * 0.06}>
                    <article className="group relative grid gap-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-7">
                      {/* Step numeral with serif italic */}
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute -left-3 -top-2 h-16 w-16 rounded-full bg-[#bbc4f7]/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-60"
                        />
                        <div className="relative flex items-baseline gap-1">
                          <span
                            className="text-[4.5rem] leading-none text-[#dfe2eb] sm:text-[5rem]"
                            style={SERIF_FONT}
                          >
                            {step.step}
                          </span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div
                        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#1B1A2B] via-[#1B1A2B] to-[#23233A] p-7 transition-all duration-500 group-hover:border-[#bbc4f7]/25 group-hover:from-[#1B1A2B] group-hover:to-[#2a2840] sm:p-8"
                      >
                        {/* Decorative top-right glyph */}
                        <span
                          aria-hidden
                          className="material-symbols-outlined absolute right-7 top-7 text-[#bbc4f7]/30 transition-colors duration-500 group-hover:text-[#bbc4f7]/55"
                          style={{ fontSize: 22 }}
                        >
                          {
                            ["search", "tune", "verified", "rocket_launch"][
                              index
                            ]
                          }
                        </span>

                        <h3
                          className="max-w-[20ch] text-[clamp(1.65rem,2.4vw,2.05rem)] leading-[1.05] tracking-[-0.025em] text-[#dfe2eb]"
                          style={DISPLAY_FONT}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="mt-4 max-w-[58ch] text-[0.95rem] leading-7 text-[#c6c6cb]"
                          style={BODY_FONT}
                        >
                          {step.description}
                        </p>

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#bbc4f7]/15 bg-[#bbc4f7]/[0.04] px-4 py-3">
                          <span
                            aria-hidden
                            className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[#bbc4f7]"
                            style={{ fontSize: 16 }}
                          >
                            arrow_forward
                          </span>
                          <div>
                            <p
                              className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
                              style={BODY_FONT}
                            >
                              Outcome
                            </p>
                            <p
                              className="mt-1 text-[0.88rem] leading-6 text-[#dfe2eb]"
                              style={BODY_FONT}
                            >
                              {step.outcome}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "relative overflow-hidden border-b border-white/8 bg-[#0d0c18]",
          sectionPaddingClass
        )}
      >
        {/* Atmospheric gradient orb */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 h-[40rem] w-[40rem] rounded-full opacity-50 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(140,165,240,0.18), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 bottom-0 h-[36rem] w-[36rem] rounded-full opacity-40 blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,100,0.07), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className={eyebrowClass} style={BODY_FONT}>
              Why Concierge
            </p>
            <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
              Strategic guidance for{" "}
              <span style={SERIF_FONT} className="font-normal">
                people who want optionality, not noise.
              </span>
            </h2>
            <p className={sectionBodyClass} style={BODY_FONT}>
              Judgment, discretion, and execution. Three qualities that
              actually matter once paperwork starts moving.
            </p>
          </Reveal>

          {/* Bento layout: hero pillar takes left half on desktop, others stack on right */}
          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            {/* Hero pillar */}
            <Reveal className="lg:col-span-7">
              <article
                className="group relative h-full overflow-hidden rounded-[36px] border border-white/10 p-8 transition-all duration-500 hover:border-[#bbc4f7]/30 sm:p-12"
                style={{
                  background:
                    "linear-gradient(155deg, #1f1e35 0%, #1B1A2B 45%, #11101C 100%)",
                }}
              >
                {/* Decorative film grain + serif numeral watermark */}
                <span
                  aria-hidden
                  className="absolute -right-6 -top-8 select-none text-[16rem] leading-none text-[#bbc4f7]/[0.07] transition-all duration-700 group-hover:text-[#bbc4f7]/[0.12]"
                  style={SERIF_FONT}
                >
                  01
                </span>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 80% 20%, rgba(187,196,247,0.12), transparent 50%)",
                  }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#bbc4f7]/30 bg-[#bbc4f7]/10"
                    >
                      <span
                        aria-hidden
                        className="material-symbols-outlined text-[#bbc4f7]"
                        style={{ fontSize: 18 }}
                      >
                        shield_lock
                      </span>
                    </span>
                    <p
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]"
                      style={BODY_FONT}
                    >
                      Pillar 01 · Discretion
                    </p>
                  </div>

                  <h3
                    className="mt-12 max-w-[10ch] text-balance text-[clamp(2.75rem,5vw,4.25rem)] leading-[0.94] tracking-[-0.04em] text-[#f4f6fb]"
                    style={DISPLAY_FONT}
                  >
                    Sensitive planning,
                    <span style={SERIF_FONT} className="font-normal">
                      {" "}
                      private-client tone.
                    </span>
                  </h3>
                  <p
                    className="mt-6 max-w-[44ch] text-base leading-8 text-[#c6c6cb]"
                    style={BODY_FONT}
                  >
                    {valuePillars[0].body}
                  </p>

                  <div className="mt-auto pt-12">
                    <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]/80">
                      <span className="h-px w-10 bg-[#bbc4f7]/40" />
                      <span style={BODY_FONT}>NDA · Encrypted intake · Off-record consult</span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Two supporting pillars stacked */}
            <div className="flex flex-col gap-5 lg:col-span-5">
              {valuePillars.slice(1).map((pillar, idx) => {
                const order = idx + 2;
                const orderStr = String(order).padStart(2, "0");
                const accentIcon = idx === 0 ? "route" : "track_changes";
                return (
                  <Reveal key={pillar.title} delay={0.08 + idx * 0.06}>
                    <article
                      className="group relative h-full overflow-hidden rounded-[28px] border border-white/8 p-7 transition-all duration-500 hover:border-[#bbc4f7]/25 sm:p-8"
                      style={{
                        background:
                          idx === 0
                            ? "linear-gradient(145deg, #1B1A2B 0%, #23233A 100%)"
                            : "linear-gradient(145deg, #19182a 0%, #1B1A2B 100%)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute -right-2 top-0 select-none text-[8rem] leading-none text-[#bbc4f7]/[0.06] transition-all duration-700 group-hover:text-[#bbc4f7]/[0.11]"
                        style={SERIF_FONT}
                      >
                        {orderStr}
                      </span>

                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bbc4f7]/25 bg-[#bbc4f7]/[0.08]">
                            <span
                              aria-hidden
                              className="material-symbols-outlined text-[#bbc4f7]"
                              style={{ fontSize: 15 }}
                            >
                              {accentIcon}
                            </span>
                          </span>
                          <p
                            className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
                            style={BODY_FONT}
                          >
                            Pillar {orderStr} · {pillar.title}
                          </p>
                        </div>
                        <h3
                          className="mt-6 max-w-[12ch] text-balance text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.02] tracking-[-0.025em] text-[#dfe2eb]"
                          style={DISPLAY_FONT}
                        >
                          {idx === 0 ? (
                            <>
                              Route selection,{" "}
                              <span style={SERIF_FONT} className="font-normal">
                                framed honestly.
                              </span>
                            </>
                          ) : (
                            <>
                              Stays involved,{" "}
                              <span style={SERIF_FONT} className="font-normal">
                                end to end.
                              </span>
                            </>
                          )}
                        </h3>
                        <p
                          className="mt-3 max-w-[38ch] text-sm leading-7 text-[#c6c6cb]"
                          style={BODY_FONT}
                        >
                          {pillar.body}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "relative overflow-hidden border-b border-white/8 bg-[#151423]",
          sectionPaddingClass
        )}
      >
        {/* Atmospheric backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 70% 25%, rgba(187,196,247,0.07), transparent 60%), radial-gradient(ellipse 50% 80% at 5% 75%, rgba(255,200,100,0.045), transparent 60%)",
          }}
        />
        {/* Subtle grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0 1px, transparent 1.2px), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.4) 0 1px, transparent 1.2px)",
            backgroundSize: "32px 32px, 28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className={eyebrowClass} style={BODY_FONT}>
              In their words
            </p>
            <h2 className={sectionTitleClass} style={DISPLAY_FONT}>
              What clients{" "}
              <span style={SERIF_FONT} className="font-normal">
                actually say,
              </span>{" "}
              after the paperwork is done.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-7">
            {/* Hero testimonial with giant decorative quote mark */}
            <Reveal className="lg:col-span-7" delay={0.04}>
              <article
                className="relative h-full overflow-hidden rounded-[36px] border border-white/10 p-8 sm:p-12"
                style={{
                  background:
                    "linear-gradient(155deg, #2b2945 0%, #23233A 50%, #1B1A2B 100%)",
                }}
              >
                {/* Massive serif italic quote glyph as design element */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-6 -top-16 select-none text-[24rem] leading-none text-[#bbc4f7]/[0.08]"
                  style={SERIF_FONT}
                >
                  &ldquo;
                </span>

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 85% 15%, rgba(187,196,247,0.1), transparent 50%)",
                  }}
                />

                <div className="relative flex h-full flex-col">
                  <p
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]"
                    style={BODY_FONT}
                  >
                    Featured client
                  </p>

                  <blockquote
                    className="mt-10 max-w-[20ch] text-balance text-[clamp(2rem,3.2vw,3.1rem)] leading-[1.05] tracking-[-0.035em] text-[#f4f6fb]"
                    style={DISPLAY_FONT}
                  >
                    <span style={SERIF_FONT} className="font-normal text-[#bbc4f7]">
                      &ldquo;
                    </span>
                    {TESTIMONIALS[0].quote}
                    <span style={SERIF_FONT} className="font-normal text-[#bbc4f7]">
                      &rdquo;
                    </span>
                  </blockquote>

                  <div className="mt-auto pt-12">
                    <div className="flex items-center gap-4">
                      <span
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#bbc4f7]/30 text-base font-semibold text-[#bbc4f7]"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(187,196,247,0.18), rgba(187,196,247,0.04))",
                          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                        }}
                      >
                        {TESTIMONIALS[0].name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p
                          className="text-base font-semibold text-[#dfe2eb]"
                          style={BODY_FONT}
                        >
                          {TESTIMONIALS[0].name}
                        </p>
                        <p
                          className="mt-0.5 text-sm text-[#8f9095]"
                          style={BODY_FONT}
                        >
                          {TESTIMONIALS[0].role}
                        </p>
                      </div>
                      <span
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#bbc4f7]/25 bg-[#bbc4f7]/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#bbc4f7]"
                        style={BODY_FONT}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
                        {TESTIMONIALS[0].program}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Secondary testimonials — smaller pull quotes */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {TESTIMONIALS.slice(1).map((testimonial, index) => {
                const initials = testimonial.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("");
                return (
                  <Reveal
                    key={testimonial.name}
                    delay={0.08 + index * 0.05}
                  >
                    <article
                      className="group relative overflow-hidden rounded-[28px] border border-white/8 p-7 transition-all duration-500 hover:border-[#bbc4f7]/25"
                      style={{
                        background:
                          "linear-gradient(145deg, #1B1A2B 0%, #1f1e35 100%)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-4 -top-10 select-none text-[10rem] leading-none text-[#bbc4f7]/[0.06] transition-all duration-700 group-hover:text-[#bbc4f7]/[0.11]"
                        style={SERIF_FONT}
                      >
                        &ldquo;
                      </span>

                      <blockquote
                        className="relative max-w-[22ch] text-balance text-[clamp(1.25rem,1.8vw,1.55rem)] leading-[1.18] tracking-[-0.02em] text-[#dfe2eb]"
                        style={DISPLAY_FONT}
                      >
                        {testimonial.quote}
                      </blockquote>

                      <div className="relative mt-7 flex items-center gap-3 border-t border-white/8 pt-5">
                        <span
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#bbc4f7]/25 text-xs font-semibold text-[#bbc4f7]"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(187,196,247,0.14), rgba(187,196,247,0.03))",
                            fontFamily:
                              "var(--font-manrope), 'Manrope', sans-serif",
                          }}
                        >
                          {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-semibold text-[#dfe2eb]"
                            style={BODY_FONT}
                          >
                            {testimonial.name}
                          </p>
                          <p
                            className="mt-0.5 truncate text-xs text-[#8f9095]"
                            style={BODY_FONT}
                          >
                            {testimonial.role} · {testimonial.program}
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

      <section
        className={cn(
          "relative overflow-hidden border-b border-white/8 bg-[#11101C]",
          sectionPaddingClass
        )}
      >
        {/* Atmospheric backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 h-[34rem] w-[34rem] rounded-full opacity-50 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(187,196,247,0.1), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <div className="max-w-[28rem] lg:sticky lg:top-28">
                <p className={eyebrowClass} style={BODY_FONT}>
                  FAQ
                </p>
                <h2
                  className="mt-4 max-w-[14ch] text-balance text-[clamp(2.2rem,3.4vw,3.55rem)] leading-[0.99] tracking-[-0.035em] text-[#dfe2eb]"
                  style={DISPLAY_FONT}
                >
                  Questions that{" "}
                  <span style={SERIF_FONT} className="font-normal">
                    usually come up
                  </span>{" "}
                  in the first conversation.
                </h2>
                <p
                  className="mt-6 max-w-[42ch] text-[0.95rem] leading-7 text-[#c6c6cb]"
                  style={BODY_FONT}
                >
                  Factual, specific, and closer to a briefing than a sales
                  page. If something here doesn&apos;t cover your situation,
                  ask your advisor directly.
                </p>
                <div className="mt-10 flex items-center gap-3">
                  <span className="h-px w-12 bg-[#bbc4f7]/40" />
                  <span
                    className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]/70"
                    style={BODY_FONT}
                  >
                    {FAQ_ITEMS.length} most-asked
                  </span>
                </div>
              </div>
            </Reveal>

            <div className="relative lg:col-span-8">
              <div className="divide-y divide-white/8 border-y border-white/8">
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaq === index;
                  const numStr = String(index + 1).padStart(2, "0");

                  return (
                    <Reveal key={item.question} delay={index * 0.035}>
                      <article
                        className={cn(
                          "group relative transition-colors duration-300",
                          isOpen && "bg-[#bbc4f7]/[0.025]"
                        )}
                      >
                        <button
                          type="button"
                          className="flex w-full items-start gap-6 py-7 text-left sm:gap-8"
                          onClick={() =>
                            setOpenFaq((current) =>
                              current === index ? -1 : index
                            )
                          }
                        >
                          <span
                            className={cn(
                              "min-w-[2.5rem] flex-shrink-0 text-[2rem] leading-none transition-colors duration-300 sm:text-[2.5rem]",
                              isOpen
                                ? "text-[#bbc4f7]"
                                : "text-[#bbc4f7]/40 group-hover:text-[#bbc4f7]/75"
                            )}
                            style={SERIF_FONT}
                          >
                            {numStr}
                          </span>
                          <span
                            className={cn(
                              "flex-1 max-w-[34ch] text-balance text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.18] tracking-[-0.02em] transition-colors duration-300",
                              isOpen ? "text-[#f4f6fb]" : "text-[#dfe2eb]"
                            )}
                            style={DISPLAY_FONT}
                          >
                            {item.question}
                          </span>
                          <span
                            className={cn(
                              "mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                              isOpen
                                ? "border-[#bbc4f7]/40 bg-[#bbc4f7]/15"
                                : "border-white/10 bg-[#1B1A2B] group-hover:border-[#bbc4f7]/30 group-hover:bg-[#bbc4f7]/8"
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-[#bbc4f7] transition-transform duration-300",
                                isOpen && "rotate-180"
                              )}
                            />
                          </span>
                        </button>
                        <div
                          className="grid overflow-hidden transition-[grid-template-rows,opacity,padding] duration-300 ease-out"
                          style={{
                            gridTemplateRows: isOpen ? "1fr" : "0fr",
                            opacity: isOpen ? 1 : 0,
                          }}
                        >
                          <div className="overflow-hidden">
                            <div className="ml-[3.5rem] max-w-[60ch] pb-7 pr-12 sm:ml-[4.5rem]">
                              <p
                                className="text-[0.95rem] leading-8 text-[#c6c6cb]"
                                style={BODY_FONT}
                              >
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0d1017] text-[#eef0f6]">
        {/* Right-half twilight skyline. The wrapper is alpha-masked so the
            image itself fades to transparent toward the centre, letting
            the purple wash beneath show through without a dark band. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, transparent 18%, black 55%, black 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, transparent 18%, black 55%, black 100%)",
          }}
        >
          <Image
            src="/images/cta-skyline.jpg"
            alt=""
            fill
            sizes="58vw"
            className="object-cover object-[60%_50%]"
          />
          {/* gentle top/bottom darken */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,16,23,0.5) 0%, transparent 25%, transparent 70%, rgba(13,16,23,0.6) 100%)",
            }}
          />
        </div>

        {/* Mobile: faded full-bleed image */}
        <div aria-hidden className="absolute inset-0 lg:hidden">
          <Image
            src="/images/cta-skyline.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[60%_50%] opacity-30"
          />
          <div className="absolute inset-0 bg-[#0d1017]/70" />
        </div>

        {/* Left-half twilight skyline. Mirror of the right wrapper, with
            the alpha mask reversed so the right edge fades to transparent
            into the purple wash. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] lg:block"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, black 0%, black 45%, transparent 82%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, black 0%, black 45%, transparent 82%, transparent 100%)",
          }}
        >
          <Image
            src="/images/cta-skyline-left.jpg"
            alt=""
            fill
            sizes="58vw"
            className="object-cover object-left"
          />
          {/* gentle top/bottom darken to match the right side */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,16,23,0.5) 0%, transparent 25%, transparent 70%, rgba(13,16,23,0.6) 100%)",
            }}
          />
        </div>

        {/* Purple sky wash sitting between the images and the text so the
            centered headline reads against the same twilight palette as
            the skylines instead of a dark stripe. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 75% at 50% 38%, rgba(160, 105, 180, 0.55), transparent 72%), radial-gradient(ellipse 65% 90% at 50% 75%, rgba(70, 40, 110, 0.55), transparent 75%)",
          }}
        />

        {/* Centered content */}
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-28 lg:py-32">
          {/* eyebrow pill */}
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[#bbc4f7]/30 bg-[#bbc4f7]/[0.04] px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
            style={BODY_FONT}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
            Private advisory for global mobility
          </span>

          {/* Headline */}
          <h2
            className="mt-7 text-[#eef0f6]"
            style={{
              ...BODY_FONT,
              fontWeight: 500,
              fontSize: "clamp(2.5rem,5.6vw,5.2rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            Build your next chapter with{" "}
            <span
              className="block text-[#c4caf1] sm:inline"
              style={{
                ...SERIF_FONT,
                fontSize: "1.05em",
                letterSpacing: "-0.01em",
              }}
            >
              confidence.
            </span>
          </h2>

          {/* Body */}
          <p
            className="mx-auto mt-7 max-w-[44ch] text-[#c0c3d2]"
            style={{ ...BODY_FONT, fontSize: "1.0625rem", lineHeight: 1.65 }}
          >
            Confidential guidance for residency, citizenship, and
            international positioning. Designed around your life, your
            priorities, and your long-term freedom.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-stretch justify-center gap-3">
            <OpenApplyButton className="group inline-flex items-center gap-3 rounded-full bg-[#bbc4f7] px-6 py-3.5 text-[0.95rem] font-semibold text-[#242d58] transition-colors hover:bg-[#cbd1fa]">
              Book a Private Consultation
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#242d58] text-[#bbc4f7]">
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </OpenApplyButton>
            <Link
              href="/programs"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-6 py-3.5 text-[0.95rem] font-semibold text-[#e9eaf0] backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-black/35"
            >
              Explore Programmes
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[#bbc4f7]">
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          {/* Trust strip */}
          <ul className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-y-6 sm:flex-nowrap">
            {[
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                ),
                top: "Confidential",
                bottom: "By design",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                ),
                top: "15+",
                bottom: "Active programmes",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                ),
                top: "98%",
                bottom: "Approval rate",
              },
            ].map((item, i, arr) => (
              <li
                key={item.bottom}
                className={cn(
                  "flex w-full items-center justify-center gap-3 px-6 sm:w-auto",
                  i < arr.length - 1 && "sm:border-r sm:border-white/10"
                )}
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#bbc4f7]">
                  {item.icon}
                </span>
                <div className="flex flex-col text-left">
                  <span
                    className="text-[1rem] text-[#eef0f6]"
                    style={{ ...BODY_FONT, fontWeight: 600 }}
                  >
                    {item.top}
                  </span>
                  <span
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#8f93a3]"
                    style={BODY_FONT}
                  >
                    {item.bottom}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
