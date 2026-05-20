"use client";

import { createClient } from "@/lib/supabase/client";
import { claimPendingQualification } from "@/lib/supabase/qualification-claim";
import type { ApplyFormData } from "@/components/shared/ApplyForProgrammeModal";
import type { PendingQualification } from "@/lib/supabase/qualification-claim";

/**
 * Programme-first "Apply" submission pipeline.
 *
 * Mirrors the proven QualifyModal signup flow, but for a user who arrived with
 * intent (they chose programmes rather than being scored by the quiz). The
 * data shape maps cleanly onto the existing `pending_qualification` mechanism,
 * so persistence + email-confirmation resilience reuse the same /callback claim
 * path with zero schema changes:
 *   - strategicFocus is empty (programme-first, not focus-first)
 *   - programScores is empty (user-chosen, not algorithm-ranked) → claim
 *     defaults match_score to 50
 *   - selectedPrograms carries the chosen programmes
 */

export type ApplySignupResult =
  | { status: "session" }
  | { status: "confirm-email" }
  | { status: "existing-account" }
  | { status: "error"; message: string };

function toPendingQualification(data: ApplyFormData): PendingQualification {
  return {
    formData: {
      strategicFocus: [],
      investmentAmount: data.investmentAmount,
      timeline: data.timeline || "",
      dependants: data.familyMembers.length,
      familyMembers: data.familyMembers.map((m) => ({
        id: m.id,
        relation: m.relation,
        nationality: m.nationality,
        age: m.age,
      })),
      isUsCitizen: data.isUsCitizen,
      consideringRenouncing: data.isUsCitizen ? data.consideringRenouncing : null,
      constraints: data.constraints,
      constraintDetail: data.constraintDetail,
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      nationality: data.nationality,
      situation: data.situation,
      selectedPrograms: data.selectedProgrammes,
    },
    programScores: {},
    savedAt: new Date().toISOString(),
  };
}

// Fire-and-forget LC CRM push. Failures are logged but never thrown — a CRM
// outage must not block the applicant. Mirrors QualifyModal.pushQualificationToLcCrm.
function pushApplicationToLcCrm(data: ApplyFormData, signedUp: boolean, conciergeUserId?: string): void {
  fetch("/api/leads/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      country: data.country || null,
      nationality: data.nationality || null,
      qualification: {
        strategicFocus: [],
        investmentAmount: data.investmentAmount,
        timeline: data.timeline || null,
        familyMembers: data.familyMembers,
        dependants: data.familyMembers.length,
        isUsCitizen: data.isUsCitizen,
        consideringRenouncing: data.consideringRenouncing,
        constraints: data.constraints,
        constraintDetail: data.constraintDetail || null,
        situation: data.situation || null,
        selectedPrograms: data.selectedProgrammes,
        programScores: {},
      },
      signedUp,
      conciergeUserId: conciergeUserId ?? null,
      source: "enquiry",
    }),
  }).catch((err) => console.warn("[applySignup] LC CRM POST failed (non-fatal)", err));
}

/**
 * Logs the enquiry to the CRM at the contact step (before the account gate),
 * mirroring QualifyModal's step-4 POST so a lead is captured even if the
 * visitor abandons before creating an account. signedUp/conciergeUserId
 * reflect current auth (an already-signed-in user is logged as signed up).
 * Fire-and-forget.
 */
export async function logEnquiryToCrm(data: ApplyFormData): Promise<void> {
  let signedUp = false;
  let uid: string | undefined;
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (user) {
      signedUp = true;
      uid = user.id;
    }
  } catch {
    /* fail open — never block the user on a CRM/auth hiccup */
  }
  pushApplicationToLcCrm(data, signedUp, uid);
}

/**
 * Marks the latest CRM submission for this email as signed_up (PATCH), used
 * after account creation. The lead row was already created by the step-4
 * logEnquiryToCrm POST. Mirrors QualifyModal.markLcSignup. Fire-and-forget.
 */
