import type { SupabaseClient } from "@supabase/supabase-js";

export interface PendingFamilyMember {
  id: string;
  relation: "spouse" | "parent" | "sibling" | "child";
  nationality: string;
  age: number;
}

export interface PendingQualificationFormData {
  strategicFocus: string[];
  investmentAmount: number;
  timeline: string;
  dependants: number;
  familyMembers?: PendingFamilyMember[];
  isUsCitizen: boolean | null;
  consideringRenouncing: boolean | null;
  constraints: string[];
  constraintDetail: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  nationality: string;
  situation: string;
  selectedPrograms: string[];
}

export interface PendingQualification {
  formData: PendingQualificationFormData;
  programScores: Record<string, number>;
  savedAt: string;
}

/**
 * Persists a pending qualification stored in `user_metadata.pending_qualification`
 * to the qualifications + qualification_programs tables, then clears the metadata.
 *
 * Idempotent: if the user already has a qualifications row, the metadata is
 * cleared without overwriting existing data. Returns true if a new
 * qualification was persisted, false otherwise.
 */
export async function claimPendingQualification(
  supabase: SupabaseClient
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const pending = (user.user_metadata?.pending_qualification ?? null) as
    | PendingQualification
    | null;
  if (!pending) return false;

  const { data: existingQual } = await supabase
    .from("qualifications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingQual) {
    await supabase.auth.updateUser({
      data: { pending_qualification: null },
    });
    return false;
  }

  const { formData, programScores } = pending;

  const familyMembersPayload = formData.familyMembers ?? [];
  const { data: newQual, error: qualError } = await supabase
    .from("qualifications")
    .insert({
      user_id: user.id,
      strategic_focus: formData.strategicFocus,
      investment_amount: formData.investmentAmount,
      timeline: formData.timeline || null,
      dependants: familyMembersPayload.length || formData.dependants,
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

  if (qualError || !newQual) {
    throw new Error(
      "Failed to claim pending qualification: " +
        (qualError?.message ?? "no data returned")
    );
  }

  if (formData.selectedPrograms.length > 0) {
    const programRows = formData.selectedPrograms.map((slug) => ({
      qualification_id: newQual.id,
      program_slug: slug,
      match_score: Math.round(programScores[slug] ?? 50),
    }));
    const { error: progError } = await supabase
      .from("qualification_programs")
      .insert(programRows);
    if (progError) {
      console.error(
        "[claimPendingQualification] qualification_programs insert error:",
        progError
      );
    }
  }

  const profileUpdates: Record<string, string | null> = {};
  if (formData.phone) profileUpdates.phone = formData.phone;
  if (formData.country) profileUpdates.country = formData.country;
  if (formData.nationality) profileUpdates.nationality = formData.nationality;
  if (Object.keys(profileUpdates).length > 0) {
    profileUpdates.updated_at = new Date().toISOString();
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", user.id);
    if (profileError) {
      console.error(
        "[claimPendingQualification] profile update error:",
        profileError
      );
    }
  }

  await supabase.auth.updateUser({
    data: { pending_qualification: null },
  });

  return true;
}
