import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS, PROGRAMME_GUIDES, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/shared/JsonLd";
import { ProgrammeGuide } from "@/components/programs/ProgrammeGuide";
import { FeeBreakdown } from "@/components/programs/FeeBreakdown";
import { ProgramDetail } from "./program-detail";

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic";

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

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);

  if (!program) notFound();

  const programUrl = `${SITE_URL}/programs/${program.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: program.name,
    serviceType: program.type,
    description: program.description,
    url: programUrl,
    areaServed: program.country,
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      priceCurrency: program.currency,
      price: program.minInvestment,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Programs", item: `${SITE_URL}/programs` },
      { "@type": "ListItem", position: 3, name: program.name, item: programUrl },
    ],
  };

  // Additive long-form guide, rendered only for programmes that have one.
  const guide = PROGRAMME_GUIDES[program.slug];

  const schema: Record<string, unknown>[] = [serviceSchema, breadcrumbSchema];
  if (guide) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return (
    <>
      <JsonLd data={schema} />
      <ProgramDetail program={program} />
      {guide ? (
        // Full guide (includes the fee breakdown in its costs slot)
        <ProgrammeGuide program={program} guide={guide} />
      ) : (
        // Every other programme still gets the transparent fee breakdown
        <FeeBreakdown program={program} />
      )}
    </>
  );
}
