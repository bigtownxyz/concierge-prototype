"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { PROGRAMS, type Program } from "@/lib/constants";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QualifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill form data when reopened from the portal dashboard */
  prefill?: Partial<FormData>;
}

type StrategicFocus = "mobility" | "tax" | "family" | "assets";
type Timeline = "immediate" | "strategic" | "long-term";

interface FormData {
  strategicFocus: StrategicFocus[];
  investmentAmount: number;
  timeline: Timeline | "";
  dependants: number;
  isUsCitizen: boolean | null;
  consideringRenouncing: boolean | null;
  constraints: string[];
  constraintDetail: string;
  name: string;
  email: string;
  phone: string;
  selectedPrograms: string[];
  country: string;
  nationality: string;
  situation: string;
}

const DRAFT_KEY = "concierge_qualification_draft";

const EMPTY_FORM: FormData = {
  strategicFocus: [],
  investmentAmount: 500_000,
  timeline: "",
  dependants: 0,
  isUsCitizen: null,
  consideringRenouncing: null,
  constraints: [],
  constraintDetail: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  nationality: "",
  situation: "",
  selectedPrograms: [],
};

const TIMELINE_OPTIONS: { id: Timeline; label: string; desc: string }[] = [
  { id: "immediate", label: "Immediate", desc: "0-6 months \u2014 Priority processing and rapid capital deployment." },
  { id: "strategic", label: "Strategic", desc: "6-18 months \u2014 Optimised tax planning and jurisdictional vetting." },
  { id: "long-term", label: "Long-term Planning", desc: "Multigenerational wealth preservation and residency layering." },
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
  "Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
  "Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco",
  "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine",
  "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino","Sao Tome","Saudi Arabia",
  "Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const CONSTRAINT_OPTIONS = [
  "Budget",
  "Timeline",
  "Family situation",
  "Current citizenship limitations",
  "Other",
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STRATEGY_OPTIONS: {
  id: StrategicFocus;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    id: "mobility",
    icon: "public",
    title: "Global Mobility",
    description: "Second passport & visa-free access",
  },
  {
    id: "tax",
    icon: "account_balance_wallet",
    title: "Tax Optimisation",
    description: "Legitimate cross-border structuring",
  },
  {
    id: "family",
    icon: "family_restroom",
    title: "Family Security",
    description: "Multi-generational wealth protection",
  },
  {
    id: "assets",
    icon: "rebase",
    title: "Asset Diversification",
    description: "Offshore allocation & safe havens",
  },
];

const SLIDER_TICKS = [100_000, 500_000, 1_000_000, 2_500_000, 5_000_000];
const SLIDER_MIN = 100_000;
const SLIDER_MAX = 5_000_000;
const SLIDER_STEP = 50_000;

