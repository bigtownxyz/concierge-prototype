"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { COUNTRIES, FAMILY_RELATIONS } from "@/components/shared/QualifyModal";

// Relationship options shown in the "additional applicants" picker.
// Mirrors the existing qualify-flow set + Other as a free-text fallback.
const APPLICANT_RELATIONSHIPS: string[] = [
  ...FAMILY_RELATIONS.map((r) => r.label),
  "Domestic partner",
  "Other",
];

// Common platforms shown as quick-add chips on the References step.
// The user can also add free-form rows (e.g. Substack, GitHub, niche forum).
const COMMON_REFERENCE_PLATFORMS = [
  "LinkedIn",
  "Twitter / X",
  "Instagram",
  "Facebook",
  "Personal website",
];

// ─── Validation ──────────────────────────────────────────────────────────────
// Per-step required-field checks. Returns a list of missing-field labels so
// we can render a clear "you still need to fill X, Y, Z" banner. Each step's
// rules are deliberately conservative — block forward navigation if anything
// critical is empty, but leave optional sections (references, net worth)
// alone unless the data is internally inconsistent.

const trimmed = (v: string | null | undefined): string =>
  (typeof v === "string" ? v.trim() : "");

function validateStep(step: number, d: DdSubmission): string[] {
  const errs: string[] = [];
  switch (step) {
    case 1: {
      if (!trimmed(d.first_name)) errs.push("First name");
      if (!trimmed(d.last_name)) errs.push("Last name");
      if (!trimmed(d.country_of_birth)) errs.push("Country of birth");
      if (!trimmed(d.date_of_birth)) errs.push("Date of birth");
      if (d.has_government_birth_certificate === null)
        errs.push("Birth-certificate question");
      if (!trimmed(d.address_street)) errs.push("Street address");
      if (!trimmed(d.address_city)) errs.push("City");
      if (!trimmed(d.address_country)) errs.push("Country");
      if (!trimmed(d.address_postcode)) errs.push("Post / ZIP code");
      if (!trimmed(d.marital_status)) errs.push("Marital status");
      break;
    }
    case 2: {
      if (!trimmed(d.passport_issuing_country))
        errs.push("Passport issuing country");
      if (!trimmed(d.passport_file_path)) errs.push("Passport upload");
      break;
    }
    case 3: {
      if (d.is_sole_applicant === null) errs.push("Sole-applicant question");
      if (d.is_sole_applicant === false) {
        const additional = d.additional_applicants ?? [];
        if (additional.length === 0) {
          errs.push("At least one additional applicant");
        } else {
          const incomplete = additional.some(
            (a) => !trimmed(a.name) || !trimmed(a.relationship)
          );
          if (incomplete)
            errs.push("Name and relationship for every additional applicant");
        }
      }
      break;
    }
    case 4: {
      // References optional — but enforce consistency: if a row has one of
      // platform/url, it must have the other.
      const refs = d.personal_references ?? [];
      const inconsistent = refs.some(
        (r) =>
          (trimmed(r.platform) && !trimmed(r.url)) ||
          (!trimmed(r.platform) && trimmed(r.url))
      );
      if (inconsistent)
        errs.push("References need both a platform name and a URL");
      break;
    }
    case 5: {
      if (!trimmed(d.employment_status)) errs.push("Employment status");
      if (!trimmed(d.funds_source)) errs.push("Source of funds");
      if (!d.investment_method) errs.push("Investment method");
      break;
    }
    case 6:
      // Net worth — all optional; no blocking rules.
      break;
    case 7: {
      if (d.security_visa_denied === null)
        errs.push("Visa / permit / citizenship denial question");
      if (d.security_criminal_investigation === null)
        errs.push("Criminal-investigation question");
      if (d.security_threat === null) errs.push("Security-threat question");
      if (d.security_communicable_disease === null)
        errs.push("Communicable-disease question");
      if (d.security_prior_cbi_application === null)
        errs.push("Prior CBI-application question");
      break;
    }
    case 8: {
      if (!trimmed(d.police_records_notes))
        errs.push(
          "Police-records notes (write “Nothing to disclose” if applicable)"
        );
      break;
    }
  }
  return errs;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdditionalApplicant {
  name: string;
  relationship: string;
}

export interface PersonalReference {
  platform: string;
  url: string;
}

export interface DdSubmission {
  id: string;
  user_id: string;
  // START
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  country_of_birth: string | null;
  date_of_birth: string | null;
  has_government_birth_certificate: boolean | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_country: string | null;
  address_postcode: string | null;
  marital_status: string | null;
  // PASSPORT
  passport_issuing_country: string | null;
  passport_file_path: string | null;
  // APPLICANTS
  is_sole_applicant: boolean | null;
  additional_applicants: AdditionalApplicant[] | null;
  // REFERENCES
  personal_references: PersonalReference[] | null;
  // FUNDS
  employment_status: string | null;
  funds_source: string | null;
  investment_method: "bank_transfer" | "crypto" | null;
  // NET WORTH
  nw_bank_savings: number | null;
  nw_investments: number | null;
  nw_real_estate: number | null;
  nw_business_assets: number | null;
  nw_crypto: number | null;
  nw_notes: string | null;
  // SECURITY
  security_visa_denied: boolean | null;
  security_criminal_investigation: boolean | null;
  security_threat: boolean | null;
  security_communicable_disease: boolean | null;
  security_prior_cbi_application: boolean | null;
  // POLICE
  police_records_notes: string | null;
  // Progress
  current_step: number;
  submitted_at: string | null;
}

// ─── Design tokens (mirrors LandingV2 / login pages) ─────────────────────────

const PRIMARY = "#bbc4f7";
const PRIMARY_INK = "#242d58";
const SURFACE = "rgba(28,32,38,0.8)";
const SURFACE_DEEP = "#0a0e14";
const HAIRLINE = "rgba(69,71,75,0.3)";
const INK = "#dfe2eb";
const INK_SOFT = "#8f9095";
const ERR = "#b85c6b";
const FONT = "var(--font-manrope, 'Manrope', sans-serif)";

const inputStyle: React.CSSProperties = {
  background: SURFACE_DEEP,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "0.625rem",
  color: INK,
  fontFamily: FONT,
  fontSize: "0.95rem",
  padding: "0.75rem 1rem",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: INK_SOFT,
  fontFamily: FONT,
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
};

// ─── Step definitions ────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Start",
  "Passport",
  "Applicants",
  "References",
  "Funds",
  "Net worth",
  "Security",
  "Police records",
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Civil partnership",
  "Separated",
  "Divorced",
  "Widowed",
];

