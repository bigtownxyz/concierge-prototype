"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PROGRAMS, REGIONS, type Program } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";
import { QualifyModal } from "@/components/shared/QualifyModal";
import { useUser } from "@/hooks/useUser";

// ─── Type maps ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<Program["type"], string> = {
  CBI: "Direct Citizenship",
  "Golden Visa": "Investment Residency",
  Residency: "Residency Permit",
  Trust: "Asset Protection",
};

const TYPE_ICONS: Record<Program["type"], string> = {
  CBI: "workspace_premium",
  "Golden Visa": "shield_with_heart",
  Residency: "home_pin",
  Trust: "lock",
};

// ─── Region gradient map ───────────────────────────────────────────────────────

const REGION_GRADIENTS: Record<string, string> = {
  caribbean:
    "linear-gradient(135deg, #0d2b35 0%, #0a3040 40%, #0c2233 70%, #061520 100%)",
  europe:
    "linear-gradient(135deg, #0f0d2b 0%, #161440 40%, #1a1050 70%, #0a0820 100%)",
  middle_east:
    "linear-gradient(135deg, #071d12 0%, #0c2e1a 40%, #0a2418 70%, #050f0b 100%)",
  south_america:
    "linear-gradient(135deg, #1a0f04 0%, #2b1a06 40%, #1f1209 70%, #0d0804 100%)",
  central_america:
    "linear-gradient(135deg, #180c02 0%, #261506 40%, #1c1008 70%, #0c0602 100%)",
  asia_pacific:
    "linear-gradient(135deg, #0a0d26 0%, #0f1238 40%, #0c0e2c 70%, #060814 100%)",
  global:
    "linear-gradient(135deg, #111318 0%, #1a1d24 40%, #141720 70%, #0a0d12 100%)",
};

const REGION_ACCENT: Record<string, string> = {
  caribbean: "rgba(0, 180, 160, 0.12)",
  europe: "rgba(100, 80, 220, 0.12)",
  middle_east: "rgba(30, 140, 80, 0.12)",
  south_america: "rgba(180, 100, 30, 0.12)",
  central_america: "rgba(160, 90, 20, 0.12)",
  asia_pacific: "rgba(70, 80, 200, 0.12)",
  global: "rgba(120, 120, 140, 0.12)",
};

// ─── Investment range buckets ─────────────────────────────────────────────────

type InvestmentRange = "all" | "0-500k" | "500k-1m" | "1m+";

const INVESTMENT_RANGES: { label: string; value: InvestmentRange }[] = [
  { label: "Any Amount", value: "all" },
  { label: "$100k – $500k", value: "0-500k" },
  { label: "$500k – $1M", value: "500k-1m" },
  { label: "$1M+", value: "1m+" },
];

function matchesRange(min: number, range: InvestmentRange): boolean {
  if (range === "all") return true;
  if (range === "0-500k") return min < 500_000;
  if (range === "500k-1m") return min >= 500_000 && min < 1_000_000;
  if (range === "1m+") return min >= 1_000_000;
  return true;
}

