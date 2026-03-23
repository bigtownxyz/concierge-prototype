import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="heading-display text-4xl text-text-primary mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed space-y-4">
          <p>Last updated: March 2026</p>
          <p>Concierge takes your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email, phone number, nationality, and financial information relevant to your citizenship or residency application.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">How We Use Your Information</h2>
          <p>Your information is used solely for the purpose of evaluating your eligibility, processing your application, and communicating with you about your case. We never sell your data to third parties.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Data Security</h2>
          <p>All data is encrypted in transit and at rest. We use industry-standard security measures to protect your information. Access is restricted to authorised advisors only.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-8">Contact</h2>
          <p>For privacy-related enquiries, contact us at privacy@concierge.app.</p>
        </div>
      </div>
    </div>
  );
}
