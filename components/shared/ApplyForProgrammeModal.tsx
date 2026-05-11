"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROGRAMS, type Program } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApplyForProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Programme slugs the user arrived with (typically the page they clicked from) */
  initialProgrammes?: string[];
  /** Called after a successful submission. Phase 2 will wire signup + DB write here. */
  onSubmit?: (data: ApplyFormData) => Promise<void> | void;
}

type Timeline = "immediate" | "strategic" | "long-term";
type FamilyRelation = "spouse" | "parent" | "sibling" | "child";

export interface FamilyMember {
  id: string;
  relation: FamilyRelation;
  nationality: string;
  age: number;
}

export interface ApplyFormData {
  selectedProgrammes: string[];
  investmentAmount: number;
  timeline: Timeline | "";
  familyMembers: FamilyMember[];
  isUsCitizen: boolean | null;
  name: string;
  email: string;
  password: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMELINE_OPTIONS: { id: Timeline; label: string; icon: string; desc: string }[] = [
  { id: "immediate", label: "Immediate", icon: "bolt", desc: "0–6 months — priority processing and rapid capital deployment." },
  { id: "strategic", label: "Strategic", icon: "trending_up", desc: "6–18 months — standard processing window with proper structuring." },
  { id: "long-term", label: "Long-term", icon: "schedule", desc: "18+ months — research phase, building toward a future application." },
];

const FAMILY_RELATIONS: { id: FamilyRelation; label: string; icon: string }[] = [
  { id: "spouse", label: "Spouse", icon: "favorite" },
  { id: "child", label: "Child", icon: "child_care" },
  { id: "parent", label: "Parent", icon: "elderly" },
  { id: "sibling", label: "Sibling", icon: "diversity_3" },
];

const SLIDER_MIN = 100_000;
const SLIDER_MAX = 1_000_000;
const SLIDER_STEP = 25_000;
const SLIDER_TICKS = [100_000, 250_000, 500_000, 750_000, 1_000_000];

const STEP_COUNT = 5;
const STEP_DURATIONS = ["~30 sec", "~1 min", "~1 min", "~2 min", "~30 sec"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  return `$${(n / 1_000).toFixed(0)}K`;
}

function formatTick(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  return `$${n / 1_000}K`;
}

function programmeFromSlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

function programmeMinDisplay(p: Program): string {
  if (p.minInvestment === 0) return "No minimum";
  const sym = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : `${p.currency} `;
  if (p.minInvestment >= 1_000_000) return `${sym}${(p.minInvestment / 1_000_000).toFixed(p.minInvestment % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${sym}${(p.minInvestment / 1_000).toFixed(0)}K`;
}

function programmeTypeLabel(t: Program["type"]): string {
  switch (t) {
    case "CBI":
      return "Citizenship by Investment";
    case "Residency":
      return "Residency by Investment";
    case "Golden Visa":
      return "Golden Visa";
    case "Trust":
      return "Asset Protection";
    default:
      return "";
  }
}

function programmeShortLabel(p: Program): string {
  // Two-letter tile content, e.g. "Dominica" → "DM", "St Kitts" → "KN", "Antigua & Barbuda" → "AG"
  const overrides: Record<string, string> = {
    dominica: "DM",
    "st-kitts-and-nevis": "KN",
    grenada: "GD",
    "antigua-and-barbuda": "AG",
    "st-lucia": "LC",
    serbia: "RS",
    portugal: "PT",
    greece: "GR",
    slovakia: "SK",
    georgia: "GE",
    dubai: "AE",
    argentina: "AR",
    chile: "CL",
    "el-salvador": "SV",
    panama: "PA",
    "asset-protection-trust": "APT",
  };
  return overrides[p.slug] ?? p.country.slice(0, 2).toUpperCase();
}

function headerPillText(slugs: string[]): string {
  if (slugs.length === 0) return "No programmes selected";
  if (slugs.length === 1) {
    const p = programmeFromSlug(slugs[0]);
    return p ? `Applying for ${p.country}` : "Applying for 1 programme";
  }
  if (slugs.length === 2) {
    const first = programmeFromSlug(slugs[0]);
    return first ? `Applying for ${first.country} + 1` : "Applying for 2 programmes";
  }
  return `Applying for ${slugs.length} programmes`;
}

function timelineLabel(t: Timeline | ""): string {
  if (!t) return "Not set";
  return TIMELINE_OPTIONS.find((opt) => opt.id === t)?.label ?? t;
}

function timelineRange(t: Timeline | ""): string {
  const opt = TIMELINE_OPTIONS.find((o) => o.id === t);
  if (!opt) return "";
  // Pull the bit before the em-dash for the summary "Strategic (6–18 months)"
  const m = opt.desc.match(/^([^—]+)/);
  return m ? `${opt.label} (${m[1].trim()})` : opt.label;
}

function familySummary(members: FamilyMember[]): string {
  if (members.length === 0) return "Just me";
  const counts: Record<string, number> = {};
  for (const m of members) counts[m.relation] = (counts[m.relation] ?? 0) + 1;
  const parts: string[] = [];
  if (counts.spouse) parts.push("Spouse");
  if (counts.child) parts.push(`${counts.child} ${counts.child === 1 ? "child" : "children"}`);
  if (counts.parent) parts.push(`${counts.parent} parent${counts.parent === 1 ? "" : "s"}`);
  if (counts.sibling) parts.push(`${counts.sibling} sibling${counts.sibling === 1 ? "" : "s"}`);
  return parts.join(" + ");
}

function relationLabel(r: FamilyRelation): string {
  return FAMILY_RELATIONS.find((x) => x.id === r)?.label ?? r;
}

function relationIcon(r: FamilyRelation): string {
  return FAMILY_RELATIONS.find((x) => x.id === r)?.icon ?? "person";
}

// ─── Shared styles (matching QualifyModal tokens) ─────────────────────────────

const eyebrowStyle = "text-[11px] font-semibold tracking-[0.12em] uppercase";
const headingStyle = "text-xl font-semibold";
const subStyle = "text-sm leading-relaxed";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0e14",
  border: "1px solid rgba(69,71,75,0.4)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#dfe2eb",
  fontSize: "14px",
  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
  outline: "none",
};

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY: ApplyFormData = {
  selectedProgrammes: [],
  investmentAmount: 500_000,
  timeline: "",
  familyMembers: [],
  isUsCitizen: null,
  name: "",
  email: "",
  password: "",
};

