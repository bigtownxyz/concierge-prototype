import { PROGRAMS, type Program } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

// Shared types + helpers for the qualification quiz. Used by both the
// QualifyModal (legacy popup) and the dedicated /qualify page so the
// scoring logic and persistence pipeline stay in one place.

export type StrategicFocus = "mobility" | "tax" | "family" | "assets";
export type Timeline = "immediate" | "strategic" | "long-term";
export type FamilyRelation = "spouse" | "parent" | "sibling" | "child";

export interface FamilyMember {
  id: string;
  relation: FamilyRelation;
  nationality: string;
  age: number;
}

export interface QualifyFormData {
  strategicFocus: StrategicFocus[];
  investmentAmount: number;
  timeline: Timeline | "";
  dependants: number;
  familyMembers: FamilyMember[];
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

export const DRAFT_KEY = "concierge_qualification_draft";
export const AUTO_SELECT_TOP_N = 6;

export const EMPTY_FORM: QualifyFormData = {
  strategicFocus: [],
  investmentAmount: 500_000,
  timeline: "",
  dependants: 0,
  familyMembers: [],
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

export const STRATEGY_OPTIONS: {
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

export interface RankedProgram {
  program: Program;
  score: number;
}

export function rankPrograms(formData: QualifyFormData): RankedProgram[] {
  const active = PROGRAMS.filter((p) => p.isActive);
  return active
    .map((p) => {
      let score = 0;

      // Budget fit (30 points)
      if (p.minInvestment <= formData.investmentAmount) score += 30;
      else if (p.minInvestment <= formData.investmentAmount * 1.5) score += 10;

      // Strategic focus alignment (up to 25 points distributed across selections)
      const focusCount = formData.strategicFocus.length || 1;
      const focusWeight = 25 / focusCount;
      if (formData.strategicFocus.includes("mobility"))
        score += (p.radarScores.travel_score / 100) * focusWeight;
      if (formData.strategicFocus.includes("tax"))
        score += (p.radarScores.tax_score / 100) * focusWeight;
      if (formData.strategicFocus.includes("family"))
        score += (p.radarScores.lifestyle_score / 100) * focusWeight;
      if (formData.strategicFocus.includes("assets"))
        score += (p.radarScores.cost_score / 100) * focusWeight;

      // Timeline alignment (up to 15 points)
      if (formData.timeline === "immediate" && p.processingTimeMonths != null) {
        if (p.processingTimeMonths <= 6) score += 15;
        else if (p.processingTimeMonths <= 9) score += 8;
        else score += 2;
      } else if (formData.timeline === "strategic" && p.processingTimeMonths != null) {
        if (p.processingTimeMonths <= 12) score += 12;
        else score += 6;
      } else if (formData.timeline === "long-term") {
        score += (p.radarScores.lifestyle_score / 100) * 8;
        score += (p.radarScores.travel_score / 100) * 7;
      }

      // US citizenship considerations (up to 15 points)
      if (formData.isUsCitizen) {
        if (formData.consideringRenouncing) {
          if (p.type === "CBI") score += 15;
          else if (p.type === "Golden Visa") score += 8;
          score += (p.radarScores.tax_score / 100) * 10;
        } else {
          score += (p.radarScores.travel_score / 100) * 8;
          score += (p.radarScores.lifestyle_score / 100) * 7;
        }
      } else if (formData.isUsCitizen === false) {
        if (formData.strategicFocus.includes("tax") && p.radarScores.tax_score >= 80) {
          score += 15;
        }
      }

      if (p.featured) score += 3;
      if (p.exclusive) score += 2;

      return { program: p, score: Math.max(0, Math.min(score, 100)) };
    })
    .sort((a, b) => b.score - a.score);
}

// Fire-and-forget push to the LC CRM. Failures are logged but never thrown:
// a CRM outage must not block the user's flow.
export function pushQualificationToLcCrm(
  formData: QualifyFormData,
  rankedPrograms: RankedProgram[],
  signedUp: boolean,
  conciergeUserId?: string
): void {
  const programScores: Record<string, number> = {};
  for (const r of rankedPrograms) programScores[r.program.slug] = r.score;
  fetch("/api/leads/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      email: formData.email,
      name: formData.name,
      phone: formData.phone || null,
      country: formData.country || null,
      nationality: formData.nationality || null,
      qualification: {
        strategicFocus: formData.strategicFocus,
        investmentAmount: formData.investmentAmount,
        timeline: formData.timeline || null,
        familyMembers: formData.familyMembers,
        dependants: formData.dependants,
        isUsCitizen: formData.isUsCitizen,
        consideringRenouncing: formData.consideringRenouncing,
        constraints: formData.constraints,
        constraintDetail: formData.constraintDetail || null,
        situation: formData.situation || null,
        selectedPrograms: formData.selectedPrograms,
        programScores,
      },
      signedUp,
      conciergeUserId: conciergeUserId ?? null,
    }),
  }).catch((err) =>
    console.warn("[qualify-engine] LC CRM POST failed (non-fatal)", err)
  );
}

