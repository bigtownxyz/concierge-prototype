import type { Metadata } from "next";
import Image from "next/image";
import {
  ShaderBackground,
  PulsingCircle,
} from "@/components/ui/shaders-hero-section";

/**
 * Coming-soon holding page.
 *
 * Served on thecitizenshipconcierge.com (and www.) via the hostname check in
 * `middleware.ts`. Lives outside the `[locale]` tree so next-intl never prefixes
 * it. The full app stays accessible at the existing concierge-proto.vercel.app
 * URL while this page fronts the public domain during soft launch.
 *
 * To flip the switch when ready: delete the `HOLDING_HOSTS` block in
 * `middleware.ts` (and optionally this file). The middleware change alone is
 * enough to make the domain serve the real site.
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

export default function ComingSoonPage() {
  return (
    <ShaderBackground>
      <PulsingCircle />

      <main className="absolute inset-0 z-20 flex items-center justify-center px-6">
        <div className="text-center max-w-3xl mx-auto">
          {/* Wordmark — the brand IS the message */}
          <Image
            src="/logo.svg"
            alt="Concierge"
            width={958}
            height={160}
            className="mx-auto h-16 w-auto sm:h-20 md:h-24"
            priority
          />

          {/* Hairline divider */}
          <div className="mx-auto mt-10 h-px w-16 bg-white/15" />

          {/* Tagline — Instrument Serif italic, restrained */}
          <p
            className="mt-10 text-2xl sm:text-3xl md:text-4xl font-normal italic leading-tight text-white/85"
            style={{
              fontFamily:
                "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
              letterSpacing: "-0.015em",
            }}
          >
            Citizenship by design.
          </p>

          {/* Eyebrow — small Manrope caps */}
          <p
            className="mt-12 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#bbc4f7]"
            style={{
              fontFamily: "var(--font-manrope), Manrope, sans-serif",
            }}
          >
            Launching soon
          </p>
        </div>
      </main>
    </ShaderBackground>
  );
}
