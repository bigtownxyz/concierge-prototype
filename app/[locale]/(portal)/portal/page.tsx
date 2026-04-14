import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalDashboardClient } from "./portal-dashboard-client";

export default async function PortalDashboardPage({
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

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch qualification + matched programs
  const { data: qualification } = await supabase
    .from("qualifications")
    .select(
      `
      id,
      strategic_focus,
      investment_amount,
      timeline,
      dependants,
      situation,
      updated_at,
      qualification_programs (
        program_slug,
        match_score
      )
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .maybeSingle();

  return (
    <PortalDashboardClient
      user={{
        id: user.id,
        email: user.email ?? "",
        full_name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "",
        phone: profile?.phone ?? "",
        country: profile?.country ?? "",
        nationality: profile?.nationality ?? "",
      }}
      qualification={
        qualification
          ? {
              id: qualification.id,
              strategic_focus: qualification.strategic_focus ?? [],
              investment_amount: qualification.investment_amount ?? 500_000,
              timeline: qualification.timeline ?? null,
              dependants: qualification.dependants ?? null,
              situation: qualification.situation ?? "",
              updated_at: qualification.updated_at,
              programs: (qualification.qualification_programs ?? []) as {
                program_slug: string;
                match_score: number;
              }[],
            }
          : null
      }
    />
  );
}
