import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import TaxRoadmapClient from "./tax-roadmap-client";

const TITLE = "Tax Roadmap Call : A personal plan to legally cut your tax";
const DESCRIPTION =
  "Book a 1:1 strategy call and walk away with a written tax roadmap built around your situation: relocation options, residency routes, day-count requirements and the trade-offs, all yours to keep. $500, one-off.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/tax-roadmap` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/tax-roadmap`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function TaxRoadmapPage() {
  return <TaxRoadmapClient />;
}
