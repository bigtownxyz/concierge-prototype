import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationClient from "./application-client";

/**
 * Server-side guard for the application overview page.
 *
 * Auth and the quiz-vs-enquiry routing decision happen here, before any
 * client HTML is sent. A wrong-page visitor gets a 307 redirect instead of
 * the old client-side flicker. Mirrors the inverse guard in results/page.tsx.
 */
export default async function ApplicationPage({
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

  // Quiz users have a populated strategic_focus. Their canonical overview is
  // /results (radar scores + match analysis), not the enquiry application view.
  if (
    qual &&
    Array.isArray(qual.strategic_focus) &&
    qual.strategic_focus.length > 0
  ) {
    redirect(`/${locale}/results`);
  }

  return <ApplicationClient userId={user.id} />;
}
