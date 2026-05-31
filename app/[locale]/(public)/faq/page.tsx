import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/JsonLd";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about second citizenship, citizenship by investment, golden visas, and residency by investment.",
};

/**
 * Visible Q&A on this page. The FAQPage schema below is built from the same
 * array, so the structured data always matches what is rendered.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "What is citizenship by investment?",
    a: "Citizenship by investment (CBI) lets you acquire a second citizenship, and a passport, by making a qualifying economic contribution to a country, usually a government donation or an approved real-estate purchase. Most CBI programmes do not require you to live in or relocate to the country.",
  },
  {
    q: "What is a golden visa or residency by investment?",
    a: "A golden visa grants legal residency in a country in exchange for a qualifying investment. It can lead to permanent residency and, in some countries, eventual citizenship. Physical-presence requirements vary widely between programmes, from almost none to several months per year.",
  },
  {
    q: "How long does the process take?",
    a: "It depends on the programme. Several Caribbean citizenship programmes complete in roughly three to six months, while European golden visas and naturalisation routes can take longer. We give you a realistic timeline for your shortlisted programmes during qualification.",
  },
  {
    q: "How much do I need to invest?",
    a: "Entry points start from around USD 200,000 for some Caribbean citizenship routes and rise from there depending on the country, the route (donation versus real estate), and family size. We match you to programmes that fit your budget before you commit to anything.",
  },
  {
    q: "Can I include my family?",
    a: "Yes. Most programmes let you include a spouse and dependent children, and many extend to parents and, in some cases, siblings. Adding dependants changes the total cost, which we factor into your assessment up front.",
  },
  {
    q: "Will I have to relocate or live there?",
    a: "Usually not for citizenship by investment, which is one of its main attractions. Residency programmes vary: some require only a short visit, others a minimum number of days per year. We flag the presence requirement for every programme we recommend.",
  },
  {
    q: "How will this affect my taxes?",
    a: "A second citizenship or residency does not by itself change your tax residency, and obtaining one does not automatically create a tax liability in the new country. Tax outcomes depend on your personal circumstances and where you are tax-resident. We coordinate with qualified tax advisers rather than giving tax advice ourselves.",
  },
  {
    q: "Is my information kept confidential?",
    a: "Yes. Discretion is central to how we work. Your information is handled confidentially throughout the process and shared only where required to progress your application.",
  },
  {
    q: "How does the Concierge process work?",
    a: "Seven stages: qualification, onboarding and advisor assignment, document collection, due diligence, submission to the relevant government, government review, and finally approval and issuance. You have a dedicated advisor throughout.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="py-16 px-6">
      <JsonLd data={faqSchema} />
      <div className="mx-auto max-w-3xl">
        <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-6">
          Frequently asked questions
        </h1>
        <p className="text-text-secondary text-base leading-relaxed mb-10">
          Common questions about second citizenship, golden visas, and residency
          by investment. For anything specific to your situation, start with a
          qualification or get in touch.
        </p>
        <div className="space-y-8">
          {FAQS.map((item) => (
            <div key={item.q}>
              <h2 className="heading-display text-xl text-text-primary mb-2">
                {item.q}
              </h2>
              <p className="text-text-secondary text-base leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