export function markEnquirySignedUp(email: string, conciergeUserId?: string): void {
  fetch("/api/leads/intake", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ email, conciergeUserId: conciergeUserId ?? null }),
  }).catch((err) => console.warn("[applySignup] LC CRM PATCH failed (non-fatal)", err));
}

/**
 * Returning, already-signed-in user. They must NOT go through signUp (their
 * email already has an account → "existing account" error) nor the pending-
 * qualification claim (idempotent: it no-ops when a qualifications row already
 * exists). Instead, write directly and additively: upsert their qualification,
 * insert only programmes not already on it, refresh mutable profile fields.
 */
export async function persistAuthedApplication({
  data,
}: {
  data: ApplyFormData;
}): Promise<ApplySignupResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { status: "error", message: "Your session expired. Please sign in again." };
    }

    const qualFields = {
      investment_amount: data.investmentAmount,
      timeline: data.timeline || null,
      dependants: data.familyMembers.length,
      family_members: data.familyMembers,
      is_us_citizen: data.isUsCitizen,
      considering_renouncing: data.isUsCitizen ? data.consideringRenouncing : null,
      constraints: data.constraints,
      constraint_detail: data.constraintDetail || null,
      situation: data.situation || null,
    };

    const { data: existingQual } = await supabase
      .from("qualifications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let qualId: string;
    if (existingQual) {
      qualId = existingQual.id;
      await supabase
        .from("qualifications")
        .update({ ...qualFields, updated_at: new Date().toISOString() })
        .eq("id", qualId);
    } else {
      const { data: created, error: qErr } = await supabase
        .from("qualifications")
        .insert({ user_id: user.id, strategic_focus: [], ...qualFields })
        .select("id")
        .single();
      if (qErr || !created) {
        return { status: "error", message: "Couldn't save your enquiry. Please try again." };
      }
      qualId = created.id;
    }

    const { data: existingProgs } = await supabase
      .from("qualification_programs")
      .select("program_slug")
      .eq("qualification_id", qualId);
    const have = new Set(
      (existingProgs ?? []).map((r: { program_slug: string }) => r.program_slug)
    );
    const toAdd = data.selectedProgrammes.filter((s) => !have.has(s));
    if (toAdd.length > 0) {
      const { error: progErr } = await supabase.from("qualification_programs").insert(
        toAdd.map((slug) => ({
          qualification_id: qualId,
          program_slug: slug,
          match_score: 80,
        }))
      );
      if (progErr) {
        return {
          status: "error",
          message: "We saved your details but couldn't add every programme. Your advisor will confirm them.",
        };
      }
    }

    const profileUpdates: Record<string, string | null> = {};
    if (data.name) profileUpdates.full_name = data.name;
    if (data.phone) profileUpdates.phone = data.phone;
    if (data.country) profileUpdates.country = data.country;
    if (data.nationality) profileUpdates.nationality = data.nationality;
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      await supabase.from("profiles").update(profileUpdates).eq("id", user.id);
    }

    // The step-4 logEnquiryToCrm POST already logged this lead as signed up
    // (the user was authenticated), so no further CRM call is needed here.
    return { status: "session" };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Couldn't save your enquiry right now.",
    };
  }
}

/**
 * One-click "add this programme to my existing application" for a returning,
 * authed user. Skips the modal entirely — they already gave us everything.
 *
 * Returns "no-application" when the user has no qualification yet (caller
 * should fall back to the full enquire modal in that case).
 */
export async function addProgrammeToApplication(
  slug: string
): Promise<{ ok: true } | { ok: false; reason: "unauth" | "no-application" | "error"; message?: string }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "unauth" };

    const { data: qual } = await supabase
      .from("qualifications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!qual) return { ok: false, reason: "no-application" };

    const { data: existing } = await supabase
      .from("qualification_programs")
      .select("id")
      .eq("qualification_id", qual.id)
      .eq("program_slug", slug)
      .maybeSingle();
    if (existing) return { ok: true };

    const { error } = await supabase.from("qualification_programs").insert({
      qualification_id: qual.id,
      program_slug: slug,
      match_score: 80,
    });
    if (error) return { ok: false, reason: "error", message: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: "error",
      message: e instanceof Error ? e.message : "Could not add programme.",
    };
  }
}

