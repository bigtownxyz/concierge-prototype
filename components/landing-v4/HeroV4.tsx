"use client";

/* HeroV4 — "Cinematic & quiet" alternative hero for /landing-v4.
   One full-bleed dusk photograph, a graded near-black wash, a restrained
   two-line headline and a single primary action. A deliberate counterpoint
   to the busy editorial V2 hero. Swapped into LandingV2Page through its
   `hero` slot, so every section below the hero is left untouched. */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { OpenQualifyButton } from "@/components/landing-v2/OpenQualifyButton";

const EASE = [0.22, 1, 0.36, 1] as const;
const SANS = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
const SERIF = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
  letterSpacing: "-0.012em",
};

export function HeroV4() {
  const reduceMotion = useReducedMotion() ?? false;

  // Staggered load: each element rises and fades in on mount.
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.95, delay, ease: EASE },
        };

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden border-b border-white/8 bg-[#0b0a14]">
      {/* Full-bleed photograph */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 1.5, ease: EASE }}
      >
        {/* Slow cinematic drift (ken-burns) */}
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? undefined : { scale: [1, 1.07] }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 28,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }
          }
        >
          <Image
            src="/images/programs/portugal.jpg"
            alt="The Douro riverfront in Porto, Portugal, at dusk"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[58%_44%]"
          />
        </motion.div>
      </motion.div>

      {/* Cinematic grade: bottom lift, left wash, top scrim, vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#0b0a14] via-[#0b0a14]/55 via-40% to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#0b0a14]/92 via-[#0b0a14]/30 via-44% to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0b0a14]/80 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 240px 64px rgba(6,5,13,0.72)" }}
      />

      {/* Inset matte frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[clamp(0.85rem,1.5vw,1.7rem)] rounded-[5px] border border-white/[0.09]"
      />

      {/* Content, anchored lower-left */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-[clamp(3.75rem,7vw,6.25rem)] pt-[clamp(7rem,14vh,11rem)] lg:px-8">
        <div className="max-w-[53rem]">
          <motion.div {...rise(0.12)} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
            <span
              className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#bbc4f7]"
              style={SANS}
            >
              Private advisory for global mobility
            </span>
          </motion.div>

          <h1 className="mt-7 text-[clamp(2.9rem,7.2vw,6rem)] leading-[0.95] tracking-[-0.042em]">
            <motion.span
              {...rise(0.24)}
              className="block text-[#f4f6fb]"
              style={SANS}
            >
              Some borders are
            </motion.span>
            <motion.span
              {...rise(0.36)}
              className="block text-[#c8cdf2]"
              style={SERIF}
            >
              worth crossing.
            </motion.span>
          </h1>

          <motion.p
            {...rise(0.52)}
            className="mt-7 max-w-[45ch] text-[1.02rem] leading-8 text-[#c6c6cb] sm:text-[1.1rem] sm:leading-9"
            style={SANS}
          >
            Concierge designs discreet, compliant routes to second citizenship
            and residency, built around your life, not the other way around.
          </motion.p>

          <motion.div
            {...rise(0.64)}
            className="mt-9 flex flex-col items-start gap-x-8 gap-y-4 sm:flex-row sm:items-center"
          >
            <OpenQualifyButton className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#bbc4f7] px-7 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-colors duration-300 hover:bg-[#cdd4fa]">
              Begin qualification
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </OpenQualifyButton>
            <Link
              href="/programs"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#dfe2eb] transition-colors duration-300 hover:text-white"
            >
              Explore programmes
              <ArrowUpRight className="h-4 w-4 text-[#bbc4f7] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        {...rise(0.96)}
        className="absolute bottom-[clamp(2rem,4vw,3.25rem)] right-[clamp(1.6rem,4vw,3.25rem)] z-10 hidden flex-col items-center gap-3 sm:flex"
      >
        <span
          className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-[#8f9095] [writing-mode:vertical-rl]"
          style={SANS}
        >
          Scroll
        </span>
        <span className="relative h-11 w-px overflow-hidden bg-white/12">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent to-[#bbc4f7]"
            animate={reduceMotion ? undefined : { y: [-16, 44] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 2, repeat: Infinity, ease: "easeIn" }
            }
          />
        </span>
      </motion.div>
    </section>
  );
}
