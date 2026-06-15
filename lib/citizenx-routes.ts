/**
 * Per-route, family-aware pricing MIRRORED FROM CITIZENX (verbatim all-in).
 *
 * Decision (2026-06-05, supersedes 2026-05-31): Concierge programme pages mirror
 * CitizenX's actual published per-route all-in totals (which bake in CitizenX's
 * own service fee), including family-composition bands, across every programme
 * CitizenX prices. Scope widened from the earlier 10-overlap-only decision.
 *
 * YMYL GATE: this data is competitor-sourced and NOT yet independently verified.
 * Every figure not directly confirmed this session carries `verified: false`,
 * and the UI renders a [VERIFY] marker. Nothing here ships to production until a
 * named credentialed advisor signs off the numbers. Stays on the preview branch.
 *
 * Sources: CitizenX cost calculators at citizenx.com/{slug}/cost (see `source`).
 * `verified: true` means confirmed against the live CitizenX page this session.
 */

export interface CitizenXFamilyIncrement {
  label: string;
  /** null = amount not yet captured (calculator-gated); renders as [VERIFY]. */
  amount: number | null;
}

export interface CitizenXRoute {
  name: string;
  status: "open" | "closed";
  /** Shown when status === "closed" (e.g. "No approved projects available"). */
  closedReason?: string;
  governmentContribution: number | null;
  governmentFees?: number | null;
  citizenxServiceFee?: number | null;
  /** CitizenX's verbatim all-in for the base composition (usually single/main applicant). */
  allIn: number | null;
  /** e.g. "Main applicant + up to 3 dependants". */
  baseComposition?: string;
  familyIncrements: CitizenXFamilyIncrement[];
  processing?: string;
  notes?: string;
  /** true once confirmed against the live CitizenX source this session. */
  verified: boolean;
}

export interface CitizenXProgramme {
  currency: string;
  source: string;
  retrieved: string;
  familyRules?: string;
  routes: CitizenXRoute[];
}

