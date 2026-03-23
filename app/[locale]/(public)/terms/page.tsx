import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="heading-display text-4xl text-text-primary mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed space-y-4">
          <p>Last updated: March 2026</p>
          <p>By using Concierge, you agree to the following terms and conditions.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Advisory Services</h2>
          <p>Concierge provides advisory services for citizenship by investment and residency programmes. We do not guarantee the outcome of any application, as final decisions rest with the relevant government authorities.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Fees</h2>
          <p>Service fees are outlined in your engagement letter. Government fees, due diligence costs, and investment amounts are separate from our advisory fees and are payable directly to the relevant authorities or approved agents.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Confidentiality</h2>
          <p>We maintain strict confidentiality regarding all client information. Your data is never shared without your explicit consent, except where required by law or regulatory obligation.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Limitation of Liability</h2>
          <p>Concierge shall not be liable for any delays or rejections by government authorities. Our obligation is to provide professional advisory services and accurate submission of your application.</p>
        </div>
      </div>
    </div>
  );
}
