import type { Program } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

/**
 * Concierge fee model, benchmarked to CitizenX's transparent pricing:
 * service fee = 10% of government cost (contribution + government fees), with
 * due diligence and biometrics passed through at cost, presented as one all-in
 * number. See vault note 2026-05-31-citizenx-pricing-fee-model.
 *
 * We hold the government contribution per programme (program.minInvestment).
 * Exact government fees and due-diligence costs vary per case and are shown
 * "at cost", so the computed service fee is a floor ("from"): it rises once
 * government fees are added to the base and with additional dependants.
 */
export const CONCIERGE_FEE_RATE = 0.1;

export interface FeeLine {
  label: string;
  amount: string;
  note?: string;
  emphasis?: boolean;
  atCost?: boolean;
}

export interface FeeBreakdownResult {
  byConsultation: boolean;
  lines: FeeLine[];
  allInLabel: string;
  allInAmount: string;
  modelNote: string;
}

const MODEL_NOTE =
  "Our service fee is a flat 10% of government cost. Due diligence and biometrics are passed through at cost. Figures are for a single applicant and rise with government fees and additional dependants.";

export function feeBreakdown(program: Program): FeeBreakdownResult {
  const cur = program.currency;
  const inv = program.minInvestment;

  // No fixed government contribution (e.g. some residency / trust routes):
  // the fee is scoped on a per-case basis.
  if (!inv || inv <= 0) {
    return {
      byConsultation: true,
      lines: [
        { label: "Government cost", amount: "Varies by route", atCost: true },
        {
          label: "Concierge service fee",
          amount: "By consultation",
          emphasis: true,
          note: "10% of government cost",
        },
        { label: "Due diligence", amount: "at cost", atCost: true },
      ],
      allInLabel: "All-in",
      allInAmount: "By consultation",
      modelNote: MODEL_NOTE,
    };
  }

  const serviceFee = Math.round(inv * CONCIERGE_FEE_RATE);
  const allIn = inv + serviceFee;

  return {
    byConsultation: false,
    lines: [
      { label: "Government contribution", amount: formatCurrency(inv, cur) },
      {
        label: "Government fees",
        amount: "at cost",
        atCost: true,
        note: "submission, processing, passport",
      },
      {
        label: "Concierge service fee",
        amount: `from ${formatCurrency(serviceFee, cur)}`,
        emphasis: true,
        note: "10% of government cost",
      },
      {
        label: "Due diligence",
        amount: "at cost",
        atCost: true,
        note: "third-party background check",
      },
      { label: "Biometrics & courier", amount: "at cost", atCost: true },
    ],
    allInLabel: "Indicative all-in",
    allInAmount: `from ${formatCurrency(allIn, cur)}`,
    modelNote: MODEL_NOTE,
  };
}
