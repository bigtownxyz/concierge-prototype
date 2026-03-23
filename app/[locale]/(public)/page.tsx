import {
  Hero,
  TrustBar,
  HowItWorks,
  Benefits,
  ProgramsShowcase,
  Testimonials,
  FAQ,
  CTA,
} from "@/components/landing";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Benefits />
      <ProgramsShowcase />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