function formatAmount(n: number): string {
  if (n >= 5_000_000) return "$5M+";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function formatTickLabel(n: number): string {
  if (n >= 5_000_000) return "$5M+";
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  return `$${n / 1_000}K`;
}

const STEP_LABELS = ["Strategic Focus", "Estimated Budget", "Your Profile", "Contact Details", "Recommendations"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StrategyCard({
  option,
  selected,
  onToggle,
}: {
  option: (typeof STRATEGY_OPTIONS)[number];
  selected: boolean;
  onToggle: (id: StrategicFocus) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      className="relative flex flex-col gap-4 rounded-xl p-6 text-left transition-all duration-200"
      style={{
        background: "#0a0e14",
        border: selected
          ? "1px solid rgba(187,196,247,0.5)"
          : "1px solid rgba(69,71,75,0.4)",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
        boxShadow: selected ? "0 0 20px rgba(187,196,247,0.08)" : "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 22,
            color: selected ? "#bbc4f7" : "#8f9095",
          }}
        >
          {option.icon}
        </span>
        {/* Checkbox circle */}
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: selected ? "#bbc4f7" : "transparent",
            border: selected ? "2px solid #bbc4f7" : "2px solid rgba(69,71,75,0.7)",
          }}
        >
          {selected && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 13, color: "#242d58", fontVariationSettings: "'FILL' 1" }}
            >
              check
            </span>
          )}
        </span>
      </div>
      {/* Text */}
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: selected ? "#dfe2eb" : "#c6c6cb" }}
        >
          {option.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#8f9095" }}>
          {option.description}
        </p>
      </div>
    </button>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepStrategicFocus({
  selected,
  onToggle,
}: {
  selected: StrategicFocus[];
  onToggle: (id: StrategicFocus) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#bbc4f7" }}
        >
          Strategic Focus
        </p>
        <h3
          className="mt-2 text-xl font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          What are your primary objectives?
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
          Select all that apply. This helps us identify the most aligned programmes.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {STRATEGY_OPTIONS.map((opt) => (
          <StrategyCard
            key={opt.id}
            option={opt}
            selected={selected.includes(opt.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs" style={{ color: "rgba(143,144,149,0.6)" }}>
          Select at least one objective to continue.
        </p>
      )}
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepInvestment({
  amount,
  onChange,
}: {
  amount: number;
  onChange: (v: number) => void;
}) {
  const pct = ((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#bbc4f7" }}
        >
          Target Deployment
        </p>
        <h3
          className="mt-2 text-xl font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          Estimated Budget
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
          Indicate your anticipated investment threshold. This narrows viable programme options.
        </p>
      </div>

      {/* Amount display */}
      <div className="flex justify-end">
        <span
          className="font-semibold tabular-nums"
          style={{
            color: "#bbc4f7",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          {formatAmount(amount)}
        </span>
      </div>

      {/* Slider */}
      <div className="relative flex flex-col gap-3">
        <div className="relative h-1.5 rounded-full" style={{ background: "#374667" }}>
          {/* Fill */}
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
        />
        {/* Ticks */}
        <div className="flex justify-between">
          {SLIDER_TICKS.map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onChange(tick)}
              className="text-xs transition-colors duration-150"
              style={{
                color: amount === tick ? "#bbc4f7" : "rgba(143,144,149,0.6)",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              {formatTickLabel(tick)}
            </button>
          ))}
        </div>
      </div>

      {/* Range note */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{
          background: "rgba(187,196,247,0.05)",
          border: "1px solid rgba(187,196,247,0.12)",
          color: "#c6c6cb",
        }}
      >
        <span style={{ color: "#bbc4f7", fontWeight: 600 }}>{formatAmount(amount)}</span>
        {" "}threshold unlocks{" "}
        <span style={{ color: "#bbc4f7", fontWeight: 600 }}>
          {amount < 200_000
            ? "entry-level"
            : amount < 500_000
            ? "standard"
            : amount < 1_000_000
            ? "premium"
            : "elite"}
        </span>{" "}
        tier programmes across {amount < 300_000 ? "3" : amount < 1_000_000 ? "8" : "14"}+ jurisdictions.
      </div>

      {amount <= 100_000 && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: "rgba(214,195,110,0.08)",
            border: "1px solid rgba(214,195,110,0.25)",
            color: "#d6c36e",
          }}
        >
          Some programs require higher minimum investments. We&apos;ll help identify the best options within your budget during your consultation.
        </div>
      )}

    </div>
  );
}

// ─── Step 3: Profile ─────────────────────────────────────────────────────────

function StepProfile({
  timeline,
  onTimelineChange,
  dependants,
  onDependantsChange,
  isUsCitizen,
  onUsCitizenChange,
  consideringRenouncing,
  onRenouncingChange,
}: {
  timeline: Timeline | "";
  onTimelineChange: (v: Timeline) => void;
  dependants: number;
  onDependantsChange: (v: number) => void;
  isUsCitizen: boolean | null;
  onUsCitizenChange: (v: boolean) => void;
  consideringRenouncing: boolean | null;
  onRenouncingChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: "#bbc4f7" }}>
          Your Profile
        </p>
        <h3 className="mt-2 text-xl font-semibold" style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}>
          Tell us about your situation
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
          This helps us match you with the right programmes.
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
                border: timeline === opt.id ? "1px solid rgba(187,196,247,0.4)" : "1px solid rgba(69,71,75,0.3)",
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8f9095" }}>{opt.desc}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: timeline === opt.id ? "2px solid #bbc4f7" : "2px solid rgba(69,71,75,0.5)",
                  background: timeline === opt.id ? "#bbc4f7" : "transparent",
                }}
              >
                {timeline === opt.id && (
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#242d58" }}>check</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Family Members */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          Family Members
        </p>
        <p className="text-sm mb-3" style={{ color: "#8f9095" }}>
          How many family members will be included in the application?
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onDependantsChange(Math.max(0, dependants - 1))}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: "#0a0e14", border: "1px solid rgba(69,71,75,0.3)", color: "#bbc4f7" }}
          >
            -
          </button>
          <span className="text-xl font-semibold w-8 text-center" style={{ color: "#dfe2eb" }}>{dependants}</span>
          <button
            type="button"
            onClick={() => onDependantsChange(dependants + 1)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: "#0a0e14", border: "1px solid rgba(69,71,75,0.3)", color: "#bbc4f7" }}
          >
            +
          </button>
          <span className="text-xs" style={{ color: "#8f9095" }}>
            {dependants === 0 ? "Just myself" : `${dependants} family member${dependants > 1 ? "s" : ""}`}
          </span>
        </div>
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
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
              style={{
                background: isUsCitizen === val ? "rgba(187,196,247,0.1)" : "#0a0e14",
                border: isUsCitizen === val ? "1px solid rgba(187,196,247,0.4)" : "1px solid rgba(69,71,75,0.3)",
                color: isUsCitizen === val ? "#bbc4f7" : "#8f9095",
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
                  className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: consideringRenouncing === val ? "rgba(187,196,247,0.1)" : "#0a0e14",
                    border: consideringRenouncing === val ? "1px solid rgba(187,196,247,0.4)" : "1px solid rgba(69,71,75,0.3)",
                    color: consideringRenouncing === val ? "#bbc4f7" : "#8f9095",
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

// ─── Step 3 ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#0a0e14",
  border: "1px solid rgba(69,71,75,0.3)",
  borderRadius: "0.625rem",
  color: "#dfe2eb",
  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
  fontSize: "0.875rem",
  padding: "0.75rem 1rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold"
        style={{ color: "#8f9095", letterSpacing: "0.04em", textTransform: "uppercase" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)";
        }}
      />
    </div>
  );
}

function CitizenshipSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = value.split(",").map((s) => s.trim()).filter(Boolean);

  const filtered = search.trim()
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()) && !selected.includes(c))
    : COUNTRIES.filter((c) => !selected.includes(c));

  const addCountry = (country: string) => {
    const next = [...selected, country].join(", ");
    onChange(next);
    setSearch("");
  };

  const removeCountry = (country: string) => {
    const next = selected.filter((s) => s !== country).join(", ");
    onChange(next);
  };

  return (
    <div className="relative">
      {/* Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{ background: "rgba(187,196,247,0.1)", border: "1px solid rgba(187,196,247,0.25)", color: "#bbc4f7" }}
            >
              {c}
              <button
                type="button"
                onClick={() => removeCountry(c)}
                className="hover:opacity-70"
                style={{ color: "#bbc4f7" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: "#8f9095" }}>
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length > 0 ? "Add another citizenship..." : "Search countries..."}
          style={{
            ...inputStyle,
            paddingLeft: "2.5rem",
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-xl py-1"
          style={{
            background: "#0a0e14",
            border: "1px solid rgba(69,71,75,0.3)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(69,71,75,0.4) transparent",
          }}
        >
          {filtered.slice(0, 20).map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addCountry(c)}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: "#c6c6cb" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(187,196,247,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {c}
            </button>
          ))}
          {filtered.length > 20 && (
            <p className="px-4 py-2 text-xs" style={{ color: "#8f9095" }}>
              Type to narrow results...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StepContact({
  data,
  onChange,
  constraints,
  onConstraintsToggle,
  constraintDetail,
  onConstraintDetailChange,
}: {
  data: Pick<FormData, "name" | "email" | "phone" | "country" | "nationality" | "situation">;
  onChange: <K extends keyof typeof data>(key: K, value: string) => void;
  constraints: string[];
  onConstraintsToggle: (v: string) => void;
  constraintDetail: string;
  onConstraintDetailChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#bbc4f7" }}
        >
          Contact Details
        </p>
        <h3
          className="mt-2 text-xl font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          Personal particulars
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
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
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8f9095" }}>
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
            <option value="" style={{ background: "#0a0e14" }}>Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} style={{ background: "#0a0e14" }}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8f9095" }}>
            Current Citizenships * <span className="normal-case font-normal">(search and select)</span>
          </label>
          <CitizenshipSelector
            value={data.nationality}
            onChange={(v) => onChange("nationality", v)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold"
          style={{ color: "#8f9095", letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          Tell us a bit about your situation *
        </label>
        <textarea
          rows={4}
          value={data.situation}
          placeholder="Share any relevant context — timeline, existing structures, specific concerns..."
          onChange={(e) => onChange("situation", e.target.value)}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "6rem",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(187,196,247,0.4)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(69,71,75,0.3)";
          }}
        />
      </div>

      {/* Constraints */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(69,71,75,0.2)" }}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#8f9095" }}>
          Any Constraints We Should Know About?
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
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all duration-150"
              style={{
                background: constraints.includes(opt) ? "rgba(187,196,247,0.06)" : "rgba(10,14,20,0.6)",
                border: constraints.includes(opt) ? "1px solid rgba(187,196,247,0.3)" : "1px solid rgba(69,71,75,0.2)",
                color: "#c6c6cb",
              }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  border: constraints.includes(opt) ? "2px solid #bbc4f7" : "2px solid rgba(69,71,75,0.5)",
                  background: constraints.includes(opt) ? "#bbc4f7" : "transparent",
                }}
              >
                {constraints.includes(opt) && (
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#242d58" }}>check</span>
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
              background: "#0a0e14",
              border: "1px solid rgba(69,71,75,0.3)",
              borderRadius: "0.625rem",
              color: "#dfe2eb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              fontSize: "0.875rem",
              padding: "0.75rem 1rem",
              outline: "none",
              resize: "vertical",
              minHeight: "4.5rem",
            }}
            onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(187,196,247,0.4)"; }}
            onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(69,71,75,0.3)"; }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