/**
 * New (unauthenticated) user. Creates the account, signs in if possible,
 * persists the application via the pending_qualification metadata claimed at
 * /callback, and pushes the lead to the LC CRM.
 */
export async function submitApplicationSignup({
  data,
  locale,
  password,
}: {
  data: ApplyFormData;
  locale: string;
  password: string;
}): Promise<ApplySignupResult> {
  if (!data.name.trim() || !data.email.trim() || password.length < 8) {
    return { status: "error", message: "Please complete all fields. Password must be at least 8 characters." };
  }

  try {
    const supabase = createClient();
    // Reuse the quiz's proven callback target. Supabase only honours
    // emailRedirectTo URLs in its allowlist; the /results variant is
    // allowlisted and working, /application is not (Supabase falls
    // back to the Site URL → homepage). /results self-redirects enquiry users
    // to /application, so this lands them in the right place.
    const callbackPath = `/${locale}/callback?next=${encodeURIComponent(`/${locale}/results`)}`;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password,
      options: {
        data: {
          full_name: data.name,
          pending_qualification: toPendingQualification(data),
        },
        // Return the user to the SAME origin they signed up on, not
        // NEXT_PUBLIC_SITE_URL. That env points at the canonical/branded
        // domain (thecitizenshipconcierge.com) which is in soft-launch
        // holding mode — its middleware rewrites /callback to /coming-soon,
        // so the confirmation link would dead-end on the holding page and
        // the session/claim would never run. window.location.origin keeps
        // the user on the working app (e.g. the vercel.app URL). Once the
        // live domain leaves holding mode this still resolves to it.
        emailRedirectTo: `${window.location.origin}${callbackPath}`,
      },
    });

    if (error) {
      return { status: "error", message: error.message };
    }

    // Supabase signals "email already in use" by returning a user with an
    // empty `identities` array (anti-enumeration; no error thrown).
    const isExistingEmail =
      !!signUpData.user &&
      Array.isArray(signUpData.user.identities) &&
      signUpData.user.identities.length === 0;
    if (isExistingEmail) {
      return { status: "existing-account" };
    }

    // Try to establish a session immediately so the claim + redirect can run now.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    });

    if (signInError) {
      const msg = signInError.message?.toLowerCase() ?? "";
      if (msg.includes("confirm")) {
        // Account created; email confirmation required. The lead was already
        // logged by the step-4 logEnquiryToCrm POST; /callback's markSignupInLc
        // will flip it to signed_up after the user confirms their email.
        return { status: "confirm-email" };
      }
      if (msg.includes("invalid login")) {
        return { status: "existing-account" };
      }
      return { status: "error", message: signInError.message };
    }

    // Session established. Let it propagate before we read/write.
    await new Promise((r) => setTimeout(r, 1200));
    let {
      data: { user: verifiedUser },
    } = await supabase.auth.getUser();
    if (!verifiedUser) {
      await new Promise((r) => setTimeout(r, 1500));
      ({
        data: { user: verifiedUser },
      } = await supabase.auth.getUser());
    }

    // Immediate-session path skips /callback, so persist here exactly as the
    // callback does: bootstrap the profile, then claim the pending application.
    // claimPendingQualification is idempotent — safe even if /callback also runs.
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch("/api/profile/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session?.access_token,
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          nationality: data.nationality,
        }),
      });
    } catch (bootstrapError) {
      console.error("[applySignup] profile bootstrap failed", bootstrapError);
    }

    try {
      await claimPendingQualification(supabase);
    } catch (claimError) {
      console.error("[applySignup] claim pending application failed", claimError);
      return {
        status: "error",
        message: "Your account was created but we couldn't save your enquiry. Please contact us.",
      };
    }

    // Lead was already logged by the step-4 logEnquiryToCrm POST. This path
    // has no /callback (immediate session), so flip it to signed_up here.
    markEnquirySignedUp(data.email, verifiedUser?.id);
    return { status: "session" };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unable to create your account right now.",
    };
  }
}
