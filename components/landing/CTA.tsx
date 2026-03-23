"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative overflow-hidden rounded-[2rem] border border-white/[0.06]"
        >
          {/* Multi-layer gradient background */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(107,92,231,0.12), transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(201,168,76,0.08), transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(59,47,149,0.06), transparent 60%),
              linear-gradient(135deg, rgba(26,24,48,0.98), rgba(17,16,28,0.98))
            `
          }} />

          {/* Animated border glow */}
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-[2rem] opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(107,92,231,0.3), transparent 40%, transparent 60%, rgba(201,168,76,0.2))",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />

          {/* Grain texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] rounded-[2rem]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
            }}
          />

          <div className="relative z-10 p-12 sm:p-16 lg:p-20 text-center">
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-luxury/70 mb-6"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Start Your Journey
            </motion.p>

            <motion.h2
              className="heading-display text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.05] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
            >
              Ready to secure your{" "}
              <span className="bg-gradient-to-r from-luxury via-[#E8D48B] to-luxury bg-clip-text text-transparent">
                global future
              </span>
              ?
            </motion.h2>

            <motion.p
              className="text-text-muted text-lg max-w-xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Take our 2-minute qualification assessment and discover which
              programmes match your profile, budget, and goals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
            >
              <Link
                href="/qualify"
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-luxury via-[#D4B85E] to-luxury bg-[length:200%_100%] px-12 py-5 text-base font-semibold text-background transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-[0_0_50px_rgba(201,168,76,0.25)] hover:scale-[1.02]"
              >
                Check Your Eligibility
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-xs text-text-muted/40"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              Free &middot; No commitment &middot; Results in 2 minutes
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
