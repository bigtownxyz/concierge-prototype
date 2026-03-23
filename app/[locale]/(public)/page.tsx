import {
  Hero,
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
      <HowItWorks />
      <ProgramsShowcase />
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
