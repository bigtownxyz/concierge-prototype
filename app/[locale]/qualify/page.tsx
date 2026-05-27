"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ShaderBackground } from "@/components/ui/shaders-hero-section";
import {
  CitizenshipSelector,
  CONSTRAINT_OPTIONS,
  COUNTRIES,
  FamilyMembersField,
  FormInput,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  SLIDER_TICKS,
  TIMELINE_OPTIONS,
  formatAmount,
  formatTickLabel,
  inputStyle,
} from "@/components/shared/QualifyModal";
import {
  AUTO_SELECT_TOP_N,
  DRAFT_KEY,
  EMPTY_FORM,
  STRATEGY_OPTIONS,
  type QualifyFormData,
  type StrategicFocus,
  type Timeline,
  markLcSignup,
  pushQualificationToLcCrm,
  rankPrograms,
  saveQualificationToDb,
} from "@/lib/concierge-qualify-engine";

type Phase =
  | "welcome"
  | "focus"
  | "budget"
  | "profile"
  | "contact"
  | "calculating"
  | "signup"
  | "success";

const FORM_PHASES: Phase[] = ["focus", "budget", "profile", "contact"];
const STEP_LABELS = ["Focus", "Budget", "Profile", "Contact"];

const SERIF_ITALIC = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.02em",
};

const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
} as const;

