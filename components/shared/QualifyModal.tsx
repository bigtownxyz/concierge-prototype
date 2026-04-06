"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
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

interface FormData {
  strategicFocus: StrategicFocus[];
  investmentAmount: number;
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
  name: "",
  email: "",
  phone: "",
  country: "",
  nationality: "",
  situation: "",
  selectedPrograms: [],
};

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

const STEP_LABELS = ["Strategic Focus", "Target Deployment", "Contact Details", "Recommendations"];

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
          Planned Investment
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

function StepContact({
  data,
  onChange,
}: {
  data: Pick<FormData, "name" | "email" | "phone" | "country" | "nationality" | "situation">;
  onChange: <K extends keyof typeof data>(key: K, value: string) => void;
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
          label="Full Name"
          value={data.name}
          onChange={(v) => onChange("name", v)}
          placeholder="Your legal name"
        />
        <FormInput
          label="Email Address"
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
        <FormInput
          label="Country of Residence"
          value={data.country}
          onChange={(v) => onChange("country", v)}
          placeholder="Current residence"
        />
        <div className="sm:col-span-2">
          <FormInput
            label="Current Nationality"
            value={data.nationality}
            onChange={(v) => onChange("nationality", v)}
            placeholder="e.g. British, American, UAE"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold"
          style={{ color: "#8f9095", letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          Tell us about your situation
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
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

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

    // Small delay to ensure session propagates
    await new Promise((r) => setTimeout(r, 500));
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
          A senior advisor will review your profile and contact you within 24 hours via your preferred channel.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all duration-200"
        style={{
          background: "#bbc4f7",
          color: "#242d58",
          fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#cdd4fa")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#bbc4f7")}
      >
        Close
      </button>
    </motion.div>
  );
}

// ─── DB persistence helper ────────────────────────────────────────────────────

async function saveQualificationToDb(
  formData: FormData,
  rankedPrograms: { program: Program; score: number }[]
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Upsert profile details
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: formData.name || undefined,
      email: formData.email || user.email,
      phone: formData.phone || undefined,
      country: formData.country || undefined,
      nationality: formData.nationality || undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  // 2. Upsert qualification (one per user — replace existing)
  const { data: existingQual } = await supabase
    .from("qualifications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let qualId: string;

  if (existingQual) {
    await supabase
      .from("qualifications")
      .update({
        strategic_focus: formData.strategicFocus,
        investment_amount: formData.investmentAmount,
        situation: formData.situation || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingQual.id);
    qualId = existingQual.id;

    // Remove old program matches
    await supabase
      .from("qualification_programs")
      .delete()
      .eq("qualification_id", qualId);
  } else {
    const { data: newQual, error } = await supabase
      .from("qualifications")
      .insert({
        user_id: user.id,
        strategic_focus: formData.strategicFocus,
        investment_amount: formData.investmentAmount,
        situation: formData.situation || null,
      })
      .select("id")
      .single();

    if (error || !newQual) throw error ?? new Error("Failed to create qualification");
    qualId = newQual.id;
  }

  // 3. Insert selected program matches (with scores from ranked list)
  const programRows = formData.selectedPrograms.map((slug) => {
    const match = rankedPrograms.find((r) => r.program.slug === slug);
    return {
      qualification_id: qualId,
      program_slug: slug,
      match_score: match ? Math.round(match.score) : 0,
    };
  });

  if (programRows.length > 0) {
    await supabase.from("qualification_programs").insert(programRows);
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
        if (p.minInvestment <= formData.investmentAmount) score += 30;
        else if (p.minInvestment <= formData.investmentAmount * 1.5) score += 10;
        if (formData.strategicFocus.includes("mobility")) score += (p.radarScores.travel_score / 100) * 25;
        if (formData.strategicFocus.includes("tax")) score += (p.radarScores.tax_score / 100) * 25;
        if (formData.strategicFocus.includes("family")) score += (p.radarScores.lifestyle_score / 100) * 25;
        if (formData.strategicFocus.includes("assets")) score += (p.radarScores.cost_score / 100) * 25;
        if (p.featured) score += 5;
        if (p.exclusive) score += 3;
        return { program: p, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [formData.strategicFocus, formData.investmentAmount]);

  const canAdvance =
    step === 1
      ? formData.strategicFocus.length > 0
      : step === 2
      ? true
      : step === 3
      ? formData.name.trim() !== "" && formData.email.trim() !== ""
      : formData.selectedPrograms.length > 0;

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    // Step 4: final submission
    setSaveError("");

    if (user) {
      // Logged in — save directly
      setIsSaving(true);
      try {
        await saveQualificationToDb(formData, rankedPrograms);
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
      ? "Continue to Investment"
      : step === 2
      ? "Continue to Contact"
      : step === 3
      ? "View Recommendations"
      : isSaving
      ? "Saving..."
      : "Submit Qualification";

  const progress = (step / 4) * 100;

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
                        Step {step} of 4
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
                        />
                      )}
                      {step === 4 && (
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
                      {step === 4 ? "check" : "arrow_forward"}
                    </span>
                  </button>
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
