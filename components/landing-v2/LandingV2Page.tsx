"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
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
const optimiseItems = [
  "Jurisdictions aligned to family inclusion and long-term flexibility.",
  "Qualification-first screening before time or capital gets committed.",
  "Execution that stays sober about diligence, timelines, and edge cases.",
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
  const driftDuration = 7 + index * 0.45; // 7, 7.45, ..., 9.25
  const driftDelay = -index * 1.2; // negative delay → start mid-cycle

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

export function LandingV2Page() {
  const [openFaq, setOpenFaq] = useState(0);
  const snapshotsSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: snapshotsScroll } = useScroll({
    target: snapshotsSectionRef,
    offset: ["start end", "end start"],
  });
  const prefersReducedMotion = useReducedMotion() ?? false;


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

      <section
        ref={snapshotsSectionRef}
        id="program-snapshots"
        className="relative overflow-hidden border-b border-white/8 pb-[clamp(5rem,8vw,7.5rem)] pt-[clamp(2rem,4vw,3.25rem)] xl:min-h-[1000px] xl:pb-12 xl:pt-16"
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