export default function QualifyPage() {
  const { user } = useUser();
  const router = useRouter();
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>("welcome");
  const [formData, setFormData] = useState<QualifyFormData>({ ...EMPTY_FORM });
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [signupInfo, setSignupInfo] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<QualifyFormData>;
        setFormData((prev) => ({ ...prev, ...draft }));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // Ignore storage errors
    }
  }, [formData, hydrated]);

  useEffect(() => {
    if (phase === "signup") {
      setSignupName((prev) => prev || formData.name);
      setSignupEmail((prev) => prev || formData.email);
    }
  }, [phase, formData.name, formData.email]);

  const rankedPrograms = useMemo(() => rankPrograms(formData), [formData]);

  const canAdvance = useMemo(() => {
    if (phase === "focus") return formData.strategicFocus.length > 0;
    if (phase === "budget") return true;
    if (phase === "profile")
      return formData.timeline !== "" && formData.isUsCitizen !== null;
    if (phase === "contact")
      return (
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.country.trim() !== "" &&
        formData.nationality.trim() !== "" &&
        formData.situation.trim() !== ""
      );
    return true;
  }, [phase, formData]);

  const toggleFocus = useCallback((id: StrategicFocus) => {
    setFormData((prev) => ({
      ...prev,
      strategicFocus: prev.strategicFocus.includes(id)
        ? prev.strategicFocus.filter((f) => f !== id)
        : [...prev.strategicFocus, id],
    }));
  }, []);

  const toggleConstraint = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(id)
        ? prev.constraints.filter((c) => c !== id)
        : [...prev.constraints, id],
    }));
  }, []);

  const updateField = useCallback(
    <K extends keyof QualifyFormData>(key: K, value: QualifyFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const stepIndex = FORM_PHASES.indexOf(phase as Phase);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / FORM_PHASES.length) * 100 : 0;

  const handleBack = () => {
    if (phase === "focus") setPhase("welcome");
    else if (phase === "budget") setPhase("focus");
    else if (phase === "profile") setPhase("budget");
    else if (phase === "contact") setPhase("profile");
  };

  const submitForm = useCallback(async () => {
    setSaveError("");

    const autoSelected = rankedPrograms
      .slice(0, AUTO_SELECT_TOP_N)
      .map((r) => r.program.slug);
    const finalFormData: QualifyFormData = {
      ...formData,
      selectedPrograms:
        formData.selectedPrograms.length > 0
          ? formData.selectedPrograms
          : autoSelected,
    };
    setFormData(finalFormData);

    setPhase("calculating");
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1600));

    pushQualificationToLcCrm(finalFormData, rankedPrograms, !!user, user?.id);

    if (user) {
      try {
        await Promise.all([
          saveQualificationToDb(finalFormData, rankedPrograms, user.id),
          minDelay,
        ]);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* noop */
        }
        setPhase("success");
        setTimeout(() => router.push("/results"), 1400);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to save. Please try again."
        );
        setPhase("contact");
      }
    } else {
      await minDelay;
      setPhase("signup");
    }
  }, [formData, rankedPrograms, user, router]);

  const handleNext = () => {
    if (phase === "focus") setPhase("budget");
    else if (phase === "budget") setPhase("profile");
    else if (phase === "profile") setPhase("contact");
    else if (phase === "contact") void submitForm();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSignupInfo("");
    if (!signupName.trim() || !signupEmail.trim() || signupPassword.length < 8) {
      setSaveError(
        "Please fill in all fields. Password must be at least 8 characters."
      );
      return;
    }

    setSignupLoading(true);
    try {
      const supabase = createClient();
      const callbackPath = `/${locale}/callback?next=${encodeURIComponent(
        `/${locale}/results`
      )}`;
      const programScores: Record<string, number> = {};
      for (const r of rankedPrograms) programScores[r.program.slug] = r.score;
      const pendingQualification = {
        formData,
        programScores,
        savedAt: new Date().toISOString(),
      };

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            pending_qualification: pendingQualification,
          },
          emailRedirectTo: `${window.location.origin}${callbackPath}`,
        },
      });

      if (error) {
        setSaveError(error.message);
        setSignupLoading(false);
        return;
      }

      const isExistingEmail =
        !!signUpData.user &&
        Array.isArray(signUpData.user.identities) &&
        signUpData.user.identities.length === 0;
      if (isExistingEmail) {
        setSaveError(
          "An account already exists for this email. Sign in to view your results."
        );
        setSignupLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });
      if (signInError) {
        const msg = signInError.message?.toLowerCase() ?? "";
        if (msg.includes("email not confirmed") || msg.includes("confirm")) {
          setSignupInfo(
            "Account created. Check your email to confirm, then log in to see your results."
          );
        } else if (msg.includes("invalid login")) {
          setSaveError(
            "An account already exists for this email. Sign in to view your results."
          );
        } else {
          setSaveError(signInError.message);
        }
        setSignupLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 1200));

      setPhase("calculating");
      try {
        const finalData = { ...formData, name: signupName, email: signupEmail };
        setFormData(finalData);
        await saveQualificationToDb(finalData, rankedPrograms);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* noop */
        }
        try {
          await supabase.auth.updateUser({ data: { pending_qualification: null } });
          const { data } = await supabase.auth.getUser();
          if (data.user) markLcSignup(signupEmail, data.user.id);
        } catch {
          /* noop — callback path will self-heal */
        }
        setPhase("success");
        setTimeout(() => router.push("/results"), 1400);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to save after account creation."
        );
        setPhase("signup");
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Unable to create your account right now."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0D0D1A", color: "#dfe2eb", ...DISPLAY_FONT }}
    >
      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeScreen onBegin={() => setPhase("focus")} />
          </motion.div>
        )}

        {(phase === "focus" ||
          phase === "budget" ||
          phase === "profile" ||
          phase === "contact") && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex min-h-screen flex-col"
          >
            <FormHeader
              stepIndex={stepIndex}
              progress={progress}
              onExit={() => router.push("/")}
            />

            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-32 pt-12 sm:pt-16 lg:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {phase === "focus" && (
                    <FocusStep
                      selected={formData.strategicFocus}
                      onToggle={toggleFocus}
                    />
                  )}
                  {phase === "budget" && (
                    <BudgetStep
                      amount={formData.investmentAmount}
                      onChange={(v) => updateField("investmentAmount", v)}
                    />
                  )}
                  {phase === "profile" && (
                    <ProfileStep
                      timeline={formData.timeline}
                      onTimelineChange={(v) => updateField("timeline", v)}
                      familyMembers={formData.familyMembers}
                      onFamilyMembersChange={(v) =>
                        updateField("familyMembers", v)
                      }
                      isUsCitizen={formData.isUsCitizen}
                      onUsCitizenChange={(v) => updateField("isUsCitizen", v)}
                      consideringRenouncing={formData.consideringRenouncing}
                      onRenouncingChange={(v) =>
                        updateField("consideringRenouncing", v)
                      }
                    />
                  )}
                  {phase === "contact" && (
                    <ContactStep
                      data={formData}
                      onFieldChange={updateField}
                      constraints={formData.constraints}
                      onToggleConstraint={toggleConstraint}
                      constraintDetail={formData.constraintDetail}
                      onConstraintDetailChange={(v) =>
                        updateField("constraintDetail", v)
                      }
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {saveError && (
                <div
                  className="mt-6 rounded-xl border px-4 py-3 text-sm"
                  style={{
                    background: "rgba(184,92,107,0.08)",
                    borderColor: "rgba(184,92,107,0.3)",
                    color: "#e8a4ad",
                  }}
                >
                  {saveError}
                </div>
              )}
            </main>

            <FormFooter
              onBack={handleBack}
              onNext={handleNext}
              canAdvance={canAdvance}
              isFinal={phase === "contact"}
            />
          </motion.div>
        )}

        {phase === "calculating" && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen items-center justify-center px-6"
          >
            <Pulse heading="Calculating your matches" sub="Scoring active programmes against your profile..." />
          </motion.div>
        )}

        {phase === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-screen flex-col"
          >
            <FormHeader stepIndex={3} progress={100} onExit={() => router.push("/")} />
            <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-12">
              <SignupForm
                name={signupName}
                email={signupEmail}
                password={signupPassword}
                onNameChange={setSignupName}
                onEmailChange={setSignupEmail}
                onPasswordChange={setSignupPassword}
                onSubmit={handleSignup}
                loading={signupLoading}
                info={signupInfo}
                error={saveError}
              />
            </main>
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-screen items-center justify-center px-6"
          >
            <SuccessScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <ShaderBackground>
      <main className="relative z-20 flex min-h-screen flex-col items-center justify-between px-6 py-10 sm:py-12">
        <div className="flex w-full max-w-6xl items-center justify-start">
          <Image
            src="/logo.svg"
            alt="Concierge"
            width={958}
            height={160}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bbc4f7]/20 bg-[#23233A]/70 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7]"
          >
            <span className="h-2 w-2 rounded-full bg-[#bbc4f7]" />
            Discovery
          </div>

          <h1
            className="text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] tracking-[-0.025em] text-[#f1f2f6]"
            style={DISPLAY_FONT}
          >
            Find your <span style={SERIF_ITALIC}>route.</span>
          </h1>

          <p
            className="mt-7 max-w-xl text-[clamp(1rem,1.4vw,1.15rem)] leading-relaxed text-[#c6c6cb]"
            style={DISPLAY_FONT}
          >
            A short conversation that maps your goals to the world&apos;s most
            aligned citizenship and residency programmes. All in strict
            confidence.
          </p>

          <button
            type="button"
            onClick={onBegin}
            className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-full px-9 text-sm font-semibold tracking-[0.02em] transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "#bbc4f7",
              color: "#242d58",
              boxShadow: "0 20px 60px rgba(187,196,247,0.25)",
            }}
          >
            Begin the assessment
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </button>

          <dl className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.7rem] uppercase tracking-[0.18em] text-[#8f9095]">
            <div className="flex items-center gap-2">
              <span className="text-[#bbc4f7]">25+</span>
              <span>jurisdictions</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-[#45474b]" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="text-[#bbc4f7]">4</span>
              <span>questions</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-[#45474b]" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="text-[#bbc4f7]">~2</span>
              <span>minutes</span>
            </div>
          </dl>
        </div>

        <p
          className="max-w-md text-center text-[0.7rem] uppercase tracking-[0.2em] text-[#6c6e74]"
          style={DISPLAY_FONT}
        >
          All information held in strict confidence. No third parties. No spam.
        </p>
      </main>
    </ShaderBackground>
  );
}

// ─── Header + Footer ─────────────────────────────────────────────────────────

function FormHeader({
  stepIndex,
  progress,
  onExit,
}: {
  stepIndex: number;
  progress: number;
  onExit: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        background: "rgba(13,13,26,0.85)",
        borderColor: "rgba(69,71,75,0.25)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Image
          src="/logo.svg"
          alt="Concierge"
          width={958}
          height={160}
          className="h-7 w-auto"
          priority
        />

        <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
          {STEP_LABELS.map((label, i) => {
            const reached = i <= stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-colors"
                  style={{
                    background: reached ? "#bbc4f7" : "transparent",
                    color: reached ? "#242d58" : "#6c6e74",
                    border: reached ? "none" : "1px solid rgba(108,110,116,0.4)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[11px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: isCurrent ? "#dfe2eb" : "#6c6e74" }}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <span
                    className="ml-1 h-px w-6"
                    style={{
                      background:
                        i < stepIndex ? "#bbc4f7" : "rgba(108,110,116,0.3)",
                    }}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors hover:text-[#dfe2eb]"
          style={{ color: "#8f9095" }}
        >
          Exit
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            close
          </span>
        </button>
      </div>

      {/* Mobile progress bar */}
      <div className="h-px w-full sm:hidden" style={{ background: "rgba(108,110,116,0.2)" }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: "#bbc4f7" }}
        />
      </div>
    </header>
  );
}

function FormFooter({
  onBack,
  onNext,
  canAdvance,
  isFinal,
}: {
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  isFinal: boolean;
}) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-md"
      style={{
        background: "rgba(13,13,26,0.92)",
        borderColor: "rgba(69,71,75,0.25)",
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors hover:text-[#dfe2eb]"
          style={{
            color: "#8f9095",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{
            background: "#bbc4f7",
            color: "#242d58",
            boxShadow: canAdvance ? "0 12px 40px rgba(187,196,247,0.2)" : "none",
          }}
        >
          {isFinal ? "Reveal my matches" : "Continue"}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </button>
      </div>
    </footer>
  );
}

// ─── Step blocks ─────────────────────────────────────────────────────────────

function StepHeading({
  eyebrow,
  title,
  serif,
  description,
}: {
  eyebrow: string;
  title: string;
  serif?: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <p
        className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "#bbc4f7" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-4 text-[clamp(1.85rem,3.4vw,2.65rem)] leading-tight tracking-[-0.02em] text-[#f1f2f6]"
        style={DISPLAY_FONT}
      >
        {title}
        {serif && (
          <>
            {" "}
            <span style={SERIF_ITALIC}>{serif}</span>
          </>
        )}
      </h2>
      <p
        className="mt-3 text-[0.95rem] leading-relaxed"
        style={{ color: "#8f9095" }}
      >
        {description}
      </p>
    </div>
  );
}

function FocusStep({
  selected,
  onToggle,
}: {
  selected: StrategicFocus[];
  onToggle: (id: StrategicFocus) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Strategic Focus"
        title="What are you"
        serif="optimising for?"
        description="Pick anything that applies — this shapes which programmes we surface first."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STRATEGY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className="group relative flex flex-col gap-4 rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: isSelected ? "rgba(187,196,247,0.06)" : "#13131f",
                border: isSelected
                  ? "1px solid rgba(187,196,247,0.5)"
                  : "1px solid rgba(69,71,75,0.35)",
                boxShadow: isSelected
                  ? "0 20px 60px rgba(187,196,247,0.1)"
                  : "none",
              }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 26,
                    color: isSelected ? "#bbc4f7" : "#8f9095",
                  }}
                >
                  {opt.icon}
                </span>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: isSelected ? "#bbc4f7" : "transparent",
                    border: isSelected
                      ? "2px solid #bbc4f7"
                      : "2px solid rgba(108,110,116,0.5)",
                  }}
                >
                  {isSelected && (
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 13,
                        color: "#242d58",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      check
                    </span>
                  )}
                </span>
              </div>
              <div>
                <p
                  className="text-base font-semibold"
                  style={{ color: isSelected ? "#f1f2f6" : "#dfe2eb" }}
                >
                  {opt.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BudgetStep({
  amount,
  onChange,
}: {
  amount: number;
  onChange: (v: number) => void;
}) {
  const pct = ((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const tier =
    amount < 200_000
      ? "entry-level"
      : amount < 500_000
      ? "standard"
      : amount < 1_000_000
      ? "premium"
      : "elite";
  const jurisdictions = amount < 300_000 ? "3" : amount < 1_000_000 ? "8" : "14";

  return (
    <div>
      <StepHeading
        eyebrow="Target Deployment"
        title="What's your"
        serif="investment threshold?"
        description="Indicative only — we'll refine this together. It just narrows the field."
      />

      <div
        className="rounded-2xl p-8 sm:p-10"
        style={{
          background: "#13131f",
          border: "1px solid rgba(69,71,75,0.35)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8f9095" }}>
            Anticipated investment
          </p>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: "#bbc4f7",
              fontSize: "clamp(3rem, 7vw, 4.5rem)",
              letterSpacing: "-0.035em",
              ...DISPLAY_FONT,
            }}
          >
            {formatAmount(amount)}
          </span>
        </div>

        <div className="relative mt-8 flex flex-col gap-4">
          <div
            className="relative h-1.5 rounded-full"
            style={{ background: "rgba(108,110,116,0.3)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
              style={{ width: `${pct}%`, background: "#bbc4f7" }}
            />
          </div>
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={amount}
            onChange={(e) => onChange(Number(e.target.value))}
            className="qualify-slider absolute inset-0 h-full w-full cursor-pointer opacity-0"
            style={{ margin: 0 }}
            aria-label="Investment amount"
          />
          <div className="flex justify-between">
            {SLIDER_TICKS.map((tick) => (
              <button
                key={tick}
                type="button"
                onClick={() => onChange(tick)}
                className="text-xs transition-colors duration-150"
                style={{
                  color: amount === tick ? "#bbc4f7" : "rgba(143,144,149,0.65)",
                  ...DISPLAY_FONT,
                }}
              >
                {formatTickLabel(tick)}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mt-8 rounded-xl p-5 text-sm leading-relaxed"
          style={{
            background: "rgba(187,196,247,0.05)",
            border: "1px solid rgba(187,196,247,0.12)",
            color: "#c6c6cb",
          }}
        >
          <span style={{ color: "#bbc4f7", fontWeight: 600 }}>
            {formatAmount(amount)}
          </span>{" "}
          unlocks{" "}
          <span style={{ color: "#bbc4f7", fontWeight: 600 }}>{tier}</span>{" "}
          tier programmes across {jurisdictions}+ jurisdictions.
        </div>

        {amount <= 100_000 && (
          <div
            className="mt-3 rounded-xl p-4 text-sm"
            style={{
              background: "rgba(214,195,110,0.08)",
              border: "1px solid rgba(214,195,110,0.25)",
              color: "#d6c36e",
            }}
          >
            Some programmes require higher minimum investments. We&apos;ll help
            identify the best options within your budget during your
            consultation.
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileStep({
  timeline,
  onTimelineChange,
  familyMembers,
  onFamilyMembersChange,
  isUsCitizen,
  onUsCitizenChange,
  consideringRenouncing,
  onRenouncingChange,
}: {
  timeline: Timeline | "";
  onTimelineChange: (v: Timeline) => void;
  familyMembers: QualifyFormData["familyMembers"];
  onFamilyMembersChange: (v: QualifyFormData["familyMembers"]) => void;
  isUsCitizen: boolean | null;
  onUsCitizenChange: (v: boolean) => void;
  consideringRenouncing: boolean | null;
  onRenouncingChange: (v: boolean) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Your Profile"
        title="A bit about your"
        serif="situation."
        description="Timeline and family shape eligibility — this prevents wasted conversation."
      />

      <div className="flex flex-col gap-10">
        <section>
          <SectionLabel>Preferred timeline</SectionLabel>
          <div className="mt-4 flex flex-col gap-2.5">
            {TIMELINE_OPTIONS.map((opt) => {
              const active = timeline === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTimelineChange(opt.id)}
                  className="flex items-center justify-between rounded-xl px-5 py-4 text-left transition-all duration-200"
                  style={{
                    background: active ? "rgba(187,196,247,0.06)" : "#13131f",
                    border: active
                      ? "1px solid rgba(187,196,247,0.45)"
                      : "1px solid rgba(69,71,75,0.35)",
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "#8f9095" }}>
                      {opt.desc}
                    </p>
                  </div>
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      border: active
                        ? "2px solid #bbc4f7"
                        : "2px solid rgba(108,110,116,0.5)",
                      background: active ? "#bbc4f7" : "transparent",
                    }}
                  >
                    {active && (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14, color: "#242d58" }}
                      >
                        check
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionLabel>Family included in the application</SectionLabel>
          <p className="mt-1 text-xs" style={{ color: "#8f9095" }}>
            Add anyone whose nationality and age affect eligibility.
          </p>
          <div className="mt-4">
            <FamilyMembersField
              members={familyMembers}
              onChange={onFamilyMembersChange}
            />
          </div>
        </section>

        <section>
          <SectionLabel>US citizenship</SectionLabel>
          <p className="mt-1 mb-3 text-xs" style={{ color: "#8f9095" }}>
            Are you a US citizen or permanent resident?
          </p>
          <div className="flex gap-3">
            {[true, false].map((val) => {
              const active = isUsCitizen === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => onUsCitizenChange(val)}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: active ? "rgba(187,196,247,0.1)" : "#13131f",
                    border: active
                      ? "1px solid rgba(187,196,247,0.45)"
                      : "1px solid rgba(69,71,75,0.35)",
                    color: active ? "#bbc4f7" : "#8f9095",
                  }}
                >
                  {val ? "Yes" : "No"}
                </button>
              );
            })}
          </div>

          {isUsCitizen === true && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5"
            >
              <p className="mb-3 text-xs" style={{ color: "#8f9095" }}>
                Are you considering renouncing US citizenship?
              </p>
              <div className="flex gap-3">
                {[true, false].map((val) => {
                  const active = consideringRenouncing === val;
                  return (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => onRenouncingChange(val)}
                      className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
                      style={{
                        background: active ? "rgba(187,196,247,0.1)" : "#13131f",
                        border: active
                          ? "1px solid rgba(187,196,247,0.45)"
                          : "1px solid rgba(69,71,75,0.35)",
                        color: active ? "#bbc4f7" : "#8f9095",
                      }}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function ContactStep({
  data,
  onFieldChange,
  constraints,
  onToggleConstraint,
  constraintDetail,
  onConstraintDetailChange,
}: {
  data: QualifyFormData;
  onFieldChange: <K extends keyof QualifyFormData>(
    key: K,
    value: QualifyFormData[K]
  ) => void;
  constraints: string[];
  onToggleConstraint: (id: string) => void;
  constraintDetail: string;
  onConstraintDetailChange: (v: string) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Contact"
        title="How should we"
        serif="reach you?"
        description="Held in strict confidence. No third parties. No spam."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Full Name *"
          value={data.name}
          onChange={(v) => onFieldChange("name", v)}
          placeholder="Your legal name"
        />
        <FormInput
          label="Email Address *"
          type="email"
          value={data.email}
          onChange={(v) => onFieldChange("email", v)}
          placeholder="you@domain.com"
        />
        <FormInput
          label="Phone / WhatsApp"
          type="tel"
          value={data.phone}
          onChange={(v) => onFieldChange("phone", v)}
          placeholder="+1 555 000 0000"
        />
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#8f9095" }}
          >
            Country of Residence *
          </label>
          <select
            value={data.country}
            onChange={(e) => onFieldChange("country", e.target.value)}
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
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#8f9095" }}
          >
            Current Citizenships *{" "}
            <span className="normal-case font-normal">(search and select)</span>
          </label>
          <CitizenshipSelector
            value={data.nationality}
            onChange={(v) => onFieldChange("nationality", v)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#8f9095" }}
        >
          Tell us a bit about your situation *
        </label>
        <textarea
          rows={4}
          value={data.situation}
          placeholder="Share any relevant context — timeline, existing structures, specific concerns..."
          onChange={(e) => onFieldChange("situation", e.target.value)}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "6rem",
          }}
        />
      </div>

      <div
        className="mt-8 pt-6"
        style={{ borderTop: "1px solid rgba(69,71,75,0.25)" }}
      >
        <SectionLabel>Any constraints we should know about?</SectionLabel>
        <p className="mt-1 mb-3 text-sm" style={{ color: "#8f9095" }}>
          Select any that apply so we can account for them.
        </p>
        <div className="flex flex-col gap-2">
          {CONSTRAINT_OPTIONS.map((opt) => {
            const active = constraints.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleConstraint(opt)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all duration-150"
                style={{
                  background: active
                    ? "rgba(187,196,247,0.06)"
                    : "rgba(13,13,26,0.6)",
                  border: active
                    ? "1px solid rgba(187,196,247,0.35)"
                    : "1px solid rgba(69,71,75,0.25)",
                  color: "#c6c6cb",
                }}
              >
                <span
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded"
                  style={{
                    border: active
                      ? "2px solid #bbc4f7"
                      : "2px solid rgba(108,110,116,0.5)",
                    background: active ? "#bbc4f7" : "transparent",
                  }}
                >
                  {active && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12, color: "#242d58" }}
                    >
                      check
                    </span>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
      style={{ color: "#bbc4f7" }}
    >
      {children}
    </p>
  );
}

// ─── Calculating / Success ───────────────────────────────────────────────────

function Pulse({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "rgba(187,196,247,0.08)",
          border: "1px solid rgba(187,196,247,0.25)",
        }}
      >
        <span
          className="material-symbols-outlined animate-spin"
          style={{ fontSize: 36, color: "#bbc4f7" }}
        >
          progress_activity
        </span>
      </div>
      <div>
        <h3
          className="text-[clamp(1.65rem,3vw,2.25rem)] tracking-[-0.02em]"
          style={DISPLAY_FONT}
        >
          {heading}
        </h3>
        <p className="mt-3 text-sm" style={{ color: "#8f9095" }}>
          {sub}
        </p>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "#bbc4f7" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "rgba(187,196,247,0.1)",
          border: "1px solid rgba(187,196,247,0.25)",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 36, color: "#bbc4f7", fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>
      <div>
        <h3
          className="text-[clamp(1.65rem,3vw,2.25rem)] tracking-[-0.02em]"
          style={DISPLAY_FONT}
        >
          Your matches are <span style={SERIF_ITALIC}>ready.</span>
        </h3>
        <p className="mt-3 text-sm" style={{ color: "#8f9095" }}>
          Taking you to your personalised results...
        </p>
      </div>
    </div>
  );
}

// ─── Signup form ─────────────────────────────────────────────────────────────

function SignupForm({
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  info,
  error,
}: {
  name: string;
  email: string;
  password: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  info: string;
  error: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl p-8 sm:p-10"
      style={{
        background: "#13131f",
        border: "1px solid rgba(69,71,75,0.35)",
      }}
    >
      <div className="mb-7 flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo.svg"
          alt="Concierge"
          width={958}
          height={160}
          className="h-7 w-auto"
        />
        <p
          className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#bbc4f7" }}
        >
          One last step
        </p>
        <h3
          className="text-[clamp(1.5rem,2.5vw,2rem)] tracking-[-0.02em]"
          style={DISPLAY_FONT}
        >
          Save your <span style={SERIF_ITALIC}>matches.</span>
        </h3>
        <p className="max-w-md text-sm" style={{ color: "#8f9095" }}>
          Create an account to view your personalised recommendations and
          continue the conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#8f9095" }}
          >
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your legal name"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#8f9095" }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@domain.com"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#8f9095" }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="At least 8 characters"
            style={inputStyle}
          />
        </div>
      </div>

      {info && (
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(187,196,247,0.06)",
            borderColor: "rgba(187,196,247,0.25)",
            color: "#bbc4f7",
          }}
        >
          {info}
        </div>
      )}
      {error && (
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(184,92,107,0.08)",
            borderColor: "rgba(184,92,107,0.3)",
            color: "#e8a4ad",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-7 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        style={{
          background: "#bbc4f7",
          color: "#242d58",
          boxShadow: "0 12px 40px rgba(187,196,247,0.18)",
        }}
      >
        {loading ? "Creating account..." : "Create Account & View Matches"}
      </button>
    </form>
  );
}