export function markLcSignup(email: string, conciergeUserId: string): void {
  fetch("/api/leads/intake", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ email, conciergeUserId }),
  }).catch((err) =>
    console.warn("[qualify-engine] LC CRM PATCH failed (non-fatal)", err)
  );
}

export async function saveQualificationToDb(
  formData: QualifyFormData,
  rankedPrograms: RankedProgram[],
  knownUserId?: string
): Promise<void> {
  const supabase = createClient();

  let userId = knownUserId;
  if (!userId) {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) console.error("[qualify-engine] Auth error:", authError);
    if (!data.user) throw new Error("Not authenticated — please try signing in again");
    userId = data.user.id;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const bootstrapResponse = await fetch("/api/profile/bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session?.access_token,
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      nationality: formData.nationality,
    }),
  });

  if (!bootstrapResponse.ok) {
    const bootstrapData = (await bootstrapResponse.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(
      bootstrapData?.error || "Failed to initialize your profile. Please try again."
    );
  }

  const { data: existingQual } = await supabase
    .from("qualifications")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingQual) {
    await supabase
      .from("qualification_programs")
      .delete()
      .eq("qualification_id", existingQual.id);

    await supabase.from("qualifications").delete().eq("id", existingQual.id);
  }

  const familyMembersPayload = formData.familyMembers ?? [];
  const { data: newQual, error: qualError } = await supabase
    .from("qualifications")
    .insert({
      user_id: userId,
      strategic_focus: formData.strategicFocus,
      investment_amount: formData.investmentAmount,
      timeline: formData.timeline || null,
      dependants: familyMembersPayload.length,
      family_members: familyMembersPayload,
      is_us_citizen: formData.isUsCitizen,
      considering_renouncing: formData.isUsCitizen
        ? formData.consideringRenouncing
        : null,
      constraints: formData.constraints,
      constraint_detail: formData.constraintDetail || null,
      situation: formData.situation || null,
    })
    .select("id")
    .single();

  if (qualError) {
    console.error("[qualify-engine] Qualification insert error:", qualError);
    throw new Error("Failed to save qualification: " + qualError.message);
  }
  if (!newQual) throw new Error("Failed to create qualification — no data returned");
  const qualId = newQual.id;

  const programRows = formData.selectedPrograms.map((slug) => {
    const match = rankedPrograms.find((r) => r.program.slug === slug);
    return {
      qualification_id: qualId,
      program_slug: slug,
      match_score: match ? Math.round(match.score) : 50,
    };
  });

  if (programRows.length > 0) {
    await supabase
      .from("qualification_programs")
      .delete()
      .eq("qualification_id", qualId);
    const { error: progError } = await supabase
      .from("qualification_programs")
      .insert(programRows);
    if (progError) {
      console.error("[qualify-engine] Programs insert error:", progError);
    }
  }
}
