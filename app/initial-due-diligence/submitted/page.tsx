import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/shared/Logo";

/**
 * Thank-you page shown after a submission is finalized.
 *
 * Also serves as the read-only resting state — if an applicant comes back
 * after submitting, the wizard route redirects here. We confirm the
 * submitted_at timestamp before rendering so this page can't be reached
 * by anyone without an active, submitted application.
 */

export const dynamic = "force-dynamic";

export default async function DdSubmittedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/initial-due-diligence/login");

  const { data: row } = await supabase
    .from("due_diligence_submissions")
    .select("submitted_at, first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row || !row.submitted_at) {
    redirect("/initial-due-diligence");
  }

  const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ");

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "#10141a" }}
    >
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo size="sm" />
        </div>
        <div
          className="rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background: "rgba(28,32,38,0.8)",
            border: "1px solid rgba(69,71,75,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "rgba(62,143,120,0.12)",
              border: "1px solid rgba(62,143,120,0.3)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 32,
                color: "#3e8f78",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              check_circle
            </span>
          </div>

          <p
            className="mt-6 text-xs font-semibold uppercase"
            style={{
              color: "#bbc4f7",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              letterSpacing: "0.24em",
            }}
          >
            Submitted
          </p>
          <h1
            className="mt-3 text-2xl sm:text-3xl"
            style={{
              color: "#dfe2eb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Thank you{fullName ? `, ${fullName}` : ""}.
          </h1>
          <p
            className="mt-5 max-w-md mx-auto text-sm leading-7"
            style={{
              color: "#8f9095",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            Your initial due-diligence questionnaire has been received. Your
            advisor has been notified and will follow up with next steps,
            including any supporting documents required for the formal review.
          </p>
          <p
            className="mt-6 text-xs"
            style={{
              color: "#8f9095",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            Submitted at {new Date(row.submitted_at).toLocaleString("en-GB", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