const EMPLOYMENT_STATUSES = [
  "Employed",
  "Self-employed",
  "Business owner",
  "Retired",
  "Investor",
  "Other",
];

// ─── Reusable field primitives ───────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: PRIMARY, marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs" style={{ color: INK_SOFT, fontFamily: FONT }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs" style={{ color: ERR, fontFamily: FONT }}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor =
          "rgba(187,196,247,0.4)";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor = HAIRLINE;
      }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        resize: "vertical",
        fontFamily: FONT,
        lineHeight: 1.55,
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLTextAreaElement).style.borderColor =
          "rgba(187,196,247,0.4)";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLTextAreaElement).style.borderColor = HAIRLINE;
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer" }}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const baseBtn: React.CSSProperties = {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "0.625rem",
    border: `1px solid ${HAIRLINE}`,
    background: SURFACE_DEEP,
    color: INK,
    fontFamily: FONT,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  };
  const activeBtn: React.CSSProperties = {
    background: "rgba(187,196,247,0.12)",
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
  };
  return (
    <div className="flex gap-3">
      <button
        type="button"
        style={value === true ? { ...baseBtn, ...activeBtn } : baseBtn}
        onClick={() => onChange(true)}
      >
        Yes
      </button>
      <button
        type="button"
        style={value === false ? { ...baseBtn, ...activeBtn } : baseBtn}
        onClick={() => onChange(false)}
      >
        No
      </button>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: INK_SOFT,
            fontFamily: FONT,
            fontSize: "0.95rem",
            pointerEvents: "none",
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value === null ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          if (raw === "") {
            onChange(null);
            return;
          }
          const n = parseFloat(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: prefix ? 32 : 16 }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor =
            "rgba(187,196,247,0.4)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = HAIRLINE;
        }}
      />
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p
          className="text-xs font-semibold uppercase"
          style={{
            color: PRIMARY,
            fontFamily: FONT,
            letterSpacing: "0.22em",
          }}
        >
          Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
        </p>
        <p
          className="text-xs"
          style={{ color: INK_SOFT, fontFamily: FONT }}
        >
          {Math.round(pct)}%
        </p>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(187,196,247,0.12)" }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, background: PRIMARY }}
        />
      </div>
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export function DdWizard({
  initial,
  userId,
  userEmail,
}: {
  initial: DdSubmission;
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [data, setData] = useState<DdSubmission>(initial);
  const [step, setStep] = useState<number>(initial.current_step ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = useCallback(<K extends keyof DdSubmission>(key: K, value: DdSubmission[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Save the current `data` to Supabase and advance to `nextStep` (or stay).
  const saveAndAdvance = useCallback(
    async (nextStep: number) => {
      // Block advance if required fields aren't filled. Validation runs
      // client-side here AND on the server side via the submit API guard for
      // step 8 — belt and braces.
      const missing = validateStep(step, data);
      if (missing.length > 0) {
        setError(
          `Please complete the following before continuing: ${missing.join(
            ", "
          )}.`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const patchPayload: Partial<DdSubmission> & { current_step?: number } = {
          ...data,
          current_step: Math.max(data.current_step, nextStep),
        };
        // Strip non-column / read-only fields
        delete (patchPayload as Partial<DdSubmission>).id;
        delete (patchPayload as Partial<DdSubmission>).user_id;
        delete (patchPayload as Partial<DdSubmission>).submitted_at;

        const { error: updateError } = await supabase
          .from("due_diligence_submissions")
          .update(patchPayload)
          .eq("user_id", userId);

        if (updateError) {
          // Session expired? Send them to login preserving step.
          if (
            updateError.message?.toLowerCase().includes("jwt") ||
            updateError.message?.toLowerCase().includes("not authenticated")
          ) {
            router.replace(
              `/initial-due-diligence/login?next=/initial-due-diligence`
            );
            return;
          }
          setError(updateError.message);
          return;
        }
        setStep(nextStep);
        patch("current_step", Math.max(data.current_step, nextStep));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Couldn't save. Please try again."
        );
      } finally {
        setSaving(false);
      }
    },
    [data, step, supabase, userId, router, patch]
  );

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const submitFinal = useCallback(async () => {
    // Validate the last step (police-records notes) before firing the submit.
    const missing = validateStep(step, data);
    if (missing.length > 0) {
      setError(
        `Please complete the following before submitting: ${missing.join(
          ", "
        )}.`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // First save the latest field state (Step 7 data)
      const { error: saveErr } = await supabase
        .from("due_diligence_submissions")
        .update({
          police_records_notes: data.police_records_notes,
          current_step: TOTAL_STEPS,
        })
        .eq("user_id", userId);
      if (saveErr) {
        setError(saveErr.message);
        return;
      }
      // Then call the submit API which marks submitted_at + sends notification
      const res = await fetch("/api/initial-dd/submit", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Submission failed. Please try again.");
        return;
      }
      router.push("/initial-due-diligence/submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  }, [data, step, supabase, userId, router]);

  // ─── Per-step content ─────────────────────────────────────────────────────

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return <StepStart data={data} patch={patch} />;
      case 2:
        return (
          <StepPassport
            data={data}
            patch={patch}
            userId={userId}
            supabase={supabase}
          />
        );
      case 3:
        return <StepApplicants data={data} patch={patch} />;
      case 4:
        return <StepReferences data={data} patch={patch} />;
      case 5:
        return <StepFunds data={data} patch={patch} />;
      case 6:
        return <StepNetWorth data={data} patch={patch} />;
      case 7:
        return <StepSecurity data={data} patch={patch} />;
      case 8:
        return <StepPolice data={data} patch={patch} />;
      default:
        return null;
    }
  }, [step, data, patch, userId, supabase]);

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14" style={{ background: "#10141a" }}>
      <div className="mx-auto w-full max-w-3xl">
        {/* Brand row */}
        <div className="mb-10 flex items-center justify-between">
          <Logo size="sm" />
          <p
            className="text-xs"
            style={{ color: INK_SOFT, fontFamily: FONT }}
          >
            {userEmail}
          </p>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase"
            style={{
              color: PRIMARY,
              fontFamily: FONT,
              letterSpacing: "0.24em",
            }}
          >
            Initial due diligence
          </p>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{
              color: INK,
              fontFamily: FONT,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Application intake
          </h1>
          <p
            className="mt-3 max-w-[60ch] text-sm sm:text-base leading-7"
            style={{ color: INK_SOFT, fontFamily: FONT }}
          >
            Answer each section to the best of your knowledge. Your progress is
            saved each time you move forward — you can return any time using the
            same email.
          </p>
        </div>

        {/* Progress */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: SURFACE,
            border: `1px solid ${HAIRLINE}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <ProgressBar step={step} />

          <div className="mt-8">{stepContent}</div>

          {error && (
            <div
              className="mt-6 rounded-xl p-4 text-sm"
              style={{
                background: "rgba(184,92,107,0.1)",
                border: "1px solid rgba(184,92,107,0.3)",
                color: ERR,
                fontFamily: FONT,
              }}
            >
              {error}
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || saving}
              className="rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: "transparent",
                border: `1px solid ${HAIRLINE}`,
                color: INK_SOFT,
                fontFamily: FONT,
              }}
            >
              ← Back
            </button>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => saveAndAdvance(step + 1)}
                disabled={saving}
                className="rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: PRIMARY,
                  color: PRIMARY_INK,
                  fontFamily: FONT,
                }}
              >
                {saving ? "Saving…" : "Save & continue →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={submitFinal}
                disabled={saving}
                className="rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: PRIMARY,
                  color: PRIMARY_INK,
                  fontFamily: FONT,
                }}
              >
                {saving ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

type PatchFn = <K extends keyof DdSubmission>(k: K, v: DdSubmission[K]) => void;

function SectionHeading({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="text-xl"
        style={{
          color: INK,
          fontFamily: FONT,
          letterSpacing: "-0.01em",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      {body && (
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: INK_SOFT, fontFamily: FONT }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

function StepStart({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="About you"
        body="Names should match your passport exactly."
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="First name" required>
          <TextInput
            value={data.first_name ?? ""}
            onChange={(v) => patch("first_name", v)}
          />
        </Field>
        <Field label="Middle name">
          <TextInput
            value={data.middle_name ?? ""}
            onChange={(v) => patch("middle_name", v)}
            placeholder="If applicable"
          />
        </Field>
        <Field label="Last name" required>
          <TextInput
            value={data.last_name ?? ""}
            onChange={(v) => patch("last_name", v)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country of birth" required>
          <Select
            value={data.country_of_birth ?? ""}
            onChange={(v) => patch("country_of_birth", v)}
            options={COUNTRIES}
            placeholder="Select country…"
          />
        </Field>
        <Field label="Date of birth" required>
          <TextInput
            type="date"
            value={data.date_of_birth ?? ""}
            onChange={(v) => patch("date_of_birth", v)}
          />
        </Field>
      </div>

      <Field
        label="Government-issued birth certificate"
        hint="Hospital-issued birth certificates are usually not accepted by citizenship programmes. We need to confirm you can produce a government-issued copy if asked."
      >
        <p
          className="mb-3 text-sm leading-6"
          style={{ color: INK, fontFamily: FONT }}
        >
          Do you have a government-issued copy of your birth certificate, or
          know how to request it?
        </p>
        <YesNo
          value={data.has_government_birth_certificate}
          onChange={(v) => patch("has_government_birth_certificate", v)}
        />
      </Field>

      <SectionHeading title="Current address" />
      <Field label="Street address" required>
        <TextInput
          value={data.address_street ?? ""}
          onChange={(v) => patch("address_street", v)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City" required>
          <TextInput
            value={data.address_city ?? ""}
            onChange={(v) => patch("address_city", v)}
          />
        </Field>
        <Field label="State / Region">
          <TextInput
            value={data.address_state ?? ""}
            onChange={(v) => patch("address_state", v)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country" required>
          <Select
            value={data.address_country ?? ""}
            onChange={(v) => patch("address_country", v)}
            options={COUNTRIES}
            placeholder="Select country…"
          />
        </Field>
        <Field label="Post / ZIP code" required>
          <TextInput
            value={data.address_postcode ?? ""}
            onChange={(v) => patch("address_postcode", v)}
          />
        </Field>
      </div>

      <Field label="Marital status" required>
        <Select
          value={data.marital_status ?? ""}
          onChange={(v) => patch("marital_status", v)}
          options={MARITAL_STATUSES}
        />
      </Field>
    </div>
  );
}

function StepPassport({
  data,
  patch,
  userId,
  supabase,
}: {
  data: DdSubmission;
  patch: PatchFn;
  userId: string;
  supabase: ReturnType<typeof createClient>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is over 10 MB — please upload a smaller copy.");
      return;
    }
    if (
      !["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(
        file.type
      )
    ) {
      setUploadError("Only PDF, PNG, or JPG files are accepted.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${userId}/passport.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("dd-passports")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        setUploadError(upErr.message);
        return;
      }
      // Save the path on the submission row so the server can find it later.
      const { error: dbErr } = await supabase
        .from("due_diligence_submissions")
        .update({ passport_file_path: path })
        .eq("user_id", userId);
      if (dbErr) {
        setUploadError(dbErr.message);
        return;
      }
      patch("passport_file_path", path);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const existingFilename = data.passport_file_path
    ? data.passport_file_path.split("/").pop()
    : null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Passport"
        body="The passport you intend to use for the application."
      />
      <Field label="Issuing country" required>
        <Select
          value={data.passport_issuing_country ?? ""}
          onChange={(v) => patch("passport_issuing_country", v)}
          options={COUNTRIES}
          placeholder="Select country…"
        />
      </Field>
      <Field
        label="Upload passport"
        hint="PDF, PNG, or JPG. Max 10 MB. Photo page only — additional pages can be requested later."
      >
        <div
          className="flex flex-col gap-3 rounded-xl p-5"
          style={{
            background: SURFACE_DEEP,
            border: `1px dashed ${HAIRLINE}`,
          }}
        >
          {existingFilename ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="material-symbols-outlined"
                  style={{ color: PRIMARY, fontSize: 22 }}
                >
                  description
                </span>
                <span
                  className="truncate text-sm"
                  style={{ color: INK, fontFamily: FONT }}
                >
                  {existingFilename}
                </span>
              </div>
              <label
                className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "transparent",
                  border: `1px solid ${HAIRLINE}`,
                  color: INK_SOFT,
                  fontFamily: FONT,
                }}
              >
                Replace
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div
                className="text-center text-sm"
                style={{ color: INK_SOFT, fontFamily: FONT, padding: "1rem 0" }}
              >
                {uploading
                  ? "Uploading…"
                  : "Click to select a PDF, PNG, or JPG"}
              </div>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          )}
          {uploadError && (
            <p
              className="text-xs"
              style={{ color: ERR, fontFamily: FONT }}
            >
              {uploadError}
            </p>
          )}
        </div>
      </Field>
    </div>
  );
}

function StepApplicants({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  const additional = data.additional_applicants ?? [];

  const setAdditional = (next: AdditionalApplicant[]) => {
    patch("additional_applicants", next);
  };

  const addRow = () => {
    setAdditional([...additional, { name: "", relationship: "" }]);
  };

  const updateRow = (i: number, key: keyof AdditionalApplicant, value: string) => {
    const next = additional.map((row, idx) =>
      idx === i ? { ...row, [key]: value } : row
    );
    setAdditional(next);
  };

  const removeRow = (i: number) => {
    setAdditional(additional.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Applicants"
        body="Are you applying alone, or including dependants on the application?"
      />
      <Field label="Are you the only applicant?" required>
        <YesNo
          value={data.is_sole_applicant}
          onChange={(v) => {
            patch("is_sole_applicant", v);
            if (v) setAdditional([]); // clear list if going sole
          }}
        />
      </Field>

      {data.is_sole_applicant === false && (
        <div className="flex flex-col gap-4">
          <p
            className="text-sm"
            style={{ color: INK_SOFT, fontFamily: FONT }}
          >
            List each additional applicant (spouse, child, parent, etc.).
          </p>
          {additional.map((row, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{
                background: SURFACE_DEEP,
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field label={`Applicant ${i + 2} — full name`}>
                  <TextInput
                    value={row.name}
                    onChange={(v) => updateRow(i, "name", v)}
                  />
                </Field>
                <Field label="Relationship to you">
                  <Select
                    value={row.relationship}
                    onChange={(v) => updateRow(i, "relationship", v)}
                    options={APPLICANT_RELATIONSHIPS}
                    placeholder="Select…"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "transparent",
                    border: `1px solid ${HAIRLINE}`,
                    color: INK_SOFT,
                    fontFamily: FONT,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              background: "rgba(187,196,247,0.12)",
              border: `1px solid ${PRIMARY}`,
              color: PRIMARY,
              fontFamily: FONT,
            }}
          >
            + Add more
          </button>
        </div>
      )}
    </div>
  );
}

function StepReferences({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  const refs = data.personal_references ?? [];

  const setRefs = (next: PersonalReference[]) =>
    patch("personal_references", next);

  const addRow = (platform: string = "") => {
    setRefs([...refs, { platform, url: "" }]);
  };

  const updateRow = (i: number, key: keyof PersonalReference, value: string) => {
    setRefs(refs.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  };

  const removeRow = (i: number) => {
    setRefs(refs.filter((_, idx) => idx !== i));
  };

  // Pre-existing platforms in the list (so quick-add chips can grey-out
  // ones already used — small UX courtesy)
  const usedPlatforms = new Set(
    refs.map((r) => r.platform.trim().toLowerCase()).filter(Boolean)
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Personal references"
        body="Links to your professional and personal online profiles. Helps your advisor verify identity and confirm your public footprint matches your application."
      />

      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-2">
        {COMMON_REFERENCE_PLATFORMS.map((p) => {
          const used = usedPlatforms.has(p.toLowerCase());
          return (
            <button
              key={p}
              type="button"
              onClick={() => addRow(p)}
              disabled={used}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
              style={{
                background: used ? "transparent" : "rgba(187,196,247,0.10)",
                border: `1px solid ${used ? HAIRLINE : "rgba(187,196,247,0.30)"}`,
                color: used ? INK_SOFT : PRIMARY,
                fontFamily: FONT,
                cursor: used ? "not-allowed" : "pointer",
              }}
            >
              + {p}
            </button>
          );
        })}
      </div>

      {/* Rows */}
      {refs.length === 0 ? (
        <p
          className="text-sm leading-6"
          style={{ color: INK_SOFT, fontFamily: FONT }}
        >
          No references added yet. Tap a chip above, or use &ldquo;Add
          another&rdquo; for something not listed.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {refs.map((row, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{
                background: SURFACE_DEEP,
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
                <Field label={`Platform`}>
                  <TextInput
                    value={row.platform}
                    onChange={(v) => updateRow(i, "platform", v)}
                    placeholder="e.g. LinkedIn"
                  />
                </Field>
                <Field label="URL or handle">
                  <TextInput
                    value={row.url}
                    onChange={(v) => updateRow(i, "url", v)}
                    placeholder="https://… or @handle"
                    inputMode="url"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "transparent",
                    border: `1px solid ${HAIRLINE}`,
                    color: INK_SOFT,
                    fontFamily: FONT,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => addRow("")}
        className="self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
        style={{
          background: "rgba(187,196,247,0.12)",
          border: `1px solid ${PRIMARY}`,
          color: PRIMARY,
          fontFamily: FONT,
        }}
      >
        + Add another
      </button>

      <p
        className="text-xs leading-6"
        style={{ color: INK_SOFT, fontFamily: FONT }}
      >
        Adding references is optional but recommended. The more public
        verification you provide, the faster the DD review.
      </p>
    </div>
  );
}

function StepFunds({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Funds"
        body="How you generate income, and how you'll fund the investment."
      />
      <Field label="Employment status" required>
        <Select
          value={data.employment_status ?? ""}
          onChange={(v) => patch("employment_status", v)}
          options={EMPLOYMENT_STATUSES}
        />
      </Field>

      <Field
        label="Source of funds for this application"
        required
        hint="Be specific: business proceeds, salary savings, inheritance, asset sale, investment returns, etc."
      >
        <TextArea
          value={data.funds_source ?? ""}
          onChange={(v) => patch("funds_source", v)}
          rows={5}
        />
      </Field>

      <Field label="Investment method" required>
        <div className="flex flex-col gap-3 sm:flex-row">
          {(
            [
              { id: "bank_transfer", label: "Bank transfer" },
              { id: "crypto", label: "Crypto" },
            ] as const
          ).map((opt) => {
            const active = data.investment_method === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => patch("investment_method", opt.id)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
                style={{
                  background: active
                    ? "rgba(187,196,247,0.12)"
                    : SURFACE_DEEP,
                  border: `1px solid ${active ? PRIMARY : HAIRLINE}`,
                  color: active ? PRIMARY : INK,
                  fontFamily: FONT,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function StepNetWorth({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  const rows: { key: keyof DdSubmission; label: string }[] = [
    { key: "nw_bank_savings", label: "Bank accounts / savings" },
    { key: "nw_investments", label: "Investment accounts" },
    { key: "nw_real_estate", label: "Real estate" },
    { key: "nw_business_assets", label: "Business assets" },
    { key: "nw_crypto", label: "Crypto" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Net worth"
        body="Approximate totals per category in USD. Round figures are fine — exact statements may be requested at a later stage."
      />
      {rows.map((row) => (
        <Field key={row.key} label={row.label}>
          <NumberInput
            value={(data[row.key] as number | null) ?? null}
            onChange={(v) => patch(row.key, v as DdSubmission[typeof row.key])}
            prefix="$"
            placeholder="0"
          />
        </Field>
      ))}
      <Field
        label="Notes"
        hint="Anything that doesn't fit cleanly into the categories above."
      >
        <TextArea
          value={data.nw_notes ?? ""}
          onChange={(v) => patch("nw_notes", v)}
          rows={4}
        />
      </Field>
    </div>
  );
}

function StepSecurity({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  const questions: { key: keyof DdSubmission; q: string }[] = [
    {
      key: "security_visa_denied",
      q: "Have you ever been denied a visa, a residence permit or citizenship in any country?",
    },
    {
      key: "security_criminal_investigation",
      q: "Have you ever been the subject of any criminal investigation?",
    },
    {
      key: "security_threat",
      q: "Have you ever been considered to be a potential security threat in any country?",
    },
    {
      key: "security_communicable_disease",
      q: "Does anyone in the application suffer from any communicable diseases?",
    },
    {
      key: "security_prior_cbi_application",
      q: "Have you ever applied to any other Citizenship by Investment program in the past?",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Security & history"
        body="Answer honestly — disclosure issues are easier to work around than discovery issues."
      />
      {questions.map((item) => (
        <div
          key={item.key}
          className="rounded-xl p-4"
          style={{
            background: SURFACE_DEEP,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <p
            className="mb-3 text-sm leading-6"
            style={{ color: INK, fontFamily: FONT }}
          >
            {item.q}
          </p>
          <YesNo
            value={data[item.key] as boolean | null}
            onChange={(v) => patch(item.key, v as DdSubmission[typeof item.key])}
          />
        </div>
      ))}
    </div>
  );
}

function StepPolice({
  data,
  patch,
}: {
  data: DdSubmission;
  patch: PatchFn;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="Police records" />
      <p
        className="text-sm leading-7"
        style={{ color: INK, fontFamily: FONT }}
      >
        As part of the due diligence process, every applicant will be required
        to provide police records based on their citizenship and residency
        history. Please provide details of any kind of information that you
        think might appear in any of said police records.
      </p>
      <Field
        label="Details"
        hint="If there's nothing to disclose, write 'Nothing to disclose'."
      >
        <TextArea
          value={data.police_records_notes ?? ""}
          onChange={(v) => patch("police_records_notes", v)}
          rows={7}
          placeholder="Anything that might appear on a police record from any country you've lived in…"
        />
      </Field>
      <p
        className="text-sm leading-6"
        style={{ color: INK_SOFT, fontFamily: FONT }}
      >
        When you submit, your advisor will be notified and will review the
        full application. You won't be able to edit it after submission — if
        you need to amend, contact your advisor and they can reopen it.
      </p>
    </div>
  );
}
