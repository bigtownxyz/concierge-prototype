"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PROGRAMS, type Program } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  submitApplicationSignup,
  persistAuthedApplication,
  logEnquiryToCrm,
} from "@/lib/concierge-apply-signup";
import {
  COUNTRIES,
  CONSTRAINT_OPTIONS,
  TIMELINE_OPTIONS,
  SLIDER_MIN,
  SLIDER_MAX,
  SLIDER_STEP,
  SLIDER_TICKS,
  formatAmount,
  formatTickLabel,
  FamilyMembersField,
  CitizenshipSelector,
  FormInput,
  inputStyle,
  type Timeline,
  type FamilyMember,
} from "./QualifyModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApplyForProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Programme slugs the user arrived with (typically the page they clicked from) */
  initialProgrammes?: string[];
  /** Pre-fill for a returning, already-qualified user (saved profile + qualification). */
  initialData?: Partial<ApplyFormData>;
  /**
   * Optional override. When provided (e.g. the internal preview route) it is
   * called instead of the real signup pipeline. In production this is omitted
   * and the modal runs submitApplicationSignup itself.
   */
  onSubmit?: (data: ApplyFormData) => Promise<void> | void;
}

export interface ApplyFormData {
  // Step 1
  selectedProgrammes: string[];
  // Step 2
  investmentAmount: number;
  // Step 3 — Profile
  timeline: Timeline | "";
  familyMembers: FamilyMember[];
  isUsCitizen: boolean | null;
  consideringRenouncing: boolean | null;
  // Step 4 — Contact
  name: string;
  email: string;
  phone: string;
  country: string;
  nationality: string;
  situation: string;
  constraints: string[];
  constraintDetail: string;
  // Step 5 — Sign up
  password: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_COUNT = 5;
const STEP_DURATIONS = ["~30 sec", "~1 min", "~2 min", "~2 min", "~1 min"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function programmeFromSlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

function programmeMinDisplay(p: Program): string {
  if (p.minInvestment === 0) return "No minimum";
  const sym = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : `${p.currency} `;
  if (p.minInvestment >= 1_000_000) {
    return `${sym}${(p.minInvestment / 1_000_000).toFixed(p.minInvestment % 1_000_000 === 0 ? 0 : 1)}M`;
  }
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
    return p ? `Enquiring about ${p.country}` : "Enquiring about 1 programme";
  }
  if (slugs.length === 2) {
    const first = programmeFromSlug(slugs[0]);
    return first ? `Enquiring about ${first.country} + 1` : "Enquiring about 2 programmes";
  }
  return `Enquiring about ${slugs.length} programmes`;
}

function timelineLabelWithRange(t: Timeline | ""): string {
  const opt = TIMELINE_OPTIONS.find((o) => o.id === t);
  if (!opt) return "Not set";
  const m = opt.desc.match(/^([^—-]+)/);
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

// ─── Empty state ──────────────────────────────────────────────────────────────

const EMPTY: ApplyFormData = {
  selectedProgrammes: [],
  investmentAmount: 500_000,
  timeline: "",
  familyMembers: [],
  isUsCitizen: null,
  consideringRenouncing: null,
  name: "",
  email: "",
  phone: "",
  country: "",
  nationality: "",
  situation: "",
  constraints: [],
  constraintDetail: "",
  password: "",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function ApplyForProgrammeModal({
  isOpen,
  onClose,
  initialProgrammes = [],
  initialData,
  onSubmit,
}: ApplyForProgrammeModalProps) {
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplyFormData>({
    ...EMPTY,
    ...initialData,
    selectedProgrammes:
      initialProgrammes.length > 0
        ? initialProgrammes
        : initialData?.selectedProgrammes ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  // Returning signed-in users skip account creation entirely.
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const isAuthed = authedEmail !== null;

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const supabase = createClient();

    async function loadAuthAndPrefill() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user ?? null;
      if (!active) return;
      setAuthedEmail(user?.email ?? null);

      // Reset transient UI before applying any prefill.
      setStep(1);
      setError(null);
      setConfirmEmail(false);

      // Caller-provided initialData wins — entry points like program-detail
      // already pre-load and pass it. For all the no-context entry points
      // (programs grid, navbar Apply, landing hero, /application "Explore
      // more programmes"), fetch the authed user's saved profile + previous
      // enquiry here so they don't refill the same fields they already gave us.
      if (initialData || !user) {
        setData((prev) => ({
          ...prev,
          ...initialData,
          selectedProgrammes:
            initialProgrammes.length > 0
              ? initialProgrammes
              : initialData?.selectedProgrammes ?? prev.selectedProgrammes,
        }));
        return;
      }

      const [{ data: profile }, { data: qual }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, phone, country, nationality")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("qualifications")
          .select(
            "id, investment_amount, timeline, family_members, is_us_citizen, considering_renouncing, constraints, constraint_detail, situation"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      let existingSlugs: string[] = [];
      if (qual) {
        const { data: progs } = await supabase
          .from("qualification_programs")
          .select("program_slug")
          .eq("qualification_id", qual.id);
        existingSlugs = (progs ?? []).map(
          (r: { program_slug: string }) => r.program_slug
        );
      }

      if (!active) return;

      setData((prev) => ({
        ...prev,
        investmentAmount: qual?.investment_amount ?? prev.investmentAmount,
        timeline: (qual?.timeline as ApplyFormData["timeline"]) ?? prev.timeline,
        familyMembers: Array.isArray(qual?.family_members)
          ? qual!.family_members
          : prev.familyMembers,
        isUsCitizen: qual?.is_us_citizen ?? prev.isUsCitizen,
        consideringRenouncing:
          qual?.considering_renouncing ?? prev.consideringRenouncing,
        constraints: qual?.constraints ?? prev.constraints,
        constraintDetail: qual?.constraint_detail ?? prev.constraintDetail,
        situation: qual?.situation ?? prev.situation,
        name: profile?.full_name ?? prev.name,
        email: profile?.email ?? user.email ?? prev.email,
        phone: profile?.phone ?? prev.phone,
        country: profile?.country ?? prev.country,
        nationality: profile?.nationality ?? prev.nationality,
        selectedProgrammes: Array.from(
          new Set([...initialProgrammes, ...existingSlugs])
        ),
      }));
    }

    loadAuthAndPrefill();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialProgrammes, initialData]);

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
        if (data.timeline === "") return false;
        if (data.isUsCitizen === null) return false;
        if (data.isUsCitizen === true && data.consideringRenouncing === null) return false;
        return true;
      case 4:
        return (
          data.name.trim().length > 0 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
          data.country.trim().length > 0 &&
          data.nationality.trim().length > 0 &&
          data.situation.trim().length > 0
        );
      case 5:
        return isAuthed || data.password.length >= 8;
      default:
        return false;
    }
  }, [step, data, isAuthed]);

  const handleNext = async () => {
    if (!canContinue) return;
    if (step < STEP_COUNT) {
      // Leaving the contact step (4 → 5): log the lead to the CRM now, before
      // the account gate, so an abandoner is still captured. Mirrors the
      // QualifyModal step-4 POST. Skipped for the preview-override route.
      if (step === 4 && !onSubmit) {
        void logEnquiryToCrm(data);
      }
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (onSubmit) {
        await onSubmit(data);
        return;
      }
      const result = isAuthed
        ? await persistAuthedApplication({ data })
        : await submitApplicationSignup({
            data,
            locale,
            password: data.password,
          });
      switch (result.status) {
        case "session":
          router.push("/application");
          router.refresh();
          return;
        case "confirm-email":
          setConfirmEmail(true);
          return;
        case "existing-account":
          setError(
            "An account already exists for this email. Sign in to add this to your enquiry."
          );
          return;
        case "error":
          setError(result.message);
          return;
      }
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
    return "Submit enquiry";
  }, [step]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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

          <motion.div
            key="apply-modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Enquire about a programme"
              className="pointer-events-auto w-full max-w-[600px] max-h-[92vh] overflow-y-auto rounded-2xl"
              style={{
                background: "#1c2026",
                border: "1px solid rgba(69,71,75,0.25)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Header step={step} slugs={data.selectedProgrammes} onClose={onClose} />

              {confirmEmail ? (
                <ConfirmEmailPanel email={data.email} onClose={onClose} />
              ) : (
                <>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
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
                    <StepProfile
                      timeline={data.timeline}
                      familyMembers={data.familyMembers}
                      isUsCitizen={data.isUsCitizen}
                      consideringRenouncing={data.consideringRenouncing}
                      onTimelineChange={(t) => setField("timeline", t)}
                      onFamilyMembersChange={(m) => setField("familyMembers", m)}
                      onUsCitizenChange={(b) => {
                        setField("isUsCitizen", b);
                        if (!b) setField("consideringRenouncing", null);
                      }}
                      onRenouncingChange={(b) => setField("consideringRenouncing", b)}
                    />
                  )}
                  {step === 4 && (
                    <StepContact
                      data={data}
                      onChange={(key, value) =>
                        setField(key as keyof ApplyFormData, value as never)
                      }
                      constraints={data.constraints}
                      onConstraintsToggle={(v) => {
                        const next = data.constraints.includes(v)
                          ? data.constraints.filter((x) => x !== v)
                          : [...data.constraints, v];
                        setField("constraints", next);
                      }}
                      constraintDetail={data.constraintDetail}
                      onConstraintDetailChange={(v) => setField("constraintDetail", v)}
                    />
                  )}
                  {step === 5 && (
                    <StepConfirm
                      data={data}
                      onPasswordChange={(v) => setField("password", v)}
                      authedEmail={authedEmail}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

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
                  {!isAuthed && (
                    <>
                      <br />
                      Already have an account?{" "}
                      <a href="/login" style={{ color: "#bbc4f7", textDecoration: "none" }}>
                        Sign in
                      </a>
                    </>
                  )}
                </p>
              )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Confirm-email panel ──────────────────────────────────────────────────────

function ConfirmEmailPanel({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="px-7 pt-8 pb-9 flex flex-col items-center text-center gap-5">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "rgba(187,196,247,0.08)", border: "1px solid rgba(187,196,247,0.2)" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#bbc4f7" }}>
          mark_email_unread
        </span>
      </div>
      <div>
        <h3 className="text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Confirm your email
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          Your enquiry is saved. We&apos;ve sent a confirmation link to{" "}
          <span style={{ color: "#c6c6cb", fontWeight: 600 }}>{email}</span>. Open it to activate
          your account and view the programmes you&apos;re interested in.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl px-6 py-3 text-sm font-semibold transition-all"
        style={{ background: "#bbc4f7", color: "#242d58" }}
      >
        Got it
      </button>
      <p className="text-[11px]" style={{ color: "#8f9095" }}>
        Didn&apos;t get it? Check spam, or{" "}
        <a href="/login" style={{ color: "#bbc4f7", textDecoration: "none" }}>
          sign in
        </a>{" "}
        once confirmed.
      </p>
    </div>
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

      <div className="flex gap-1">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-sm"
            style={{
              background: i < step ? "#bbc4f7" : "rgba(187,196,247,0.12)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

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
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Your Enquiry
        </p>
        <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Programmes you&apos;re interested in
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
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
                    style={{ background: "transparent", border: 0, color: "#dfe2eb", fontFamily: "inherit" }}
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-wide"
                      style={{ background: "rgba(187,196,247,0.12)", color: "#bbc4f7" }}
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
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Target Deployment
        </p>
        <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Estimated budget
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          Indicate your anticipated investment threshold. Your advisor will use this to guide your options.
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
            <span key={t}>{formatTickLabel(t)}</span>
          ))}
        </div>
      </div>

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

// ─── Step 3 — Profile (Timeline + Family + US + Renouncing) ──────────────────

function StepProfile({
  timeline,
  familyMembers,
  isUsCitizen,
  consideringRenouncing,
  onTimelineChange,
  onFamilyMembersChange,
  onUsCitizenChange,
  onRenouncingChange,
}: {
  timeline: Timeline | "";
  familyMembers: FamilyMember[];
  isUsCitizen: boolean | null;
  consideringRenouncing: boolean | null;
  onTimelineChange: (t: Timeline) => void;
  onFamilyMembersChange: (m: FamilyMember[]) => void;
  onUsCitizenChange: (b: boolean) => void;
  onRenouncingChange: (b: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Your Profile
        </p>
        <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Tell us about your situation
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          This helps your advisor prepare for your consultation.
        </p>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          Preferred Timeline
        </p>
        <p className="text-sm mb-4" style={{ color: "#8f9095" }}>
          Select the window that aligns with your objectives.
        </p>
        <div className="flex flex-col gap-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTimelineChange(opt.id)}
              className="flex items-center justify-between rounded-xl px-5 py-4 text-left transition-all duration-200"
              style={{
                background: timeline === opt.id ? "rgba(187,196,247,0.08)" : "#0a0e14",
                border:
                  timeline === opt.id
                    ? "1px solid rgba(187,196,247,0.4)"
                    : "1px solid rgba(69,71,75,0.3)",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8f9095" }}>
                  {opt.desc}
                </p>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border:
                    timeline === opt.id
                      ? "2px solid #bbc4f7"
                      : "2px solid rgba(69,71,75,0.5)",
                  background: timeline === opt.id ? "#bbc4f7" : "transparent",
                }}
              >
                {timeline === opt.id && (
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#242d58" }}>
                    check
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Family */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          Family Members
        </p>
        <p className="text-sm mb-3" style={{ color: "#8f9095" }}>
          Add anyone who would be included alongside you. Their nationality and age affect programme eligibility.
        </p>
        <FamilyMembersField members={familyMembers} onChange={onFamilyMembersChange} />
      </div>

      {/* US Citizen */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          US Citizenship
        </p>
        <p className="text-sm mb-3" style={{ color: "#8f9095" }}>
          Are you a US citizen or permanent resident?
        </p>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => onUsCitizenChange(val)}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all"
              style={{
                background: isUsCitizen === val ? "rgba(187,196,247,0.1)" : "#0a0e14",
                border:
                  isUsCitizen === val
                    ? "1px solid rgba(187,196,247,0.4)"
                    : "1px solid rgba(69,71,75,0.3)",
                color: isUsCitizen === val ? "#bbc4f7" : "#8f9095",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {val ? "Yes" : "No"}
            </button>
          ))}
        </div>
        {isUsCitizen === true && (
          <div className="mt-3">
            <p className="text-sm mb-3" style={{ color: "#8f9095" }}>
              Are you considering renouncing US citizenship?
            </p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => onRenouncingChange(val)}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all"
                  style={{
                    background: consideringRenouncing === val ? "rgba(187,196,247,0.1)" : "#0a0e14",
                    border:
                      consideringRenouncing === val
                        ? "1px solid rgba(187,196,247,0.4)"
                        : "1px solid rgba(69,71,75,0.3)",
                    color: consideringRenouncing === val ? "#bbc4f7" : "#8f9095",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 — Contact ─────────────────────────────────────────────────────────

function StepContact({
  data,
  onChange,
  constraints,
  onConstraintsToggle,
  constraintDetail,
  onConstraintDetailChange,
}: {
  data: Pick<ApplyFormData, "name" | "email" | "phone" | "country" | "nationality" | "situation">;
  onChange: <K extends keyof ApplyFormData>(key: K, value: string) => void;
  constraints: string[];
  onConstraintsToggle: (v: string) => void;
  constraintDetail: string;
  onConstraintDetailChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Contact Details
        </p>
        <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          Personal particulars
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          All information is held in strict confidence. No third parties. No spam.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Full Name *"
          value={data.name}
          onChange={(v) => onChange("name", v)}
          placeholder="Your legal name"
        />
        <FormInput
          label="Email Address *"
          type="email"
          value={data.email}
          onChange={(v) => onChange("email", v)}
          placeholder="you@domain.com"
        />
        <FormInput
          label="Phone / WhatsApp"
          type="tel"
          value={data.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="+1 555 000 0000"
        />
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase"
            style={{ color: "#8f9095", letterSpacing: "0.04em" }}
          >
            Country of Residence *
          </label>
          <select
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238f9095' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              paddingRight: "2.5rem",
            }}
          >
            <option value="" style={{ background: "#0a0e14" }}>
              Select country...
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} style={{ background: "#0a0e14" }}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase"
            style={{ color: "#8f9095", letterSpacing: "0.04em" }}
          >
            Current Citizenships *{" "}
            <span className="normal-case font-normal">(search and select)</span>
          </label>
          <CitizenshipSelector
            value={data.nationality}
            onChange={(v) => onChange("nationality", v)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase"
          style={{ color: "#8f9095", letterSpacing: "0.04em" }}
        >
          Tell us a bit about your situation *
        </label>
        <textarea
          rows={4}
          value={data.situation}
          placeholder="Share any relevant context — existing structures, specific concerns, what's prompting this move..."
          onChange={(e) => onChange("situation", e.target.value)}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "6rem",
          }}
        />
      </div>

      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          Any constraints we should know about?
        </p>
        <p className="text-sm mb-3" style={{ color: "#8f9095" }}>
          Select any that apply so we can account for them.
        </p>
        <div className="flex flex-col gap-2">
          {CONSTRAINT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onConstraintsToggle(opt)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all"
              style={{
                background: constraints.includes(opt)
                  ? "rgba(187,196,247,0.06)"
                  : "rgba(10,14,20,0.6)",
                border: constraints.includes(opt)
                  ? "1px solid rgba(187,196,247,0.3)"
                  : "1px solid rgba(69,71,75,0.2)",
                color: "#c6c6cb",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  border: constraints.includes(opt)
                    ? "2px solid #bbc4f7"
                    : "2px solid rgba(69,71,75,0.5)",
                  background: constraints.includes(opt) ? "#bbc4f7" : "transparent",
                }}
              >
                {constraints.includes(opt) && (
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#242d58" }}>
                    check
                  </span>
                )}
              </div>
              {opt}
            </button>
          ))}
        </div>
        {constraints.length > 0 && (
          <textarea
            rows={3}
            value={constraintDetail}
            placeholder="Please share more detail about your constraints..."
            onChange={(e) => onConstraintDetailChange(e.target.value)}
            className="mt-3 w-full"
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "4.5rem",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step 5 — Confirm + Sign up ───────────────────────────────────────────────

function StepConfirm({
  data,
  onPasswordChange,
  authedEmail,
}: {
  data: ApplyFormData;
  onPasswordChange: (v: string) => void;
  authedEmail: string | null;
}) {
  const programmes = useMemo(
    () => data.selectedProgrammes.map(programmeFromSlug).filter((p): p is Program => !!p),
    [data.selectedProgrammes]
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Almost done
        </p>
        <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "#dfe2eb", letterSpacing: "-0.015em" }}>
          {authedEmail ? "Confirm & submit" : "Confirm & create account"}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          {authedEmail
            ? "Review your enquiry below, then send it to your advisor."
            : "One last step. Set a password to save your enquiry and connect with your advisor."}
        </p>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: "#0a0e14", border: "1px solid rgba(69,71,75,0.3)" }}
      >
        <p
          className="mb-3 text-[10px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "#8f9095" }}
        >
          Your enquiry
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
        <SummaryRow k="Timeline" v={timelineLabelWithRange(data.timeline)} />
        <SummaryRow k="Family" v={familySummary(data.familyMembers)} />
        <SummaryRow
          k="US citizen"
          v={
            data.isUsCitizen
              ? data.consideringRenouncing
                ? "Yes · considering renouncing"
                : "Yes"
              : "No"
          }
        />
        <SummaryRow k="Resides in" v={data.country || "—"} />
        <SummaryRow
          k="Citizenship"
          v={data.nationality.split(",").map((s) => s.trim()).filter(Boolean).join(", ") || "—"}
        />
        <SummaryRow k="Name" v={data.name || "—"} />
        <SummaryRow k="Email" v={data.email || "—"} />
      </div>

      {authedEmail ? (
        <div
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs"
          style={{
            background: "rgba(187,196,247,0.05)",
            border: "1px solid rgba(187,196,247,0.12)",
            color: "#c6c6cb",
          }}
        >
          <span
            className="material-symbols-outlined flex-shrink-0"
            style={{ fontSize: 16, color: "#bbc4f7" }}
          >
            verified_user
          </span>
          <span>
            Signed in as{" "}
            <span style={{ color: "#dfe2eb", fontWeight: 600 }}>{authedEmail}</span>. This will be
            added to your enquiry.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase"
            style={{ color: "#8f9095", letterSpacing: "0.04em" }}
          >
            Create Password *
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            style={inputStyle}
          />
          <p className="mt-1 text-[11px]" style={{ color: "#8f9095" }}>
            You&apos;ll use this with your email above to sign in afterwards.
          </p>
        </div>
      )}
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