export function ApplyForProgrammeModal({
  isOpen,
  onClose,
  initialProgrammes = [],
  onSubmit,
}: ApplyForProgrammeModalProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplyFormData>({
    ...EMPTY,
    selectedProgrammes: initialProgrammes,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialProgrammes when the modal opens so re-opens with different programmes work
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setData((prev) => ({
        ...prev,
        selectedProgrammes:
          initialProgrammes.length > 0 ? initialProgrammes : prev.selectedProgrammes,
      }));
    }
  }, [isOpen, initialProgrammes]);

  const setField = useCallback(<K extends keyof ApplyFormData>(key: K, value: ApplyFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return data.selectedProgrammes.length >= 1;
      case 2:
        return data.investmentAmount >= SLIDER_MIN;
      case 3:
        return data.timeline !== "";
      case 4:
        return data.isUsCitizen !== null;
      case 5:
        return (
          data.name.trim().length > 0 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
          data.password.length >= 8
        );
      default:
        return false;
    }
  }, [step, data]);

  const handleNext = async () => {
    if (!canContinue) return;
    if (step < STEP_COUNT) {
      setStep(step + 1);
      return;
    }
    // Final step → submit
    setLoading(true);
    setError(null);
    try {
      if (onSubmit) await onSubmit(data);
      else console.log("[ApplyForProgrammeModal] submit (no handler wired)", data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const ctaLabel = useMemo(() => {
    if (step < STEP_COUNT) return "Continue";
    const count = data.selectedProgrammes.length;
    if (count === 0) return "Confirm";
    if (count === 1) {
      const p = programmeFromSlug(data.selectedProgrammes[0]);
      return p ? `Confirm fit for ${p.country}` : "Confirm fit";
    }
    return `Confirm fit for these ${count}`;
  }, [step, data.selectedProgrammes]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="apply-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(10,14,20,0.85)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="apply-modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Apply for programme"
              className="pointer-events-auto w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl"
              style={{
                background: "#1c2026",
                border: "1px solid rgba(69,71,75,0.25)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <Header
                step={step}
                slugs={data.selectedProgrammes}
                onClose={onClose}
              />

              {/* Body */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="px-7 pt-6 pb-2"
                >
                  {step === 1 && (
                    <StepProgrammes
                      selected={data.selectedProgrammes}
                      onChange={(slugs) => setField("selectedProgrammes", slugs)}
                    />
                  )}
                  {step === 2 && (
                    <StepBudget
                      slugs={data.selectedProgrammes}
                      amount={data.investmentAmount}
                      onChange={(n) => setField("investmentAmount", n)}
                    />
                  )}
                  {step === 3 && (
                    <StepTimeline
                      selected={data.timeline}
                      onChange={(t) => setField("timeline", t)}
                    />
                  )}
                  {step === 4 && (
                    <StepFamilyAndStatus
                      members={data.familyMembers}
                      isUsCitizen={data.isUsCitizen}
                      onMembersChange={(m) => setField("familyMembers", m)}
                      onUsChange={(b) => setField("isUsCitizen", b)}
                    />
                  )}
                  {step === 5 && (
                    <StepAccount
                      data={data}
                      onNameChange={(v) => setField("name", v)}
                      onEmailChange={(v) => setField("email", v)}
                      onPasswordChange={(v) => setField("password", v)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error banner */}
              {error && (
                <div
                  className="mx-7 mt-2 mb-1 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "rgba(184,92,107,0.08)",
                    border: "1px solid rgba(184,92,107,0.25)",
                    color: "#e9b9c1",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 px-7 pt-3 pb-7">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(69,71,75,0.4)",
                      color: "#c6c6cb",
                    }}
                    aria-label="Back"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      arrow_back
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue || loading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#bbc4f7", color: "#242d58" }}
                >
                  {loading ? "Saving…" : ctaLabel}
                  {!loading && (
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      arrow_forward
                    </span>
                  )}
                </button>
              </div>

              {step === 5 && (
                <p className="px-7 pb-5 text-center text-[11px] leading-relaxed" style={{ color: "#8f9095" }}>
                  By continuing you agree to our{" "}
                  <a href="/terms" style={{ color: "#bbc4f7", textDecoration: "none" }}>
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" style={{ color: "#bbc4f7", textDecoration: "none" }}>
                    Privacy Policy
                  </a>
                  .
                  <br />
                  Already have an account?{" "}
                  <a href="/login" style={{ color: "#bbc4f7", textDecoration: "none" }}>
                    Sign in
                  </a>
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({
  step,
  slugs,
  onClose,
}: {
  step: number;
  slugs: string[];
  onClose: () => void;
}) {
  return (
    <div
      className="px-7 pt-6 pb-4"
      style={{
        borderBottom: "1px solid rgba(69,71,75,0.2)",
        background: "linear-gradient(180deg, rgba(187,196,247,0.04) 0%, transparent 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em]"
          style={{
            background: "rgba(187,196,247,0.08)",
            border: "1px solid rgba(187,196,247,0.18)",
            color: "#bbc4f7",
          }}
        >
          <span
            className="block h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ background: "#bbc4f7" }}
          />
          {headerPillText(slugs)}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0"
          style={{ color: "#8f9095", background: "transparent", border: 0, cursor: "pointer" }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      </div>

      {/* Progress bars */}
      <div className="flex gap-1">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-sm"
            style={{
              background:
                i < step ? "#bbc4f7" : "rgba(187,196,247,0.12)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Step meta */}
      <div className="mt-2.5 flex justify-between text-[10px] tracking-[0.04em]" style={{ color: "#8f9095" }}>
        <span>Step {step} of {STEP_COUNT}</span>
        <span>{STEP_DURATIONS[step - 1]}</span>
      </div>
    </div>
  );
}

// ─── Step 1 — Programmes ──────────────────────────────────────────────────────

function StepProgrammes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProgrammes = useMemo(
    () => selected.map(programmeFromSlug).filter((p): p is Program => !!p),
    [selected]
  );

  const remaining = useMemo(() => {
    const set = new Set(selected);
    const q = search.trim().toLowerCase();
    return PROGRAMS.filter((p) => !set.has(p.slug)).filter((p) =>
      q ? p.country.toLowerCase().includes(q) : true
    );
  }, [selected, search]);

  const remove = (slug: string) => onChange(selected.filter((s) => s !== slug));
  const add = (slug: string) => {
    onChange([...selected, slug]);
    setSearch("");
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className={eyebrowStyle} style={{ color: "#bbc4f7" }}>
          Your Application
        </p>
        <h3 className={`${headingStyle} mt-1.5`} style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Programmes you&apos;re applying for
        </h3>
        <p className={`${subStyle} mt-1.5`} style={{ color: "#8f9095" }}>
          {selectedProgrammes.length === 1 && selectedProgrammes[0]
            ? `We've pre-selected ${selectedProgrammes[0].country} from the page you came from. Add more if you'd like to discuss several with your advisor, or remove and pick something else.`
            : "Add or remove programmes you'd like to discuss with your advisor."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {selectedProgrammes.map((p) => (
          <div
            key={p.slug}
            className="flex items-center gap-3.5 rounded-xl px-3.5 py-3"
            style={{ background: "#0a0e14", border: "1px solid rgba(187,196,247,0.3)" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-wider"
              style={{
                background: "linear-gradient(135deg, rgba(187,196,247,0.18), rgba(187,196,247,0.05))",
                border: "1px solid rgba(187,196,247,0.25)",
                color: "#bbc4f7",
              }}
            >
              {programmeShortLabel(p)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>
                {p.country}
              </p>
              <p className="text-[11px]" style={{ color: "#8f9095" }}>
                {programmeTypeLabel(p.type)}
                {p.minInvestment > 0 ? ` · from ${programmeMinDisplay(p)}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(p.slug)}
              disabled={selectedProgrammes.length === 1}
              className="rounded-md p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "#8f9095", background: "transparent", border: 0 }}
              aria-label={`Remove ${p.country}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>
          </div>
        ))}

        {/* Add another */}
        {!pickerOpen ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-colors hover:text-[#bbc4f7]"
            style={{
              background: "transparent",
              border: "1px dashed rgba(69,71,75,0.55)",
              color: "#8f9095",
              fontFamily: "inherit",
            }}
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(69,71,75,0.4)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
            </span>
            <span className="font-medium">Add another programme</span>
          </button>
        ) : (
          <div
            className="rounded-xl"
            style={{ background: "#0a0e14", border: "1px solid rgba(187,196,247,0.3)" }}
          >
            <div className="px-3 pt-3 pb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries…"
                autoFocus
                style={inputStyle}
              />
            </div>
            <div className="max-h-52 overflow-y-auto px-2 pb-2">
              {remaining.length === 0 ? (
                <p className="px-2 py-3 text-xs" style={{ color: "#8f9095" }}>
                  No more programmes to add.
                </p>
              ) : (
                remaining.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => add(p.slug)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[rgba(187,196,247,0.06)]"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "#dfe2eb",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-wide"
                      style={{
                        background: "rgba(187,196,247,0.12)",
                        color: "#bbc4f7",
                      }}
                    >
                      {programmeShortLabel(p)}
                    </span>
                    <span className="flex-1 text-sm font-medium">{p.country}</span>
                    <span className="text-[11px]" style={{ color: "#8f9095" }}>
                      {p.minInvestment > 0 ? programmeMinDisplay(p) : "No min"}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end px-3 pb-3">
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setSearch("");
                }}
                className="text-xs"
                style={{ background: "transparent", border: 0, color: "#8f9095", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2 — Budget ──────────────────────────────────────────────────────────

function StepBudget({
  slugs,
  amount,
  onChange,
}: {
  slugs: string[];
  amount: number;
  onChange: (n: number) => void;
}) {
  const programmes = useMemo(
    () => slugs.map(programmeFromSlug).filter((p): p is Program => !!p),
    [slugs]
  );

  const refLineLabel = useMemo(() => {
    if (programmes.length === 0) return null;
    if (programmes.length === 1) {
      return `${programmes[0].country} minimum: ${programmeMinDisplay(programmes[0])}`;
    }
    const sorted = [...programmes].sort((a, b) => a.minInvestment - b.minInvestment);
    return sorted.map((p) => `${p.country} ${programmeMinDisplay(p)}`).join(" · ");
  }, [programmes]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className={eyebrowStyle} style={{ color: "#bbc4f7" }}>
          Target Deployment
        </p>
        <h3 className={`${headingStyle} mt-1.5`} style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Estimated budget
        </h3>
        <p className={`${subStyle} mt-1.5`} style={{ color: "#8f9095" }}>
          Indicate your anticipated investment threshold. Your advisor will use this to structure the application.
        </p>
      </div>

      {refLineLabel && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs leading-relaxed"
          style={{
            background: "rgba(187,196,247,0.05)",
            border: "1px solid rgba(187,196,247,0.12)",
            color: "#c6c6cb",
          }}
        >
          <span
            className="material-symbols-outlined flex-shrink-0"
            style={{ fontSize: 16, color: "#bbc4f7", marginTop: 1 }}
          >
            flag
          </span>
          <div>
            <span
              className="font-semibold tracking-[0.08em]"
              style={{ color: "#bbc4f7", fontSize: "10px", textTransform: "uppercase" }}
            >
              {programmes.length === 1 ? "Programme minimum" : "Minimums across your selections"}
            </span>
            <br />
            {refLineLabel}
          </div>
        </div>
      )}

      <div className="flex justify-end items-baseline">
        <span
          className="font-semibold tabular-nums"
          style={{
            color: "#bbc4f7",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {formatAmount(amount)}
        </span>
      </div>

      <div>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          className="apply-slider"
          aria-label="Investment amount"
        />
        <div className="mt-3 flex justify-between text-[10px]" style={{ color: "#8f9095" }}>
          {SLIDER_TICKS.map((t) => (
            <span key={t}>{formatTick(t)}</span>
          ))}
        </div>
      </div>

      {/* Inline styles for the range slider — kept here so the component is self-contained */}
      <style jsx>{`
        .apply-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: linear-gradient(
            to right,
            #bbc4f7 0%,
            #bbc4f7 ${((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%,
            rgba(69, 71, 75, 0.4) ${((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%,
            rgba(69, 71, 75, 0.4) 100%
          );
          border-radius: 3px;
          outline: none;
        }
        .apply-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #bbc4f7;
          box-shadow: 0 4px 12px rgba(187, 196, 247, 0.4);
          cursor: pointer;
        }
        .apply-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #bbc4f7;
          box-shadow: 0 4px 12px rgba(187, 196, 247, 0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ─── Step 3 — Timeline ────────────────────────────────────────────────────────

function StepTimeline({
  selected,
  onChange,
}: {
  selected: Timeline | "";
  onChange: (t: Timeline) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className={eyebrowStyle} style={{ color: "#bbc4f7" }}>
          Your Profile
        </p>
        <h3 className={`${headingStyle} mt-1.5`} style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          When are you looking to move?
        </h3>
        <p className={`${subStyle} mt-1.5`} style={{ color: "#8f9095" }}>
          Your timeline shapes whether we expedite, stage, or sequence the applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TIMELINE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: "#0a0e14",
                border: isSelected
                  ? "1px solid rgba(187,196,247,0.5)"
                  : "1px solid rgba(69,71,75,0.4)",
                boxShadow: isSelected ? "0 0 20px rgba(187,196,247,0.08)" : "none",
                fontFamily: "inherit",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, color: isSelected ? "#bbc4f7" : "#8f9095" }}
                >
                  {opt.icon}
                </span>
                <span
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                  style={{
                    background: isSelected ? "#bbc4f7" : "transparent",
                    border: isSelected
                      ? "2px solid #bbc4f7"
                      : "2px solid rgba(69,71,75,0.7)",
                  }}
                >
                  {isSelected && (
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 12,
                        color: "#242d58",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      check
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: isSelected ? "#dfe2eb" : "#c6c6cb" }}>
                {opt.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "#8f9095" }}>
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4 — Family + US citizen ─────────────────────────────────────────────

function StepFamilyAndStatus({
  members,
  isUsCitizen,
  onMembersChange,
  onUsChange,
}: {
  members: FamilyMember[];
  isUsCitizen: boolean | null;
  onMembersChange: (m: FamilyMember[]) => void;
  onUsChange: (b: boolean) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draftRelation, setDraftRelation] = useState<FamilyRelation>("spouse");
  const [draftNationality, setDraftNationality] = useState("");
  const [draftAge, setDraftAge] = useState("");

  const canSave =
    draftRelation && draftNationality.trim().length > 0 && draftAge !== "" && Number(draftAge) > 0;

  const save = () => {
    if (!canSave) return;
    const m: FamilyMember = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `fm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      relation: draftRelation,
      nationality: draftNationality.trim(),
      age: Number(draftAge),
    };
    onMembersChange([...members, m]);
    setDraftRelation("spouse");
    setDraftNationality("");
    setDraftAge("");
    setAdding(false);
  };

  const remove = (id: string) => onMembersChange(members.filter((m) => m.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className={eyebrowStyle} style={{ color: "#bbc4f7" }}>
          Your Situation
        </p>
        <h3 className={`${headingStyle} mt-1.5`} style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Family &amp; citizenship
        </h3>
        <p className={`${subStyle} mt-1.5`} style={{ color: "#8f9095" }}>
          Dependants can often be included in your application. US citizenship affects structuring.
        </p>
      </div>

      {/* Family list */}
      <div>
        <p
          className="mb-3 text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: "#8f9095" }}
        >
          Family members
        </p>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3"
              style={{ background: "#0a0e14", border: "1px solid rgba(69,71,75,0.3)" }}
            >
              <span
                className="material-symbols-outlined flex-shrink-0"
                style={{ fontSize: 20, color: "#bbc4f7" }}
              >
                {relationIcon(m.relation)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>
                  {relationLabel(m.relation)}
                </p>
                <p className="text-[11px]" style={{ color: "#8f9095" }}>
                  {m.nationality} · {m.age} years old
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                style={{ color: "#8f9095", background: "transparent", border: 0, cursor: "pointer" }}
                aria-label="Remove family member"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>
          ))}

          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-xl px-3.5 py-3 text-xs font-medium transition-colors hover:text-[#bbc4f7]"
              style={{
                background: "transparent",
                border: "1px dashed rgba(69,71,75,0.5)",
                color: "#8f9095",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              + Add family member
            </button>
          ) : (
            <div
              className="rounded-xl p-3.5"
              style={{ background: "#0a0e14", border: "1px solid rgba(187,196,247,0.2)" }}
            >
              {/* Relation pills */}
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {FAMILY_RELATIONS.map((r) => {
                  const sel = draftRelation === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setDraftRelation(r.id)}
                      className="flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition-colors"
                      style={{
                        background: sel ? "rgba(187,196,247,0.12)" : "transparent",
                        border: sel
                          ? "1px solid rgba(187,196,247,0.4)"
                          : "1px solid rgba(69,71,75,0.4)",
                        color: sel ? "#dfe2eb" : "#8f9095",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {r.icon}
                      </span>
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  value={draftNationality}
                  onChange={(e) => setDraftNationality(e.target.value)}
                  placeholder="Nationality"
                  style={inputStyle}
                />
                <input
                  type="number"
                  value={draftAge}
                  onChange={(e) => setDraftAge(e.target.value)}
                  placeholder="Age"
                  min={0}
                  max={120}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setDraftNationality("");
                    setDraftAge("");
                  }}
                  className="flex-1 rounded-lg py-2 text-xs font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(69,71,75,0.4)",
                    color: "#c6c6cb",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "#bbc4f7",
                    color: "#242d58",
                    border: 0,
                    cursor: canSave ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* US citizen */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p
          className="mb-3 text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: "#8f9095" }}
        >
          US citizen?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: true, label: "Yes", icon: "flag", desc: "We'll factor in US tax considerations." },
            { val: false, label: "No", icon: "public", desc: "Standard application structure applies." },
          ].map((opt) => {
            const sel = isUsCitizen === opt.val;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onUsChange(opt.val)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: "#0a0e14",
                  border: sel ? "1px solid rgba(187,196,247,0.5)" : "1px solid rgba(69,71,75,0.4)",
                  boxShadow: sel ? "0 0 20px rgba(187,196,247,0.08)" : "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: sel ? "#bbc4f7" : "#8f9095" }}
                  >
                    {opt.icon}
                  </span>
                  <span
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{
                      background: sel ? "#bbc4f7" : "transparent",
                      border: sel ? "2px solid #bbc4f7" : "2px solid rgba(69,71,75,0.7)",
                    }}
                  >
                    {sel && (
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 12,
                          color: "#242d58",
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        check
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: sel ? "#dfe2eb" : "#c6c6cb" }}>
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "#8f9095" }}>
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 — Account + summary ───────────────────────────────────────────────

function StepAccount({
  data,
  onNameChange,
  onEmailChange,
  onPasswordChange,
}: {
  data: ApplyFormData;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
}) {
  const programmes = useMemo(
    () => data.selectedProgrammes.map(programmeFromSlug).filter((p): p is Program => !!p),
    [data.selectedProgrammes]
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className={eyebrowStyle} style={{ color: "#bbc4f7" }}>
          Almost done
        </p>
        <h3 className={`${headingStyle} mt-1.5`} style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Create your account
        </h3>
        <p className={`${subStyle} mt-1.5`} style={{ color: "#8f9095" }}>
          We&apos;ll save your application and connect you with your advisor.
        </p>
      </div>

      {/* Summary */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#0a0e14", border: "1px solid rgba(69,71,75,0.3)" }}
      >
        <p
          className="mb-3 text-[10px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "#8f9095" }}
        >
          Your application
        </p>
        <SummaryRow
          k="Programmes"
          v={
            <div className="flex flex-wrap justify-end gap-1">
              {programmes.map((p) => (
                <span
                  key={p.slug}
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: "rgba(187,196,247,0.1)",
                    border: "1px solid rgba(187,196,247,0.2)",
                    color: "#bbc4f7",
                  }}
                >
                  {p.country}
                </span>
              ))}
            </div>
          }
        />
        <SummaryRow k="Budget" v={formatAmount(data.investmentAmount)} />
        <SummaryRow k="Timeline" v={timelineRange(data.timeline)} />
        <SummaryRow k="Family" v={familySummary(data.familyMembers)} />
        <SummaryRow k="US citizen" v={data.isUsCitizen ? "Yes" : "No"} />
      </div>

      {/* Account form */}
      <div className="flex flex-col gap-3">
        <Field label="Full Name">
          <input
            type="text"
            value={data.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your legal name"
            style={inputStyle}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={data.email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={inputStyle}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={data.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-1.5 text-xs"
      style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}
    >
      <span style={{ color: "#8f9095" }}>{k}</span>
      <span className="text-right font-semibold" style={{ color: "#dfe2eb" }}>
        {v}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[10px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "#8f9095" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
