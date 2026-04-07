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

function getBenefitPills(program: Program): { icon: string; label: string }[] {
  const pills: { icon: string; label: string }[] = [];
  if (program.radarScores.travel_score >= 70) pills.push({ icon: "flight", label: program.visaFreeCount ? `${program.visaFreeCount} Countries` : "Global Access" });
  if (program.radarScores.tax_score >= 70) pills.push({ icon: "account_balance", label: "Tax Friendly" });
  if (program.radarScores.speed_score >= 60) pills.push({ icon: "bolt", label: program.processingTimeMonths ? `${program.processingTimeMonths}mo Speed` : "Fast Track" });
  if (program.radarScores.lifestyle_score >= 60) pills.push({ icon: "villa", label: "High Lifestyle" });
  if (program.type === "CBI") pills.push({ icon: "badge", label: "Full Citizenship" });
  if (program.region === "europe") pills.push({ icon: "euro", label: "EU Access" });
  return pills.slice(0, 3);
}

function ProgramCard({
  program,
  matchScore,
  rank,
}: {
  program: Program;
  matchScore: number;
  rank: number;
}) {
  const sym = program.currency === "USD" ? "$" : program.currency === "EUR" ? "\u20ac" : program.currency + " ";
  const investmentDisplay = program.minInvestment === 0
    ? "No minimum"
    : `${sym}${program.minInvestment.toLocaleString()}`;
  const pills = getBenefitPills(program);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: rank * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#1c2026",
        border: "1px solid rgba(69,71,75,0.15)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      {/* Image area */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/programs/${program.slug}.jpg`}
          alt={program.country}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c2026] via-transparent to-transparent" />

        {/* Country badge top-left */}
        <span
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(187,196,247,0.15)", backdropFilter: "blur(8px)", color: "#dfe2eb" }}
        >
          {program.country}
        </span>

        {/* Match score badge bottom-right */}
        <div
          className="absolute bottom-3 right-3 rounded-xl px-3 py-2 text-center"
          style={{ background: "rgba(10,14,20,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(69,71,75,0.3)" }}
        >
          <p className="text-[9px] uppercase tracking-widest" style={{ color: "#8f9095" }}>Match Score</p>
          <p className="text-xl font-bold" style={{ color: "#bbc4f7" }}>{matchScore}%</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-base font-semibold" style={{ color: "#dfe2eb" }}>
            {program.name.replace(program.country, "").trim() || program.type} Program
          </h3>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold" style={{ color: "#dfe2eb" }}>{investmentDisplay}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "#8f9095" }}>Minimum Entry</p>
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8f9095" }}>
          {program.marketingHook.length > 80 ? program.marketingHook.slice(0, 80) + "..." : program.marketingHook}
        </p>

        {/* Benefit pills */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {pills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium"
                style={{ background: "rgba(69,71,75,0.2)", color: "#c6c6cb", border: "1px solid rgba(69,71,75,0.15)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#8f9095" }}>{pill.icon}</span>
                {pill.label}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/programs/${program.slug}` as "/programs/[slug]"}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ background: "rgba(69,71,75,0.15)", border: "1px solid rgba(69,71,75,0.25)", color: "#dfe2eb" }}
        >
          View Full Prospectus
        </Link>
      </div>
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

function QualificationSummary({ qual, profile }: { qual: Qualification; profile: { full_name: string | null; email: string | null; phone: string | null; country: string | null; nationality: string | null } | null }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    country: profile?.country || "",
    nationality: profile?.nationality || "",
    situation: qual.situation || "",
  });

  const focusLabels = formatFocus(qual.strategic_focus ?? []);

  const inputStyle: React.CSSProperties = {
    background: "#0a0e14",
    border: "1px solid rgba(69,71,75,0.3)",
    borderRadius: "0.5rem",
    color: "#dfe2eb",
    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
    fontSize: "0.8125rem",
    padding: "0.5rem 0.75rem",
    width: "100%",
    outline: "none",
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("profiles").update({
      full_name: form.full_name || null,
      phone: form.phone || null,
      country: form.country || null,
      nationality: form.nationality || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    await supabase.from("qualifications").update({
      situation: form.situation || null,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    setSaving(false);
    setEditing(false);
    window.location.reload();
  };

  const rows: { label: string; value: string; icon: string; field?: keyof typeof form }[] = [
    { label: "Name", value: profile?.full_name || "—", icon: "person", field: "full_name" },
    { label: "Email", value: profile?.email || "—", icon: "mail" },
    { label: "Phone", value: profile?.phone || "—", icon: "call", field: "phone" },
    { label: "Residence", value: profile?.country || "—", icon: "location_on", field: "country" },
    { label: "Citizenships", value: profile?.nationality || "—", icon: "public", field: "nationality" },
    { label: "Budget", value: formatInvestment(qual.investment_amount), icon: "payments" },
    { label: "Timeline", value: qual.timeline ? formatTimeline(qual.timeline) : "—", icon: "schedule" },
    { label: "Family Members", value: qual.dependants != null ? String(qual.dependants) : "—", icon: "group" },
  ];

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#1c2026",
        border: "1px solid rgba(69,71,75,0.15)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8f9095" }}>
          Your Profile
        </h3>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ color: "#8f9095" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ background: "#bbc4f7", color: "#242d58" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
            style={{ color: "#bbc4f7" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
            Edit
          </button>
        )}
      </div>

      {/* Detail rows */}
      <div className="flex flex-col gap-3 mb-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="material-symbols-outlined flex-shrink-0 mt-1" style={{ fontSize: 16, color: "#8f9095" }}>{row.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#8f9095" }}>{row.label}</p>
              {editing && row.field ? (
                <input
                  type="text"
                  value={form[row.field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [row.field!]: e.target.value }))}
                  style={inputStyle}
                />
              ) : (
                <p className="text-sm font-medium truncate" style={{ color: "#c6c6cb" }}>{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Focus Tags */}
      {focusLabels.length > 0 && (
        <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#8f9095" }}>Strategic Focus</p>
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

      {/* Situation */}
      <div className="pt-4 mt-3" style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}>
        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>Situation</p>
        {editing ? (
          <textarea
            value={form.situation}
            onChange={(e) => setForm((prev) => ({ ...prev, situation: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb" }}>{qual.situation || "—"}</p>
        )}
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
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null; phone: string | null; country: string | null; nationality: string | null } | null>(null);
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

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone, country, nationality")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData ?? null);

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
          {/* ── Left: Profile + Recommendations (60%) ──────────────────── */}
          <div className="w-full lg:w-[60%]">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#d6c3b7" }}>verified</span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#d6c3b7" }}>Curated Recommendations</p>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-semibold mb-2"
              style={{ color: "#dfe2eb" }}
            >
              Your Strategic <em style={{ color: "#bbc4f7" }}>Global Path</em>
            </h2>
            <p className="text-sm mb-8" style={{ color: "#8f9095" }}>
              Based on your portfolio profile and jurisdictional preferences, these programs offer the highest alignment with your sovereign goals.
            </p>

            {loadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : matchedPrograms.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchedPrograms.map(({ program, matchScore }, index) => (
                    <ProgramCard
                      key={program.slug}
                      program={program}
                      matchScore={matchScore}
                      rank={index}
                    />
                  ))}
                </div>

              </>
            ) : (
              <>
                <EmptyState />
              </>
            )}
          </div>

          {/* ── Right: Profile + Consultation (40%) ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="w-full lg:w-[40%] lg:sticky lg:top-24"
          >
            {/* Calendly — only after form is filled */}
            {qualification && (
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
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
