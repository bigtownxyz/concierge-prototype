import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DdWizard, type DdSubmission } from "./DdWizard";

/**
 * Server entry for the DD wizard.
 *
 * - Verifies a session (middleware also gates this, but belt-and-braces here)
 * - Lazy-creates a due_diligence_submissions row if the applicant doesn't
 *   have one yet (first visit after invite)
 * - If already submitted, sends them to the thank-you page (read-only state)
 * - Otherwise renders the client wizard with the current row as initial state
 */

export const dynamic = "force-dynamic";

export default async function InitialDueDiligencePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/initial-due-diligence/login");
  }

  // Try to fetch an existing submission row.
  const { data: existing } = await supabase
    .from("due_diligence_submissions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let submission: DdSubmission | null = existing as DdSubmission | null;

  // Lazy-create on first visit. RLS policy "dd: applicant creates own
  // submission" enforces user_id = auth.uid().
  if (!submission) {
    const { data: created, error: createError } = await supabase
      .from("due_diligence_submissions")
      .insert({ user_id: user.id })
      .select("*")
      .single();
    if (createError) {
      // Race condition? Try a re-fetch — another tab may have created it.
      const { data: refetched } = await supabase
        .from("due_diligence_submissions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      submission = refetched as DdSubmission | null;
    } else {
      submission = created as DdSubmission;
    }
  }

  if (!submission) {
    // Shouldn't happen — surface a useful error rather than a blank page.
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "#10141a", color: "#dfe2eb" }}
      >
        Something went wrong loading your application. Please refresh and try
        again, or contact your advisor if this persists.
      </div>
    );
  }

  // Already submitted → read-only thank-you page.
  if (submission.submitted_at) {
    redirect("/initial-due-diligence/submitted");
  }

  return (
    <DdWizard
      initial={submission}
      userId={user.id}
      userEmail={user.email ?? ""}
    />
  );
}