function StepRecommendations({
  ranked,
  selected,
  onToggle,
}: {
  ranked: { program: Program; score: number }[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const top2 = ranked.slice(0, 2);
  const rest = ranked.slice(2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#bbc4f7" }}
        >
          Recommendations
        </p>
        <h3
          className="mt-2 text-xl font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          Your top matches
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "#8f9095" }}>
          Based on your objectives and investment range. Select all programmes you&apos;d like to explore.
        </p>
      </div>

      {/* Top 2 highlighted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {top2.map(({ program, score }, i) => (
          <button
            key={program.slug}
            type="button"
            onClick={() => onToggle(program.slug)}
            className="relative rounded-xl p-6 text-left transition-all duration-200"
            style={{
              background: selected.includes(program.slug)
                ? "rgba(187,196,247,0.12)"
                : "#0a0e14",
              border: selected.includes(program.slug)
                ? "1px solid rgba(187,196,247,0.5)"
                : "1px solid rgba(69,71,75,0.4)",
              boxShadow: selected.includes(program.slug)
                ? "0 0 20px rgba(187,196,247,0.08)"
                : "none",
            }}
          >
            {i === 0 && (
              <span
                className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                style={{ background: "#bbc4f7", color: "#242d58" }}
              >
                Best Match
              </span>
            )}
            {i === 1 && (
              <span
                className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                style={{ background: "#d6c3b7", color: "#3a2e26" }}
              >
                Runner Up
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: selected.includes(program.slug)
                    ? "2px solid #bbc4f7"
                    : "2px solid rgba(69,71,75,0.6)",
                  background: selected.includes(program.slug) ? "#bbc4f7" : "transparent",
                }}
              >
                {selected.includes(program.slug) && (
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#242d58" }}>check</span>
                )}
              </div>
              <span className="text-xs uppercase tracking-widest" style={{ color: "#8f9095" }}>
                {program.type}
              </span>
            </div>
            <h4 className="text-lg font-semibold mb-1" style={{ color: "#dfe2eb" }}>
              {program.country}
            </h4>
            <p className="text-xs mb-4" style={{ color: "#8f9095" }}>
              {program.marketingHook.slice(0, 80)}...
            </p>
            <div className="flex gap-4 text-xs" style={{ color: "#c6c6cb" }}>
              <span>From {program.currency === "USD" ? "$" : program.currency === "EUR" ? "€" : program.currency}{(program.minInvestment / 1000).toFixed(0)}K</span>
              <span>•</span>
              <span>{program.processingTimeMonths ? `${program.processingTimeMonths}mo` : "Varies"}</span>
              <span>•</span>
              <span>{program.visaFreeCount ?? "—"} countries</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(69,71,75,0.4)" }}>
                <div className="h-full rounded-full" style={{ background: "#bbc4f7", width: `${score}%` }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: "#bbc4f7" }}>{Math.round(score)}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Remaining programs — scrollable */}
      {rest.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: "#8f9095" }}>
            Other programmes ({rest.length})
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(69,71,75,0.4) transparent" }}>
            {rest.map(({ program, score }) => (
              <button
                key={program.slug}
                type="button"
                onClick={() => onToggle(program.slug)}
                className="flex items-center gap-4 w-full rounded-lg px-4 py-3 text-left transition-all duration-150"
                style={{
                  background: selected.includes(program.slug)
                    ? "rgba(187,196,247,0.08)"
                    : "rgba(10,14,20,0.6)",
                  border: selected.includes(program.slug)
                    ? "1px solid rgba(187,196,247,0.35)"
                    : "1px solid rgba(69,71,75,0.2)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: selected.includes(program.slug)
                      ? "2px solid #bbc4f7"
                      : "2px solid rgba(69,71,75,0.5)",
                    background: selected.includes(program.slug) ? "#bbc4f7" : "transparent",
                  }}
                >
                  {selected.includes(program.slug) && (
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#242d58" }}>check</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: "#dfe2eb" }}>
                      {program.country}
                    </span>
                    <span className="text-[10px] uppercase" style={{ color: "#8f9095" }}>
                      {program.type}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "#8f9095" }}>
                    From {program.currency === "USD" ? "$" : program.currency === "EUR" ? "€" : program.currency}{(program.minInvestment / 1000).toFixed(0)}K · {program.processingTimeMonths ?? "—"}mo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="h-1 w-12 rounded-full overflow-hidden" style={{ background: "rgba(69,71,75,0.4)" }}>
                    <div className="h-full rounded-full" style={{ background: "rgba(187,196,247,0.6)", width: `${score}%` }} />
                  </div>
                  <span className="text-[10px]" style={{ color: "#8f9095" }}>{Math.round(score)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-xs" style={{ color: "rgba(143,144,149,0.6)" }}>
          Select at least one programme to continue.
        </p>
      )}
    </div>
  );
}

// ─── Create Account Inline Form (shown on step 4 submit when logged out) ──────

function CreateAccountForm({
  defaultEmail,
  defaultName,
  onSuccess,
  onError,
  onInfo,
}: {
  defaultEmail: string;
  defaultName: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onInfo: (msg: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) {
      onError("Please fill in all fields. Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `https://concierge-proto1231.vercel.app/en/programs`,
      },
    });

    if (error) {
      onError(error.message);
      setLoading(false);
      return;
    }

    // Sign in immediately so we have a session for saving data
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // Email confirmation likely required — show as info, not error
      onInfo("Account created! Please check your email to confirm, then come back and log in to see your results.");
      setLoading(false);
      return;
    }

    // Wait for session to fully propagate before saving data
    await new Promise((r) => setTimeout(r, 1500));

    // Verify the session is actually ready
    const { data: { user: verifiedUser } } = await supabase.auth.getUser();
    if (!verifiedUser) {
      // Session not ready — try one more time
      await new Promise((r) => setTimeout(r, 2000));
    }

    onSuccess();
    setLoading(false);
  };

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-4">
      <div>
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase mb-1"
          style={{ color: "#bbc4f7" }}
        >
          Create Account to Save Results
        </p>
        <p className="text-sm" style={{ color: "#8f9095" }}>
          Your recommendations will be saved to your secure portal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8f9095" }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your legal name"
            style={inputStyle}
            onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)")}
            onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8f9095" }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            style={inputStyle}
            onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)")}
            onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)")}
          />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8f9095" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={inputStyle}
            onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(187,196,247,0.4)")}
            onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "rgba(69,71,75,0.3)")}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        style={{
          background: "#bbc4f7",
          color: "#242d58",
          fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7"; }}
      >
        {loading ? "Creating account..." : "Create Account & Save Results"}
      </button>
    </form>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
      router.push("/results");
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose, router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center gap-6 px-8 py-16 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "rgba(187,196,247,0.1)", border: "1px solid rgba(187,196,247,0.25)" }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 32, color: "#bbc4f7", fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>
      <div>
        <h3
          className="text-2xl font-semibold"
          style={{ color: "#dfe2eb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
        >
          Qualification Received
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8f9095" }}>
          Redirecting to your results...
        </p>
      </div>
      {/* Progress dots to indicate loading */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
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
    </motion.div>
  );
}

// ─── DB persistence helper ────────────────────────────────────────────────────

async function saveQualificationToDb(
  formData: FormData,
  rankedPrograms: { program: Program; score: number }[],
  knownUserId?: string
) {
  const supabase = createClient();

  // Use provided userId (from useUser hook) if available, fall back to session
  let userId = knownUserId;
  if (!userId) {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) console.error("[QualifyModal] Auth error:", authError);
    if (!data.user) throw new Error("Not authenticated — please try signing in again");
    userId = data.user.id;
  }

  // 1. Update profile details (profile already created by trigger)
  const profileUpdate: Record<string, string> = { updated_at: new Date().toISOString() };
  if (formData.name) profileUpdate.full_name = formData.name;
  if (formData.email) profileUpdate.email = formData.email;
  if (formData.phone) profileUpdate.phone = formData.phone;
  if (formData.country) profileUpdate.country = formData.country;
  if (formData.nationality) profileUpdate.nationality = formData.nationality;

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);
  if (profileError) {
    console.error("[QualifyModal] Profile update error:", profileError);
    throw new Error("Failed to update profile: " + profileError.message);
  }

  // 2. Delete any existing qualification and create fresh
  const { data: existingQual } = await supabase
    .from("qualifications")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let qualId: string;

  if (existingQual) {
    // Delete old program matches first (FK constraint)
    await supabase
      .from("qualification_programs")
      .delete()
      .eq("qualification_id", existingQual.id);

    // Delete old qualification
    await supabase
      .from("qualifications")
      .delete()
      .eq("id", existingQual.id);
  }

  // Create new qualification
  const { data: newQual, error: qualError } = await supabase
    .from("qualifications")
    .insert({
      user_id: userId,
      strategic_focus: formData.strategicFocus,
      investment_amount: formData.investmentAmount,
      situation: formData.situation || null,
    })
    .select("id")
    .single();

  if (qualError) {
    console.error("[QualifyModal] Qualification insert error:", qualError);
    throw new Error("Failed to save qualification: " + qualError.message);
  }
  if (!newQual) throw new Error("Failed to create qualification — no data returned");
  qualId = newQual.id;

  // 3. Save ALL ranked programmes as recommendations (not just selected ones)
  // The user's explicit selections are marked with higher scores
  const programRows = rankedPrograms
    .filter(({ score }) => score > 0)
    .map(({ program, score }) => ({
      qualification_id: qualId,
      program_slug: program.slug,
      match_score: Math.round(
        formData.selectedPrograms.includes(program.slug)
          ? Math.min(score + 10, 100) // boost explicitly selected ones
          : score
      ),
    }));

  if (programRows.length > 0) {
    // Clear any existing recommendations first
    await supabase
      .from("qualification_programs")
      .delete()
      .eq("qualification_id", qualId);
    const { error: progError } = await supabase.from("qualification_programs").insert(programRows);
    if (progError) {
      console.error("[QualifyModal] Programs insert error:", progError);
      // Don't throw — qualification was saved, programs are secondary
    }
  }
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function QualifyModal({ isOpen, onClose, prefill }: QualifyModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveInfo, setSaveInfo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!isOpen) return;

    if (prefill) {
      setFormData((prev) => ({ ...prev, ...prefill }));
      return;
    }

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<FormData>;
        setFormData((prev) => ({ ...prev, ...draft }));
      }
    } catch {
      // Ignore parse errors
    }
  }, [isOpen, prefill]);

  // Save draft to localStorage whenever form changes
  useEffect(() => {
    if (!isOpen) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // Ignore storage errors
    }
  }, [formData, isOpen]);

  // Reset when modal closes
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSubmitted(false);
      setShowCreateAccount(false);
      setSaveError("");
      setFormData({ ...EMPTY_FORM });
    }, 400);
  }, [onClose]);

  const toggleFocus = useCallback((id: StrategicFocus) => {
    setFormData((prev) => ({
      ...prev,
      strategicFocus: prev.strategicFocus.includes(id)
        ? prev.strategicFocus.filter((f) => f !== id)
        : [...prev.strategicFocus, id],
    }));
  }, []);

  const updateContact = useCallback(
    <K extends keyof Pick<FormData, "name" | "email" | "phone" | "country" | "nationality" | "situation">>(
      key: K,
      value: string
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleProgram = useCallback((slug: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPrograms: prev.selectedPrograms.includes(slug)
        ? prev.selectedPrograms.filter((s) => s !== slug)
        : [...prev.selectedPrograms, slug],
    }));
  }, []);

  // Score and rank programs based on user selections
  const rankedPrograms = useMemo(() => {
    const active = PROGRAMS.filter((p) => p.isActive);
    return active
      .map((p) => {
        let score = 0;

        // Budget fit (30 points)
        if (p.minInvestment <= formData.investmentAmount) score += 30;
        else if (p.minInvestment <= formData.investmentAmount * 1.5) score += 10;

        // Strategic focus alignment (up to 25 points each selected focus)
        const focusCount = formData.strategicFocus.length || 1;
        const focusWeight = 25 / focusCount; // distribute weight across selections
        if (formData.strategicFocus.includes("mobility")) score += (p.radarScores.travel_score / 100) * focusWeight;
        if (formData.strategicFocus.includes("tax")) score += (p.radarScores.tax_score / 100) * focusWeight;
        if (formData.strategicFocus.includes("family")) score += (p.radarScores.lifestyle_score / 100) * focusWeight;
        if (formData.strategicFocus.includes("assets")) score += (p.radarScores.cost_score / 100) * focusWeight;

        // Timeline alignment (15 points)
        if (formData.timeline === "immediate" && p.processingTimeMonths != null) {
          if (p.processingTimeMonths <= 6) score += 15;
          else if (p.processingTimeMonths <= 9) score += 8;
          else score += 2;
        } else if (formData.timeline === "strategic" && p.processingTimeMonths != null) {
          if (p.processingTimeMonths <= 12) score += 12;
          else score += 6;
        } else if (formData.timeline === "long-term") {
          // Long-term planners value lifestyle and passport strength
          score += (p.radarScores.lifestyle_score / 100) * 8;
          score += (p.radarScores.travel_score / 100) * 7;
        }

        // US citizen considerations (15 points)
        if (formData.isUsCitizen) {
          if (formData.consideringRenouncing) {
            // Considering renouncing — CBI programs are most valuable (new citizenship)
            if (p.type === "CBI") score += 15;
            else if (p.type === "Golden Visa") score += 8;
            // Tax-friendly jurisdictions matter post-renunciation
            score += (p.radarScores.tax_score / 100) * 10;
          } else {
            // US citizen NOT renouncing — can't get tax benefits anywhere
            // Focus on strategic value: mobility, lifestyle, asset diversification
            score += (p.radarScores.travel_score / 100) * 8;
            score += (p.radarScores.lifestyle_score / 100) * 7;
            // Deprioritise tax score since it won't help them
            // Pick the best strategic option instead
          }
        } else if (formData.isUsCitizen === false) {
          // Non-US citizens — tax optimization focus gets a full boost
          if (formData.strategicFocus.includes("tax") && p.radarScores.tax_score >= 80) {
            score += 15;
          }
        }

        // Featured/exclusive bonus
        if (p.featured) score += 3;
        if (p.exclusive) score += 2;

        return { program: p, score: Math.max(0, Math.min(score, 100)) };
      })
      .sort((a, b) => b.score - a.score);
  }, [formData.strategicFocus, formData.investmentAmount, formData.timeline, formData.isUsCitizen, formData.consideringRenouncing]);

  const canAdvance =
    step === 1
      ? formData.strategicFocus.length > 0
      : step === 2
      ? true
      : step === 3
      ? formData.timeline !== "" && formData.isUsCitizen !== null
      : step === 4
      ? formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.country.trim() !== "" &&
        formData.nationality.trim() !== "" &&
        formData.situation.trim() !== ""
      : formData.selectedPrograms.length > 0;

  const handleNext = async () => {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }

    // Step 5: final submission
    setSaveError("");

    if (user) {
      // Logged in — save directly, pass known user ID
      setIsSaving(true);
      try {
        await saveQualificationToDb(formData, rankedPrograms, user.id);
        // Clear draft from localStorage on successful save
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
        setSubmitted(true);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Not logged in — show create account form
      setShowCreateAccount(true);
    }
  };

  const handleAccountCreated = async () => {
    // User just created account and is now signed in — save their data
    setShowCreateAccount(false);
    setIsSaving(true);
    try {
      await saveQualificationToDb(formData, rankedPrograms);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      setSubmitted(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save after account creation.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextLabel =
    step === 1
      ? "Continue to Budget"
      : step === 2
      ? "Continue to Profile"
      : step === 3
      ? "Continue to Contact"
      : step === 4
      ? "View Recommendations"
      : isSaving
      ? "Saving..."
      : "Submit Qualification";

  const progress = (step / 5) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qualify-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(10,14,20,0.85)", backdropFilter: "blur(8px)" }}
          />

          {/* Panel */}
          <motion.div
            key="qualify-panel"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
          <div
            className="relative flex w-full max-w-5xl max-h-[92vh] min-h-[600px] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto border"
            style={{ background: "#10141a", borderColor: "rgba(69,71,75,0.3)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(69,71,75,0.3)" }}
              aria-label="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#c6c6cb" }}>close</span>
            </button>
            {/* ── Left Sidebar ──────────────────────────────────────────────── */}
            <div
              className="hidden w-1/3 flex-col justify-between overflow-y-auto p-8 lg:flex flex-shrink-0"
              style={{ borderRight: "1px solid rgba(69,71,75,0.3)" }}
            >
              <div className="flex flex-col gap-8">
                {/* Logo / brand mark */}
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: "#bbc4f7" }}
                  >
                    concierge
                  </span>
                  <span
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: "#bbc4f7", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    Concierge
                  </span>
                </div>

                {/* Main heading */}
                <div>
                  <h2
                    className="text-3xl font-semibold leading-tight"
                    style={{
                      color: "#dfe2eb",
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Define your jurisdictional objectives.
                  </h2>
                  <p
                    className="mt-4 text-sm leading-relaxed"
                    style={{ color: "#8f9095" }}
                  >
                    Our qualification process maps your sovereign wealth management goals to programmes with the highest alignment across legal, fiscal, and lifestyle parameters.
                  </p>
                </div>

                {/* Encrypted session card */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(10,14,20,0.8)",
                    border: "1px solid rgba(69,71,75,0.25)",
                    borderLeft: "3px solid #bbc4f7",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0"
                      style={{ fontSize: 18, color: "#bbc4f7" }}
                    >
                      shield
                    </span>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#bbc4f7" }}
                      >
                        Encrypted Session
                      </p>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "#8f9095" }}>
                        All data transmitted under AES-256 encryption. No retention beyond qualification review. Zero third-party sharing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Curator card */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(10,14,20,0.8)",
                    border: "1px solid rgba(69,71,75,0.25)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0"
                      style={{ fontSize: 18, color: "#c6c6cb" }}
                    >
                      concierge
                    </span>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#c6c6cb" }}
                      >
                        The Curator
                      </p>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "#8f9095" }}>
                        Your dedicated advisor who maps programmes to your profile. Responds within 24 hours, operates under NDA.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right Form Area ───────────────────────────────────────────── */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
              {/* Top bar */}
              <div
                className="flex shrink-0 items-center justify-between px-6 py-4 pr-16"
                style={{ borderBottom: "1px solid rgba(69,71,75,0.25)" }}
              >
                <div className="flex items-center gap-3 lg:hidden">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: "#bbc4f7" }}
                  >
                    concierge
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#bbc4f7", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    Qualification
                  </span>
                </div>
                <div className="hidden lg:block" />

                {/* Progress + close */}
                <div className="flex items-center gap-4">
                  {!submitted && (
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: "#8f9095",
                          fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                        }}
                      >
                        Step {step} of 5
                      </span>
                      <div
                        className="h-1 w-28 overflow-hidden rounded-full"
                        style={{ background: "rgba(69,71,75,0.4)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "#bbc4f7" }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success">
                      <SuccessState onClose={handleClose} />
                    </motion.div>
                  ) : showCreateAccount ? (
                    <motion.div
                      key="create-account"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col gap-6">
                        {saveInfo && (
                          <div
                            className="rounded-xl p-4 text-sm"
                            style={{
                              background: "rgba(187,196,247,0.1)",
                              border: "1px solid rgba(187,196,247,0.3)",
                              color: "#bbc4f7",
                            }}
                          >
                            {saveInfo}
                          </div>
                        )}
                        {saveError && (
                          <div
                            className="rounded-xl p-4 text-sm"
                            style={{
                              background: "rgba(184,92,107,0.1)",
                              border: "1px solid rgba(184,92,107,0.3)",
                              color: "#b85c6b",
                            }}
                          >
                            {saveError}
                          </div>
                        )}
                        <CreateAccountForm
                          defaultEmail={formData.email}
                          defaultName={formData.name}
                          onSuccess={handleAccountCreated}
                          onError={setSaveError}
                          onInfo={setSaveInfo}
                        />
                        <p className="text-center text-xs" style={{ color: "#8f9095" }}>
                          Already have an account?{" "}
                          <Link
                            href="/login"
                            className="font-semibold"
                            style={{ color: "#bbc4f7" }}
                          >
                            Sign in
                          </Link>
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`step-${step}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {step === 1 && (
                        <StepStrategicFocus
                          selected={formData.strategicFocus}
                          onToggle={toggleFocus}
                        />
                      )}
                      {step === 2 && (
                        <StepInvestment
                          amount={formData.investmentAmount}
                          onChange={(v) =>
                            setFormData((prev) => ({ ...prev, investmentAmount: v }))
                          }
                        />
                      )}
                      {step === 3 && (
                        <StepProfile
                          timeline={formData.timeline}
                          onTimelineChange={(v) => setFormData((prev) => ({ ...prev, timeline: v }))}
                          dependants={formData.dependants}
                          onDependantsChange={(v) => setFormData((prev) => ({ ...prev, dependants: v }))}
                          isUsCitizen={formData.isUsCitizen}
                          onUsCitizenChange={(v) => setFormData((prev) => ({ ...prev, isUsCitizen: v }))}
                          consideringRenouncing={formData.consideringRenouncing}
                          onRenouncingChange={(v) => setFormData((prev) => ({ ...prev, consideringRenouncing: v }))}
                        />
                      )}
                      {step === 4 && (
                        <StepContact
                          data={{
                            name: formData.name,
                            email: formData.email,
                            phone: formData.phone,
                            country: formData.country,
                            nationality: formData.nationality,
                            situation: formData.situation,
                          }}
                          onChange={updateContact}
                          constraints={formData.constraints}
                          onConstraintsToggle={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              constraints: prev.constraints.includes(v)
                                ? prev.constraints.filter((c) => c !== v)
                                : [...prev.constraints, v],
                            }))
                          }
                          constraintDetail={formData.constraintDetail}
                          onConstraintDetailChange={(v) => setFormData((prev) => ({ ...prev, constraintDetail: v }))}
                        />
                      )}
                      {step === 5 && (
                        <>
                          <StepRecommendations
                            ranked={rankedPrograms}
                            selected={formData.selectedPrograms}
                            onToggle={toggleProgram}
                          />
                          {saveError && (
                            <div
                              className="mt-4 rounded-xl p-4 text-sm"
                              style={{
                                background: "rgba(184,92,107,0.1)",
                                border: "1px solid rgba(184,92,107,0.3)",
                                color: "#b85c6b",
                              }}
                            >
                              {saveError}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation bar — hidden when showing create account or success */}
              {!submitted && !showCreateAccount && (
                <div
                  className="flex shrink-0 items-center justify-between gap-3 px-6 py-4"
                  style={{ borderTop: "1px solid rgba(69,71,75,0.25)" }}
                >
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150"
                      style={{
                        background: "rgba(69,71,75,0.15)",
                        border: "1px solid rgba(69,71,75,0.3)",
                        color: "#c6c6cb",
                        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "rgba(69,71,75,0.28)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "rgba(69,71,75,0.15)")
                      }
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        arrow_back
                      </span>
                      Previous Phase
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canAdvance || isSaving}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-150"
                    style={{
                      background: canAdvance && !isSaving ? "#bbc4f7" : "rgba(187,196,247,0.2)",
                      color: canAdvance && !isSaving ? "#242d58" : "rgba(36,45,88,0.5)",
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      cursor: canAdvance && !isSaving ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (canAdvance && !isSaving)
                        (e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa";
                    }}
                    onMouseLeave={(e) => {
                      if (canAdvance && !isSaving)
                        (e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7";
                    }}
                  >
                    {nextLabel}
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {step === 5 ? "check" : "arrow_forward"}
                    </span>
                  </button>
                  {!canAdvance && !isSaving && (
                    <p className="text-xs mt-2 text-right" style={{ color: "#b85c6b" }}>
                      {step === 1 && "Select at least one objective"}
                      {step === 3 && !formData.timeline && "Select a preferred timeline"}
                      {step === 3 && formData.timeline && formData.isUsCitizen === null && "Answer the US citizenship question"}
                      {step === 4 && "Please fill in all required fields (*)"}
                      {step === 5 && "Select at least one programme"}
                    </p>
                  )}
                </div>
              )}

              {/* Back button shown on create-account view */}
              {showCreateAccount && !submitted && (
                <div
                  className="flex shrink-0 items-center px-6 py-4"
                  style={{ borderTop: "1px solid rgba(69,71,75,0.25)" }}
                >
                  <button
                    type="button"
                    onClick={() => { setShowCreateAccount(false); setSaveError(""); }}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150"
                    style={{
                      background: "rgba(69,71,75,0.15)",
                      border: "1px solid rgba(69,71,75,0.3)",
                      color: "#c6c6cb",
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                    Back to Results
                  </button>
                </div>
              )}

              {/* Bottom status bar */}
              <div
                className="flex shrink-0 items-center justify-between px-6 py-2.5"
                style={{
                  background: "rgba(10,14,20,0.8)",
                  borderTop: "1px solid rgba(69,71,75,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Green pulse */}
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ background: "#3E8F78" }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ background: "#3E8F78" }}
                    />
                  </span>
                  <span className="text-xs" style={{ color: "rgba(143,144,149,0.6)" }}>
                    Secure Vault Connection Active
                  </span>
                </div>
                <div className="hidden items-center gap-3 text-xs sm:flex" style={{ color: "rgba(143,144,149,0.4)" }}>
                  <span>&copy; {new Date().getFullYear()} Concierge</span>
                  <Link
                    href="/privacy"
                    style={{ color: "rgba(143,144,149,0.5)", textDecoration: "underline" }}
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </motion.div>

          {/* Slider thumb styling — injected once per mount */}
          <style>{`
            .qualify-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 100%;
              background: transparent;
              cursor: pointer;
            }
            .qualify-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #bbc4f7;
              cursor: pointer;
              box-shadow: 0 0 0 4px rgba(187,196,247,0.15), 0 0 16px rgba(187,196,247,0.25);
              transition: box-shadow 0.15s;
            }
            .qualify-slider::-webkit-slider-thumb:hover {
              box-shadow: 0 0 0 6px rgba(187,196,247,0.2), 0 0 24px rgba(187,196,247,0.35);
            }
            .qualify-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border: none;
              border-radius: 50%;
              background: #bbc4f7;
              cursor: pointer;
              box-shadow: 0 0 0 4px rgba(187,196,247,0.15), 0 0 16px rgba(187,196,247,0.25);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
