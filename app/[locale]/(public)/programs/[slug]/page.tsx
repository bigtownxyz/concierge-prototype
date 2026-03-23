import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS } from "@/lib/constants";
import { ProgramDetail } from "./program-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) return { title: "Programme Not Found" };

  return {
    title: program.name,
    description: program.description,
    openGraph: {
      title: `${program.name} | Concierge`,
      description: program.marketingHook,
    },
  };
}

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);

  if (!program) notFound();

  return <ProgramDetail program={program} />;
}
