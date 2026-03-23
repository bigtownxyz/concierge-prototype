"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-glass-border p-12 sm:p-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(107,92,231,0.08) 0%, rgba(17,16,28,0.95) 50%, rgba(201,168,76,0.06) 100%)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(ellipse, rgba(107,92,231,0.2), transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <h2 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
              Ready to Begin?
            </h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto mb-10">
              Take our 2-minute qualification assessment and discover which
              citizenship and residency programmes match your profile.
            </p>
            <Link
              href="/qualify"
              className="inline-flex items-center gap-2.5 rounded-xl bg-luxury px-10 py-4 text-base font-semibold text-background transition-all duration-300 hover:bg-luxury-hover hover:shadow-[0_0_30px_rgba(201,168,76,0.25)] hover:scale-[1.02]"
            >
              Check Your Eligibility
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-xs text-text-muted/50">
              Free &middot; No commitment &middot; Results in 2 minutes
            </p>
          </div>

          {/* Bottom decorative glow */}
          <div
            className="pointer-events-none absolute -bottom-20 right-0 h-40 w-60 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(ellipse, rgba(201,168,76,0.15), transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
