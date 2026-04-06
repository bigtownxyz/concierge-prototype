"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROGRAMS, type Program } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qualification {
  id: string;
  user_id: string;
  strategic_focus: string[];
  investment_amount: number;
  timeline: string | null;
  dependants: number | null;
  situation: string | null;
  created_at: string;
  updated_at: string;
}

interface QualificationProgram {
  id: string;
  qualification_id: string;
  program_slug: string;
  match_score: number;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatInvestment(amount: number): string {
  if (amount >= 5_000_000) return "$5M+";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  return `$${(amount / 1_000).toFixed(0)}K`;
}

function formatTimeline(t: string | null): string {
  if (!t) return "Not specified";
  const map: Record<string, string> = {
    immediate: "0–6 months",
    strategic: "6–18 months",
    "long-term": "Long-term",
  };
  return map[t] ?? t;
}

function formatFocus(focus: string[]): string[] {
  const map: Record<string, string> = {
    mobility: "Global Mobility",
    tax: "Tax Optimisation",
    family: "Family Security",
    assets: "Asset Diversification",
  };
  return focus.map((f) => map[f] ?? f);
}

// ─── Match Score Bar ──────────────────────────────────────────────────────────

function MatchScoreBar({ score }: { score: number }) {
  const pct = Math.round(score);
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(69,71,75,0.4)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#bbc4f7" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums flex-shrink-0"
        style={{ color: "#bbc4f7", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", minWidth: 32 }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── Programme Card ───────────────────────────────────────────────────────────

function ProgramCard({
  program,
  matchScore,
  rank,
}: {
  program: Program;
  matchScore: number;
  rank: number;
}) {
  const processingText = program.processingTimeMonths
    ? `${program.processingTimeMonths} months`
    : "Varies";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: rank * 0.07 }}
      className="rounded-2xl p-5"
      style={{
        background: "#1c2026",
        border: "1px solid rgba(69,71,75,0.15)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">
            {program.flagEmoji}
          </span>
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: "#dfe2eb" }}
            >
              {program.country}
            </h3>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-0.5"
              style={{
                background: "rgba(187,196,247,0.1)",
                color: "#bbc4f7",
                border: "1px solid rgba(187,196,247,0.2)",
              }}
            >
              {program.type}
            </span>
          </div>
        </div>
        {rank === 0 && (
          <span
            className="flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              background: "rgba(187,196,247,0.12)",
              color: "#bbc4f7",
              border: "1px solid rgba(187,196,247,0.25)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            Top Match
          </span>
        )}
      </div>

      {/* Match Score */}
      <div className="mb-4">
        <p className="text-xs font-medium mb-1.5" style={{ color: "#8f9095" }}>
          Match Score
        </p>
        <MatchScoreBar score={matchScore} />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-xs" style={{ color: "#8f9095" }}>
            Min Investment
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#c6c6cb" }}>
            {program.currency === "USD"
              ? `$${program.minInvestment.toLocaleString()}`
              : `${program.currency} ${program.minInvestment.toLocaleString()}`}
          </p>
        </div>
        <div
          className="w-px self-stretch"
          style={{ background: "rgba(69,71,75,0.3)" }}
          aria-hidden="true"
        />
        <div>
          <p className="text-xs" style={{ color: "#8f9095" }}>
            Processing
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#c6c6cb" }}>
            {processingText}
          </p>
        </div>
      </div>

      {/* View Details */}
      <Link
        href={`/programs/${program.slug}` as "/programs/[slug]"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
        style={{ color: "#bbc4f7" }}
      >
        View Details
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 14 }}
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </Link>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="h-8 w-8 rounded-full" style={{ background: "rgba(69,71,75,0.3)" }} />
        <div className="flex-1">
          <div className="h-3.5 w-32 rounded" style={{ background: "rgba(69,71,75,0.3)" }} />
          <div className="h-3 w-16 rounded mt-2" style={{ background: "rgba(69,71,75,0.2)" }} />
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full mb-4" style={{ background: "rgba(69,71,75,0.3)" }} />
      <div className="flex gap-4 mb-4">
        <div className="h-8 w-24 rounded" style={{ background: "rgba(69,71,75,0.2)" }} />
        <div className="h-8 w-24 rounded" style={{ background: "rgba(69,71,75,0.2)" }} />
      </div>
      <div className="h-3 w-20 rounded" style={{ background: "rgba(69,71,75,0.2)" }} />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-5 rounded-2xl py-14 px-8 text-center"
      style={{
        background: "#1c2026",
        border: "1px solid rgba(69,71,75,0.15)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "rgba(187,196,247,0.08)",
          border: "1px solid rgba(187,196,247,0.2)",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 28, color: "#bbc4f7" }}
          aria-hidden="true"
        >
          assignment
        </span>
      </div>
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: "#dfe2eb" }}
        >
          No recommendations yet
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          Complete your qualification to see personalised programme matches.
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("open-qualify-modal"))
        }
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200"
        style={{
          background: "#bbc4f7",
          color: "#242d58",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7")
        }
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16 }}
          aria-hidden="true"
        >
          edit_note
        </span>
        Start Qualification
      </button>
    </motion.div>
  );
}

// ─── Qualification Summary ────────────────────────────────────────────────────

