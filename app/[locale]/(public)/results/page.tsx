import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResultsClient from "./results-client";

/**
 * Server-side guard for the quiz results page.
 *
 * Auth and the enquiry-vs-quiz routing decision happen here, before any
 * client HTML is sent. A wrong-page visitor gets a 307 redirect instead of
 * the old client-side flicker (spinner, then router.replace in a useEffect).
 * Mirrors the inverse guard in application/page.tsx.
 */
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: qual } = await supabase
    .from("qualifications")
    .select("strategic_focus")
    .eq("user_id", user.id)
    .maybeSingle();

  // Enquiry users (programme-first flow) have an empty strategic_focus.
  // /results is the quiz destination; their overview lives at /application.
  if (qual && (!qual.strategic_focus || qual.strategic_focus.length === 0)) {
    redirect(`/${locale}/application`);
  }

  return <ResultsClient userId={user.id} />;
}
