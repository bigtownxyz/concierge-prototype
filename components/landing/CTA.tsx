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
    <section ref={ref} className="py-24 bg-[#0D0D1A]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="font-semibold text-white">Ready to Start</span>{" "}
          <span className="font-light text-white/50 italic">Your Journey?</span>
        </motion.h2>

        <motion.p
          className="text-base font-light text-white/50 max-w-xl mx-auto mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Take our free qualification assessment and discover which citizenship
          and residency programmes match your profile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        >
          <Link
            href="/qualify"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-all duration-200 active:scale-[0.97]"
          >
            Get Qualified Free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        <motion.p
          className="mt-6 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Free &middot; No commitment &middot; Results in 2 minutes
        </motion.p>
      </div>
    </section>
  );
}