// ─── Card component ────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  index,
  onInquire,
}: {
  program: Program;
  index: number;
  onInquire: () => void;
}) {
  const gradient = REGION_GRADIENTS[program.region] ?? REGION_GRADIENTS.global;
  const accent = REGION_ACCENT[program.region] ?? REGION_ACCENT.global;
  const typeLabel = TYPE_LABELS[program.type];
  const typeIcon = TYPE_ICONS[program.type];

  const timeline =
    program.processingTimeMonths != null
      ? `${program.processingTimeMonths} mo`
      : "Variable";

  const access =
    program.visaFreeCount != null
      ? `${program.visaFreeCount} countries`
      : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl border border-[#45474b]/60 bg-[#1c2026] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[#bbc4f7]/30 hover:shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
    >
      {/* Card image area */}
      <div
        className="relative h-64 overflow-hidden"
        style={{ background: gradient }}
      >
        {/* Country image */}
        <Image
          src={`/images/programs/${program.slug}.jpg`}
          alt={program.country}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-500 group-hover:bg-black/20" />

        {/* Accent glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-150"
          style={{ background: accent }}
        />

        {/* Bottom gradient fade into card bg */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1c2026] to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {program.featured && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(187, 196, 247, 0.12)",
                border: "1px solid rgba(187, 196, 247, 0.25)",
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                star
              </span>
              Featured
            </span>
          )}
          {program.exclusive && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(214, 195, 183, 0.12)",
                border: "1px solid rgba(214, 195, 183, 0.25)",
                color: "#d6c3b7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                diamond
              </span>
              Exclusive
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Program title block */}
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{
              color: "#8f9095",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {program.type}
          </p>
          <h3
            className="text-xl font-bold leading-tight"
            style={{
              color: "#dfe2eb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {program.country}
          </h3>
          <p
            className="text-sm mt-0.5"
            style={{
              color: "#8f9095",
              fontStyle: "italic",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {typeLabel}
          </p>
        </div>

        {/* Type indicator */}
        <div
          className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5"
          style={{
            background: "rgba(187, 196, 247, 0.07)",
            border: "1px solid rgba(187, 196, 247, 0.12)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14, color: "#bbc4f7" }}
          >
            {typeIcon}
          </span>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{
              color: "#bbc4f7",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {program.type}
          </span>
        </div>

        {/* Stats rows */}
        <div
          className="flex flex-col gap-0 rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(69,71,75,0.6)" }}
        >
          {/* Investment */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(69,71,75,0.4)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                payments
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: "#8f9095",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                Investment
              </span>
            </div>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {program.minInvestment === 0
                ? "From Free"
                : `From ${formatCurrency(program.minInvestment, program.currency)}`}
            </span>
          </div>

          {/* Timeline */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(69,71,75,0.4)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                schedule
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: "#8f9095",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                Timeline
              </span>
            </div>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {timeline}
            </span>
          </div>

          {/* Access */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                flight_takeoff
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: "#8f9095",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                Visa-Free Access
              </span>
            </div>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {access}
            </span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-auto flex gap-3 pt-1">
          <Link
            href={`/programs/${program.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              background: "rgba(187, 196, 247, 0.08)",
              border: "1px solid rgba(187, 196, 247, 0.2)",
              color: "#bbc4f7",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(187, 196, 247, 0.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(187, 196, 247, 0.08)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              analytics
            </span>
            Breakdown
          </Link>
          <button
            type="button"
            onClick={onInquire}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              background: "#bbc4f7",
              color: "#242d58",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              mail
            </span>
            Inquire
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Comparison Section ────────────────────────────────────────────────────────

function ComparisonSection() {
  const mostPopular = useMemo(
    () => PROGRAMS.filter((p) => p.isActive && p.featured)[0] ?? PROGRAMS[0],
    []
  );
  const bestValue = useMemo(
    () =>
      [...PROGRAMS]
        .filter((p) => p.isActive && p.minInvestment > 0)
        .sort((a, b) => a.minInvestment - b.minInvestment)[0] ?? PROGRAMS[0],
    []
  );

  return (
    <section
      className="mx-auto max-w-7xl px-6 py-20"
      style={{ borderTop: "1px solid rgba(69,71,75,0.5)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
      >
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{
              color: "#bbc4f7",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            Benchmark Analysis
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{
              color: "#dfe2eb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            Precision Comparison
          </h2>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{
            color: "#bbc4f7",
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
          }}
        >
          Compare All Programs
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Most Popular */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(28, 32, 38, 0.8)",
            border: "1px solid rgba(187, 196, 247, 0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(187, 196, 247, 0.1)",
                border: "1px solid rgba(187, 196, 247, 0.2)",
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                trending_up
              </span>
              Most Popular
            </span>
          </div>
          <div>
            <h3
              className="text-xl font-bold"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {mostPopular.name}
            </h3>
            <p
              className="text-sm mt-0.5 italic"
              style={{
                color: "#8f9095",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {TYPE_LABELS[mostPopular.type]}
            </p>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#c6c6cb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {mostPopular.marketingHook}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {formatCurrency(mostPopular.minInvestment, mostPopular.currency)}
            </span>
            <Link
              href={`/programs/${mostPopular.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: "#bbc4f7",
                color: "#242d58",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              View Details
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Best Value */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(28, 32, 38, 0.8)",
            border: "1px solid rgba(214, 195, 183, 0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(214, 195, 183, 0.1)",
                border: "1px solid rgba(214, 195, 183, 0.2)",
                color: "#d6c3b7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                sell
              </span>
              Best Value
            </span>
          </div>
          <div>
            <h3
              className="text-xl font-bold"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {bestValue.name}
            </h3>
            <p
              className="text-sm mt-0.5 italic"
              style={{
                color: "#8f9095",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {TYPE_LABELS[bestValue.type]}
            </p>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#c6c6cb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            {bestValue.marketingHook}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{
                color: "#d6c3b7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {formatCurrency(bestValue.minInvestment, bestValue.currency)}
            </span>
            <Link
              href={`/programs/${bestValue.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: "rgba(214, 195, 183, 0.12)",
                border: "1px solid rgba(214, 195, 183, 0.3)",
                color: "#d6c3b7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              View Details
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Recommended for You Section ──────────────────────────────────────────────

function RecommendedForYou({
  qualPrograms,
}: {
  qualPrograms: { program_slug: string; match_score: number }[];
}) {
  const matches = qualPrograms
    .map(({ program_slug, match_score }) => {
      const program = PROGRAMS.find((p) => p.slug === program_slug);
      return program ? { program, match_score } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  if (matches.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-16 pb-2">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: "rgba(187,196,247,0.12)",
            border: "1px solid rgba(187,196,247,0.25)",
            color: "#bbc4f7",
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
            auto_awesome
          </span>
          Based on your qualification
        </span>
        <p
          className="text-sm font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          Recommended for You
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {matches.map(({ program, match_score }, i) => (
          <Link
            key={program.slug}
            href={`/programs/${program.slug}`}
            className="flex flex-col gap-3 rounded-xl p-5 transition-all duration-200"
            style={{
              background: i === 0 ? "rgba(187,196,247,0.06)" : "rgba(28,32,38,0.7)",
              border: i === 0
                ? "1px solid rgba(187,196,247,0.3)"
                : "1px solid rgba(69,71,75,0.35)",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{program.flagEmoji}</span>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    {program.country}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "#8f9095" }}>
                    {program.type}
                  </p>
                </div>
              </div>
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                style={{
                  background: i === 0 ? "#bbc4f7" : "rgba(69,71,75,0.4)",
                  color: i === 0 ? "#242d58" : "#8f9095",
                }}
              >
                {i === 0 ? "Top Pick" : `#${i + 1}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-1 flex-1 rounded-full overflow-hidden"
                style={{ background: "rgba(69,71,75,0.4)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: i === 0 ? "#bbc4f7" : "rgba(187,196,247,0.4)",
                    width: `${match_score}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: "#bbc4f7" }}>
                {match_score}%
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div
        className="h-px"
        style={{ background: "rgba(69,71,75,0.3)" }}
      />
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function ProgramsGrid() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [activeRange, setActiveRange] = useState<InvestmentRange>("all");
  const [qualifyOpen, setQualifyOpen] = useState(false);
  const { user } = useUser();
  const [qualPrograms, setQualPrograms] = useState<
    { program_slug: string; match_score: number }[]
  >([]);

  // Fetch qualification programs when user is logged in
  useEffect(() => {
    if (!user) return;
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from("qualifications")
        .select("id, qualification_programs(program_slug, match_score)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .maybeSingle()
        .then(({ data }) => {
          if (data?.qualification_programs) {
            setQualPrograms(
              data.qualification_programs as { program_slug: string; match_score: number }[]
            );
          }
        });
    });
  }, [user]);

  const filtered = useMemo(() => {
    return PROGRAMS.filter((p) => {
      if (!p.isActive) return false;
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.country.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (activeType !== "all" && p.type !== activeType) return false;
      if (activeRegion !== "all" && p.region !== activeRegion) return false;
      if (!matchesRange(p.minInvestment, activeRange)) return false;
      return true;
    });
  }, [search, activeType, activeRegion, activeRange]);

  const displayedRegions = REGIONS.filter((r) => r.value !== "global");

  return (
    <>
      {/* ── Recommended for You (logged-in users with a qualification) ──── */}
      {user && qualPrograms.length > 0 && (
        <RecommendedForYou qualPrograms={qualPrograms} />
      )}

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="relative z-20 -mt-20 mx-auto max-w-7xl px-6">
        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{
            background: "rgba(38, 42, 49, 0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(69,71,75,0.6)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 18, color: "#8f9095" }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
                style={{
                  background: "#0a0e14",
                  border: "1px solid rgba(69,71,75,0.8)",
                  color: "#dfe2eb",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(187, 196, 247, 0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(187, 196, 247, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(69,71,75,0.8)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Investment Type dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                workspace_premium
              </span>
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="rounded-xl py-2.5 pl-9 pr-8 text-sm cursor-pointer appearance-none outline-none transition-all"
                style={{
                  background: "#0a0e14",
                  border: "1px solid rgba(69,71,75,0.8)",
                  color: "#dfe2eb",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  minWidth: 160,
                }}
              >
                <option value="all">All Types</option>
                <option value="CBI">Citizenship (CBI)</option>
                <option value="Golden Visa">Golden Visa</option>
                <option value="Residency">Residency</option>
                <option value="Trust">Trust</option>
              </select>
              <span
                className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                expand_more
              </span>
            </div>

            {/* Region dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                public
              </span>
              <select
                value={activeRegion}
                onChange={(e) => setActiveRegion(e.target.value)}
                className="rounded-xl py-2.5 pl-9 pr-8 text-sm cursor-pointer appearance-none outline-none transition-all"
                style={{
                  background: "#0a0e14",
                  border: "1px solid rgba(69,71,75,0.8)",
                  color: "#dfe2eb",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  minWidth: 150,
                }}
              >
                <option value="all">All Regions</option>
                {displayedRegions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                expand_more
              </span>
            </div>

            {/* Min Investment dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                payments
              </span>
              <select
                value={activeRange}
                onChange={(e) => setActiveRange(e.target.value as InvestmentRange)}
                className="rounded-xl py-2.5 pl-9 pr-8 text-sm cursor-pointer appearance-none outline-none transition-all"
                style={{
                  background: "#0a0e14",
                  border: "1px solid rgba(69,71,75,0.8)",
                  color: "#dfe2eb",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  minWidth: 160,
                }}
              >
                {INVESTMENT_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: "#8f9095" }}
              >
                expand_more
              </span>
            </div>

            {/* Filter indicator button */}
            <button
              onClick={() => {
                setSearch("");
                setActiveType("all");
                setActiveRegion("all");
                setActiveRange("all");
              }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                background: "rgba(187, 196, 247, 0.1)",
                border: "1px solid rgba(187, 196, 247, 0.2)",
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                filter_alt
              </span>
              Reset
            </button>
          </div>

          {/* Active filter summary */}
          {(search || activeType !== "all" || activeRegion !== "all" || activeRange !== "all") && (
            <div
              className="mt-3 pt-3 flex items-center gap-2 flex-wrap"
              style={{ borderTop: "1px solid rgba(69,71,75,0.4)" }}
            >
              <span
                className="text-xs"
                style={{
                  color: "#8f9095",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
              {[
                search && { label: `"${search}"`, key: "search" },
                activeType !== "all" && { label: activeType, key: "type" },
                activeRegion !== "all" && {
                  label:
                    REGIONS.find((r) => r.value === activeRegion)?.label ?? activeRegion,
                  key: "region",
                },
                activeRange !== "all" && {
                  label:
                    INVESTMENT_RANGES.find((r) => r.value === activeRange)?.label ??
                    activeRange,
                  key: "range",
                },
              ]
                .filter(Boolean)
                .map((chip) => {
                  const c = chip as { label: string; key: string };
                  return (
                    <span
                      key={c.key}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{
                        background: "rgba(187, 196, 247, 0.08)",
                        border: "1px solid rgba(187, 196, 247, 0.15)",
                        color: "#bbc4f7",
                        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      }}
                    >
                      {c.label}
                    </span>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── Programs grid ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`grid-${activeType}-${activeRegion}-${activeRange}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {filtered.map((program, i) => (
                <ProgramCard
                  key={program.slug}
                  program={program}
                  index={i}
                  onInquire={() => setQualifyOpen(true)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-4"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 48, color: "#45474b" }}
              >
                search_off
              </span>
              <p
                className="text-base"
                style={{
                  color: "#8f9095",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                No programs match your criteria.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveType("all");
                  setActiveRegion("all");
                  setActiveRange("all");
                }}
                className="text-sm font-semibold transition-colors"
                style={{
                  color: "#bbc4f7",
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                }}
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Comparison section ────────────────────────────────────────────── */}
      <ComparisonSection />

      {/* ── Qualify modal ────────────────────────────────────────────────── */}
      <QualifyModal isOpen={qualifyOpen} onClose={() => setQualifyOpen(false)} />
    </>
  );
}