/** Keyed by Concierge programme slug. */
export const CITIZENX_ROUTES: Record<string, CitizenXProgramme> = {
  grenada: {
    currency: "USD",
    source: "https://citizenx.com/grenada/cost",
    retrieved: "2026-06-05",
    familyRules:
      "Spouse any age; children under 18; dependent children 18-30 (sworn affidavit); children 18+ with disability if fully supported; parents/grandparents (under 55 add USD 50,000); siblings 18+ single childless (USD 75,000); newborns may be added within 6 months of birth.",
    routes: [
      {
        name: "National Transformation Fund (NTF) donation",
        status: "open",
        baseComposition: "Main applicant + up to 3 dependants",
        governmentContribution: 235000,
        governmentFees: 15250,
        citizenxServiceFee: 25025,
        allIn: 275275,
        familyIncrements: [
          { label: "Each additional dependant", amount: 25000 },
          { label: "Dependent parent / grandparent (under 55)", amount: 50000 },
          { label: "Dependent sibling", amount: 75000 },
        ],
        processing: "5-7 months",
        verified: true,
      },
      {
        name: "Approved real estate",
        status: "open",
        baseComposition: "Main applicant + up to 3 dependants",
        governmentContribution: 50000,
        allIn: null,
        familyIncrements: [{ label: "Each additional dependant", amount: 25000 }],
        processing: "5-7 months",
        notes:
          "Property from USD 350,000 (sole) / USD 270,000 per share (shared), plus USD 50,000 government contribution. 5-year hold before resale.",
        verified: true,
      },
    ],
  },

  "antigua-and-barbuda": {
    currency: "USD",
    source: "https://citizenx.com/antigua-and-barbuda/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "National Development Fund (NDF) donation",
        status: "open",
        baseComposition: "Family of up to 4",
        governmentContribution: 230000,
        allIn: 274180,
        familyIncrements: [],
        processing: "3 months",
        notes: "Popular donation route.",
        verified: false,
      },
      {
        name: "University of the West Indies (UWI) Fund",
        status: "open",
        baseComposition: "Larger family",
        governmentContribution: 230000,
        allIn: 296180,
        familyIncrements: [],
        processing: "3 months",
        verified: false,
      },
      {
        name: "Approved real estate",
        status: "closed",
        closedReason: "No approved projects available currently.",
        governmentContribution: 300000,
        allIn: null,
        familyIncrements: [],
        verified: false,
      },
      {
        name: "Business investment",
        status: "open",
        governmentContribution: 1500000,
        allIn: null,
        familyIncrements: [],
        notes: "USD 1.5M sole, or USD 5M joint (min USD 400k per person). All-in by consultation.",
        verified: false,
      },
    ],
  },

  dominica: {
    currency: "USD",
    source: "https://citizenx.com/en/citizenship-investment/dominica/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Economic Diversification Fund (EDF) donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 200000,
        allIn: 232650,
        familyIncrements: [],
        processing: "3 months",
        notes: "Contribution rose to USD 200,000 on 8 June 2024.",
        verified: false,
      },
      {
        name: "Approved real estate",
        status: "open",
        governmentContribution: null,
        allIn: 345950,
        familyIncrements: [],
        processing: "3 months",
        notes: "Resell after 3 yrs (open market) / 5 yrs (to another investor).",
        verified: false,
      },
    ],
  },

  "st-kitts-and-nevis": {
    currency: "USD",
    source: "https://citizenx.com/st-kitts-and-nevis/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Sustainable Island State Contribution (SISC) donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 250000,
        allIn: 287766,
        familyIncrements: [],
        processing: "3 months",
        verified: false,
      },
      {
        name: "Approved real estate",
        status: "open",
        governmentContribution: 325000,
        allIn: 478830,
        familyIncrements: [],
        processing: "3 months",
        notes: "Condo USD 325k / single dwelling USD 600k; resell after 7 yrs.",
        verified: false,
      },
    ],
  },

  "st-lucia": {
    currency: "USD",
    source: "https://citizenx.com/saint-lucia/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "National Economic Fund (NEF) donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 240000,
        allIn: 275682,
        familyIncrements: [],
        processing: "3 months",
        notes: "Popular option.",
        verified: false,
      },
      {
        name: "Government bonds",
        status: "open",
        governmentContribution: null,
        allIn: 396682,
        familyIncrements: [],
        processing: "3 months",
        notes: "Non-interest-bearing government bonds.",
        verified: false,
      },
      {
        name: "Approved real estate",
        status: "closed",
        closedReason: "No approved projects available currently.",
        governmentContribution: 300000,
        allIn: null,
        familyIncrements: [],
        verified: false,
      },
    ],
  },

  vanuatu: {
    currency: "USD",
    source: "https://citizenx.com/vanuatu/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Development Support Programme (DSP) donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 130000,
        allIn: 157300,
        familyIncrements: [],
        processing: "2-3 months",
        notes: "Due diligence USD 5,000.",
        verified: false,
      },
      {
        name: "Capital Investment Immigration Plan (CIIP)",
        status: "open",
        governmentContribution: 165000,
        allIn: null,
        familyIncrements: [],
        processing: "2-3 months",
        notes: "USD 50k refundable after 4 yrs (net USD 115k); DD USD 8,000.",
        verified: false,
      },
    ],
  },

  "sao-tome": {
    currency: "USD",
    source: "https://citizenx.com/sao-tome-and-principe/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "National Transformation Fund donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 90000,
        allIn: 105325,
        familyIncrements: [{ label: "Family of 4 (total all-in)", amount: 100750 }],
        processing: "4-6 months",
        verified: false,
      },
    ],
  },

  "sierra-leone": {
    currency: "USD",
    source: "https://citizenx.com/sierra-leone/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Heritage donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 100000,
        allIn: 117700,
        familyIncrements: [],
        processing: "up to 60 days",
        notes: "Requires DNA proof of African ancestry.",
        verified: false,
      },
      {
        name: "Fast-track donation",
        status: "open",
        governmentContribution: 140000,
        allIn: 159500,
        familyIncrements: [],
        processing: "up to 90 days",
        notes: "Non-refundable contribution.",
        verified: false,
      },
      {
        name: "Permanent residency (1kg gold)",
        status: "open",
        governmentContribution: 65000,
        allIn: null,
        familyIncrements: [],
        processing: "40 days or less",
        notes: "Permanent residency, not citizenship. Gold vaulted 5 yrs. Fees from USD 65,000.",
        verified: false,
      },
    ],
  },

  "el-salvador": {
    currency: "USD",
    source: "https://citizenx.com/el-salvador/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Freedom Passport (BTC / USDT)",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 1000000,
        citizenxServiceFee: 21000,
        allIn: 1021000,
        familyIncrements: [],
        processing: "10-12 weeks",
        notes: "USD 1,000,000 in BTC or USDT. CitizenX fee ~USD 21,000 (~2%).",
        verified: false,
      },
    ],
  },

  serbia: {
    currency: "EUR",
    source: "https://citizenx.com/serbia/cost",
    retrieved: "2026-06-05",
    routes: [
      {
        name: "Company incorporation + donation",
        status: "open",
        baseComposition: "Single applicant",
        governmentContribution: 172500,
        governmentFees: 177500,
        citizenxServiceFee: 25000,
        allIn: 375000,
        familyIncrements: [],
        processing: "3 months",
        notes: "All-in = EUR 172,500 contribution + EUR 177,500 government + EUR 25,000 CitizenX.",
        verified: false,
      },
    ],
  },
};
