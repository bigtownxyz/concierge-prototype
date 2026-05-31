import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/shared/JsonLd";
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

  return (
    <>
      <JsonLd data={[serviceSchema, breadcrumbSchema]} />
      <ProgramDetail program={program} />
    </>
  );
}