function QualificationSummary({ qual }: { qual: Qualification }) {
  const focusLabels = formatFocus(qual.strategic_focus ?? []);

  return (
    <div
      className="rounded-2xl p-5 mt-4"
      style={{
        background: "#1c2026",
        border: "1px solid rgba(69,71,75,0.15)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8f9095" }}>
          Your Profile Summary
        </h3>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-qualify-modal"))
          }
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
          style={{ color: "#bbc4f7" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14 }}
            aria-hidden="true"
          >
            edit
          </span>
          Edit
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Strategic Focus Tags */}
        {focusLabels.length > 0 && (
          <div>
            <p className="text-xs mb-2" style={{ color: "#8f9095" }}>
              Strategic Focus
            </p>
            <div className="flex flex-wrap gap-2">
              {focusLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "rgba(187,196,247,0.08)",
                    border: "1px solid rgba(187,196,247,0.2)",
                    color: "#bbc4f7",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget & Timeline */}
        <div className="flex flex-wrap gap-4 pt-1">
          <div>
            <p className="text-xs" style={{ color: "#8f9095" }}>
              Budget
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "#c6c6cb" }}>
              {formatInvestment(qual.investment_amount)}
            </p>
          </div>
          {qual.timeline && (
            <div>
              <p className="text-xs" style={{ color: "#8f9095" }}>
                Timeline
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "#c6c6cb" }}>
                {formatTimeline(qual.timeline)}
              </p>
            </div>
          )}
          {qual.dependants !== null && qual.dependants !== undefined && (
            <div>
              <p className="text-xs" style={{ color: "#8f9095" }}>
                Dependants
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "#c6c6cb" }}>
                {qual.dependants}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [qualification, setQualification] = useState<Qualification | null>(null);
  const [matchedPrograms, setMatchedPrograms] = useState<
    { program: Program; matchScore: number }[]
  >([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setLoadingAuth(false);

      // Fetch qualification
      const { data: qual } = await supabase
        .from("qualifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setQualification(qual ?? null);

      if (qual) {
        // Fetch matched programmes
        const { data: programs } = await supabase
          .from("qualification_programs")
          .select("*")
          .eq("qualification_id", qual.id)
          .order("match_score", { ascending: false });

        if (programs && programs.length > 0) {
          const matched = (programs as QualificationProgram[])
            .map((row) => {
              const program = PROGRAMS.find((p) => p.slug === row.program_slug);
              if (!program) return null;
              return { program, matchScore: row.match_score };
            })
            .filter(
              (item): item is { program: Program; matchScore: number } =>
                item !== null
            );
          setMatchedPrograms(matched);
        }
      }

      setLoadingData(false);
    }

    fetchData();
  }, [router]);

  // While checking auth silently
  if (loadingAuth) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#10141a" }}
      >
        <span
          className="material-symbols-outlined animate-spin"
          style={{ fontSize: 28, color: "#8f9095" }}
        >
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-12 lg:py-16"
      style={{
        background: "#10141a",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(2,12,55,0.45) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p
            className="text-xs font-semibold tracking-[0.12em] uppercase mb-2"
            style={{ color: "#bbc4f7" }}
          >
            Your Results
          </p>
          <h1
            className="text-2xl lg:text-3xl font-semibold"
            style={{ color: "#dfe2eb" }}
          >
            Personalised Programme Matches
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
            Based on your qualification answers, here are the programmes best suited to your goals.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* ── Left: Recommendations (60%) ─────────────────────────────── */}
          <div className="w-full lg:w-[60%]">
            <h2
              className="text-base font-semibold mb-5"
              style={{ color: "#dfe2eb" }}
            >
              Your Recommendations
            </h2>

            {loadingData ? (
              <div className="flex flex-col gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : matchedPrograms.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {matchedPrograms.map(({ program, matchScore }, index) => (
                    <ProgramCard
                      key={program.slug}
                      program={program}
                      matchScore={matchScore}
                      rank={index}
                    />
                  ))}
                </div>

                {/* Qualification Summary below cards */}
                {qualification && (
                  <QualificationSummary qual={qualification} />
                )}
              </>
            ) : (
              <>
                <EmptyState />
                {/* Still show summary if qualification exists but no program rows yet */}
                {qualification && !loadingData && (
                  <QualificationSummary qual={qualification} />
                )}
              </>
            )}
          </div>

          {/* ── Right: Consultation (40%) ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="w-full lg:w-[40%] lg:sticky lg:top-24"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#1c2026",
                border: "1px solid rgba(69,71,75,0.15)",
              }}
            >
              {/* Header */}
              <div
                className="px-6 pt-6 pb-4"
                style={{ borderBottom: "1px solid rgba(69,71,75,0.15)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: "#bbc4f7" }}
                    aria-hidden="true"
                  >
                    calendar_month
                  </span>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "#dfe2eb" }}
                  >
                    Book Your Consultation
                  </h2>
                </div>
                <p className="text-xs" style={{ color: "#8f9095" }}>
                  Speak directly with a senior advisor about your results.
                </p>
              </div>

              {/* Calendly Embed */}
              <div className="w-full">
                <iframe
                  src="https://calendly.com/lc-concierge/concierge-consultation?hide_gdpr_banner=1&background_color=10141a&text_color=dfe2eb&primary_color=bbc4f7"
                  width="100%"
                  height="700"
                  frameBorder={0}
                  title="Book a concierge consultation"
                  style={{ display: "block", border: "none" }}
                />
              </div>

              {/* Footer note */}
              <div
                className="px-6 py-4 flex items-start gap-2"
                style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0 mt-0.5"
                  style={{ fontSize: 14, color: "#8f9095" }}
                  aria-hidden="true"
                >
                  info
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "#8f9095" }}>
                  Your advisor will review your qualification before the call.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
