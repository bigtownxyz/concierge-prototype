"use client";

import Image from "next/image";
import { ShaderBackground } from "@/components/ui/shaders-hero-section";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
} as const;

const SERIF_ITALIC = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.02em",
};

export default function NewsletterPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0D0D1A", color: "#dfe2eb", ...DISPLAY_FONT }}
    >
      <ShaderBackground>
        <main className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
            <Image
              src="/logo.svg"
              alt="Concierge"
              width={958}
              height={160}
              className="mb-9 h-6 w-auto sm:h-7 md:h-8"
              priority
            />

            <h1
              className="text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.05] tracking-[-0.025em] text-[#f1f2f6]"
              style={DISPLAY_FONT}
            >
              Stay <span style={SERIF_ITALIC}>informed.</span>
            </h1>

            <p
              className="mt-6 max-w-md text-[clamp(1rem,1.3vw,1.1rem)] leading-relaxed text-[#c6c6cb]"
              style={DISPLAY_FONT}
            >
              Programme changes, jurisdictional updates, and our take on what
              actually matters for global mobility planning. Delivered when it
              warrants your attention.
            </p>

            <div className="mt-9 w-full">
              <NewsletterForm source="newsletter-page" variant="page" />
            </div>

            <p
              className="mt-8 max-w-md text-[0.7rem] uppercase tracking-[0.2em] text-[#6c6e74]"
              style={DISPLAY_FONT}
            >
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </main>
      </ShaderBackground>
    </div>
  );
}
