import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Concierge  - expert second citizenship and residency advisory for high-net-worth individuals.",
};

export default function AboutPage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-6">
          About Concierge
        </h1>
        <div className="space-y-6 text-text-secondary text-base leading-relaxed">
          <p>
            Concierge is a boutique advisory firm specialising in citizenship by
            investment, golden visas, and strategic residency programmes for
            high-net-worth individuals and their families.
          </p>
          <p>
            Founded on the principle that global mobility is the ultimate form of
            freedom, we guide our clients through every step of the second
            citizenship journey  - from initial qualification to passport in hand.
          </p>
          <p>
            Our team of dedicated advisors has deep expertise across 15+
            programmes spanning the Caribbean, Europe, the Middle East, and
            beyond. We pride ourselves on discretion, efficiency, and a 98%
            success rate.
          </p>
          <h2 className="heading-display text-2xl text-text-primary pt-4">
            Our Approach
          </h2>
          <p>
            Every client receives a dedicated advisor who specialises in their
            target programmes. We handle all paperwork, due diligence
            coordination, and government submissions, ensuring a seamless
            experience from start to finish.
          </p>
          <p>
            We believe in transparency  - no hidden fees, no false promises. Our
            qualification tool gives you an honest assessment of your options
            before any commitment.
          </p>
        </div>
      </div>
    </div>
  );
}
