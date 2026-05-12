import type { Metadata } from "next";
import Image from "next/image";
import { ShaderBackground } from "@/components/ui/shaders-hero-section";

/**
 * Coming-soon holding page.
 *
 * Served on thecitizenshipconcierge.com (and www.) via the hostname check in
 * `middleware.ts`. Lives outside the `[locale]` tree so next-intl never prefixes
 * it. The full app stays accessible at the existing concierge-proto.vercel.app
 * URL while this page fronts the public domain during soft launch.
 *
 * Visual language mirrors the LandingV2 hero — same ShaderBackground, same
 * eyebrow-pill pattern, same Manrope display scale + Instrument Serif italic
 * accent — so a visitor arriving via either entry point reads as one brand.
 *
 * To flip the switch when ready: delete the `HOLDING_HOSTS` block in
 * `middleware.ts`. The middleware change alone makes the domain serve the
 * real site.
 */

export const metadata: Metadata = {
  title: "Concierge — Citizenship by design",
  description:
    "Concierge — discreet citizenship and residency advisory for high-net-worth individuals. Launching soon.",
  robots: {
    index: false,
    follow: false,
  },
};

const DISPLAY_FONT = {
  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
} as const;

const SERIF_ITALIC = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.02em",
};

export default function ComingSoonPage() {
  return (
    <ShaderBackground>
      <main className="absolute inset-0 z-20 flex items-center justify-center px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Wordmark — the dominant element. Logo is the brand moment;
              everything below it is supporting copy. */}
          <Image
            src="/logo.svg"
            alt="Concierge"
            width={958}
            height={160}
            className="h-9 w-auto sm:h-11 md:h-12"
            priority
          />

          {/* Tagline — Manrope + Instrument Serif italic accent. Deliberately
              sized below the logo so the wordmark stays the primary read. */}
          <p
            className="mt-7 text-[clamp(1.35rem,2.4vw,1.85rem)] leading-tight tracking-[-0.02em] text-[#dfe2eb] sm:mt-8"
            style={DISPLAY_FONT}
          >
            Citizenship by <span style={SERIF_ITALIC}>design.</span>
          </p>

          {/* Eyebrow pill — same pattern as the LandingV2 hero. Smallest
              element in the stack; reads as a quiet status footnote. */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#bbc4f7]/20 bg-[#23233A]/70 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#bbc4f7] sm:mt-8">
            <span className="h-2 w-2 rounded-full bg-[#bbc4f7]" />
            Launching soon
          </div>
        </div>
      </main>
    </ShaderBackground>
  );
}
