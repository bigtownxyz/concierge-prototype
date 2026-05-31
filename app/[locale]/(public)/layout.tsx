import { PreviewShell } from "@/components/landing-v2/PreviewShell";
import { QualifyModalGlobal } from "@/components/shared/QualifyModalGlobal";
import { ApplyModalGlobal } from "@/components/shared/ApplyModalGlobal";
import { JsonLd } from "@/components/shared/JsonLd";
import { SITE_URL } from "@/lib/constants";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Concierge",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  description:
    "Second citizenship and residency advisory for high-net-worth individuals and families: second passports, golden visas, and tax-optimised residency.",
  areaServed: "Worldwide",
  serviceType: [
    "Citizenship by investment",
    "Residency by investment",
    "Golden visa advisory",
    "Asset protection",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Concierge",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ zoom: 0.88 }}>
      <JsonLd data={[organizationSchema, websiteSchema]} />
      <PreviewShell>{children}</PreviewShell>
      <QualifyModalGlobal />
      <ApplyModalGlobal />
    </div>
  );
}
