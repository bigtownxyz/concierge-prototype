import type { Metadata } from "next";
import { ProgramsGrid } from "./programs-grid";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Explore citizenship by investment, golden visa, and residency programmes worldwide. Compare costs, processing times, and benefits.",
  openGraph: {
    title: "Explore Programmes | Concierge",
    description:
      "Discover citizenship and residency options across 15+ countries.",
  },
};

export default function ProgramsPage() {
  return (
    <div className="py-12 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
            Explore Programmes
          </h1>
          <p className="text-lg text-text-muted max-w-2xl">
            Discover citizenship and residency options worldwide. Filter by
            region, investment level, and programme type.
          </p>
        </div>

        {/* Client-side filterable grid */}
        <ProgramsGrid />
      </div>
    </div>
  );
}
