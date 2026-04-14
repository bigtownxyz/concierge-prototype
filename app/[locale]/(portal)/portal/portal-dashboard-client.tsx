"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROGRAMS } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import { QualifyModal } from "@/components/shared/QualifyModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  country: string;
  nationality: string;
}

interface QualificationData {
  id: string;
  strategic_focus: string[];
  investment_amount: number;
  timeline: string | null;
  dependants: number | null;
  situation: string;
  updated_at: string;
  programs: { program_slug: string; match_score: number }[];
}

interface Props {
  user: UserData;
  qualification: QualificationData | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 5_000_000) return "$5M+";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

const FOCUS_LABELS: Record<string, string> = {
  mobility: "Global Mobility",
  tax: "Tax Optimisation",
  family: "Family Security",
  assets: "Asset Diversification",
};

const FOCUS_ICONS: Record<string, string> = {
  mobility: "public",
  tax: "account_balance_wallet",
  family: "family_restroom",
  assets: "rebase",
};

// ─── Section: Profile Card ────────────────────────────────────────────────────

function ProfileCard({ user }: { user: UserData }) {
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(28,32,38,0.8)",
        border: "1px solid rgba(69,71,75,0.3)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold flex-shrink-0"
          style={{
            background: "rgba(187,196,247,0.12)",
            border: "1px solid rgba(187,196,247,0.25)",
            color: "#bbc4f7",
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
          }}
        >
          {initials}
        </div>
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            {user.full_name || user.email.split("@")[0]}
          </h3>
          <p className="text-sm" style={{ color: "#8f9095" }}>
            {user.email}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 rounded-xl p-4"
        style={{ background: "rgba(10,14,20,0.5)", border: "1px solid rgba(69,71,75,0.2)" }}
      >
        {user.country && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#8f9095" }}>
              Residence
            </p>
            <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>
              {user.country}
            </p>
          </div>
        )}
        {user.nationality && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#8f9095" }}>
              Nationality
            </p>
            <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>
              {user.nationality}
            </p>
          </div>
        )}
        {user.phone && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#8f9095" }}>
              Phone
            </p>
            <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>
              {user.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Qualification Summary ──────────────────────────────────────────

function QualificationSummary({
  qualification,
  onEdit,
}: {
  qualification: QualificationData;
  onEdit: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: "rgba(28,32,38,0.8)",
        border: "1px solid rgba(69,71,75,0.3)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#bbc4f7" }}
          >
            Qualification
          </p>
          <h3
            className="text-lg font-semibold"
            style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            Your Profile
          </h3>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200"
          style={{
            background: "rgba(187,196,247,0.1)",
            border: "1px solid rgba(187,196,247,0.2)",
            color: "#bbc4f7",
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(187,196,247,0.16)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(187,196,247,0.1)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
          Edit
        </button>
      </div>

      {/* Investment amount */}
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,14,20,0.5)", border: "1px solid rgba(69,71,75,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#8f9095" }}>
            paid
          </span>
          <span className="text-sm" style={{ color: "#8f9095" }}>
            Investment Range
          </span>
        </div>
        <span className="text-sm font-semibold" style={{ color: "#bbc4f7" }}>
          {formatAmount(qualification.investment_amount)}
        </span>
      </div>

      {/* Strategic focus */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8f9095" }}>
          Strategic Focus
        </p>
        <div className="flex flex-wrap gap-2">
          {qualification.strategic_focus.map((focus) => (
            <span
              key={focus}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(187,196,247,0.1)",
                border: "1px solid rgba(187,196,247,0.2)",
                color: "#bbc4f7",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {FOCUS_ICONS[focus] ?? "star"}
              </span>
              {FOCUS_LABELS[focus] ?? focus}
            </span>
          ))}
        </div>
      </div>

      {/* Situation */}
      {qualification.situation && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8f9095" }}>
            Situation Notes
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb" }}>
            {qualification.situation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section: Recommended Programs ───────────────────────────────────────────

function RecommendedPrograms({
  programs,
}: {
  programs: { program_slug: string; match_score: number }[];
}) {
  if (programs.length === 0) return null;

  const matches = programs
    .map(({ program_slug, match_score }) => {
      const program = PROGRAMS.find((p) => p.slug === program_slug);
      return program ? { program, match_score } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.match_score - a.match_score);

  if (matches.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#bbc4f7" }}
          >
            Recommended Programs
          </p>
          <h3
            className="text-lg font-semibold"
            style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
          >
            Your Matched Programmes
          </h3>
        </div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: "#8f9095" }}
        >
          View all
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {matches.map(({ program, match_score }, i) => (
          <motion.div
            key={program.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{
              background: "rgba(28,32,38,0.8)",
              border: i === 0
                ? "1px solid rgba(187,196,247,0.35)"
                : "1px solid rgba(69,71,75,0.3)",
              boxShadow: i === 0 ? "0 0 24px rgba(187,196,247,0.06)" : "none",
            }}
          >
            {/* Badge row */}
            <div className="flex items-center justify-between">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                style={{
                  background: i === 0 ? "#bbc4f7" : "rgba(69,71,75,0.4)",
                  color: i === 0 ? "#242d58" : "#8f9095",
                }}
              >
                {i === 0 ? "Best Match" : i === 1 ? "Runner Up" : `#${i + 1}`}
              </span>
              <span className="text-xs uppercase tracking-wide" style={{ color: "#8f9095" }}>
                {program.type}
              </span>
            </div>

            {/* Program info */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xl">{program.flagEmoji}</span>
                <h4
                  className="text-base font-semibold"
                  style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                >
                  {program.country}
                </h4>
              </div>
              <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "#8f9095" }}>
                {program.marketingHook}
              </p>
            </div>

            {/* Match score bar */}
            <div className="flex items-center gap-2">
              <div
                className="h-1 flex-1 rounded-full overflow-hidden"
                style={{ background: "rgba(69,71,75,0.4)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    background: i === 0 ? "#bbc4f7" : "rgba(187,196,247,0.5)",
                    width: `${match_score}%`,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: "#bbc4f7" }}
              >
                {match_score}%
              </span>
            </div>

            {/* Key stats */}
            <div
              className="grid grid-cols-3 gap-2 rounded-lg px-3 py-2.5 text-center"
              style={{ background: "rgba(10,14,20,0.5)", border: "1px solid rgba(69,71,75,0.2)" }}
            >
              <div>
                <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: "#8f9095" }}>
                  Min
                </p>
                <p className="text-xs font-semibold" style={{ color: "#c6c6cb" }}>
                  {program.currency === "USD" ? "$" : program.currency === "EUR" ? "€" : program.currency}
                  {(program.minInvestment / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: "#8f9095" }}>
                  Time
                </p>
                <p className="text-xs font-semibold" style={{ color: "#c6c6cb" }}>
                  {program.processingTimeMonths ? `${program.processingTimeMonths}mo` : "Varies"}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: "#8f9095" }}>
                  Access
                </p>
                <p className="text-xs font-semibold" style={{ color: "#c6c6cb" }}>
                  {program.visaFreeCount ?? "—"}
                </p>
              </div>
            </div>

            <Link
              href={`/programs/${program.slug}`}
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: "rgba(187,196,247,0.08)",
                border: "1px solid rgba(187,196,247,0.2)",
                color: "#bbc4f7",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(187,196,247,0.14)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(187,196,247,0.08)")
              }
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                analytics
              </span>
              Full Breakdown
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty Qualification CTA ──────────────────────────────────────────────────

function EmptyQualification({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="rounded-2xl p-10 flex flex-col items-center text-center gap-5"
      style={{
        background: "rgba(28,32,38,0.6)",
        border: "1px dashed rgba(69,71,75,0.5)",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "rgba(187,196,247,0.08)",
          border: "1px solid rgba(187,196,247,0.2)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#bbc4f7" }}>
          assignment
        </span>
      </div>
      <div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          No Qualification Yet
        </h3>
        <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#8f9095" }}>
          Complete the qualification process to receive personalised programme recommendations aligned to your objectives.
        </p>
      </div>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200"
        style={{
          background: "#bbc4f7",
          color: "#242d58",
          fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          start
        </span>
        Start Qualification
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function PortalDashboardClient({ user, qualification }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  // Build prefill data from existing qualification so "Edit" reopens the form pre-filled
  const prefill = qualification
    ? {
        strategicFocus: qualification.strategic_focus as (
          | "mobility"
          | "tax"
          | "family"
          | "assets"
        )[],
        investmentAmount: qualification.investment_amount,
        situation: qualification.situation,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        nationality: user.nationality,
        selectedPrograms: qualification.programs.map((p) => p.program_slug),
      }
    : undefined;

  return (
    <>
      <div
        className="min-h-screen"
        style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
      >
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#bbc4f7" }}
          >
            Client Portal
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "#dfe2eb", letterSpacing: "-0.02em" }}
          >
            Welcome{user.full_name ? `, ${user.full_name.split(" ")[0]}` : " back"}.
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#8f9095" }}>
            Here&apos;s your qualification overview and matched programmes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <ProfileCard user={user} />

            {qualification && (
              <QualificationSummary
                qualification={qualification}
                onEdit={() => setModalOpen(true)}
              />
            )}
          </div>

          {/* Right column — recommended programs or empty CTA */}
          <div className="lg:col-span-2">
            {qualification && qualification.programs.length > 0 ? (
              <RecommendedPrograms programs={qualification.programs} />
            ) : (
              <EmptyQualification onStart={() => setModalOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Qualify Modal — prefilled when editing */}
      <QualifyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prefill={prefill}
      />
    </>
  );
}
