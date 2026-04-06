"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Scale, KeyRound } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const steps = [
  {
    icon: Search,
    phase: "Phase 01",
    title: "Eligibility Audit",
    description: "A comprehensive review of your financial standing, background check compliance, and strategic objectives to determine the optimal jurisdiction.",
    iconBg: "#020c37",
    iconColor: "#bbc4f7",
  },
  {
    icon: Scale,
    phase: "Phase 02",
    title: "Legal Synthesis",
    description: "Our elite legal team handles all documentation, local governmental liaisons, and investment structuring to ensure a frictionless application process.",
    iconBg: "#374667",
    iconColor: "#b7c6ed",
  },
  {
    icon: KeyRound,
    phase: "Phase 03",
    title: "Final Issuance",
    description: "Secure delivery of your residency credentials or passport, followed by full orientation into your new jurisdiction's fiscal and social infrastructure.",
    iconBg: "#180f08",
    iconColor: "#d6c3b7",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10" style={{ backgroundColor: "#10141a" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h2
            className="text-4xl mb-6"
            style={{ fontFamily: "var(--font-noto-serif, 'Noto Serif', serif)", color: "#dfe2eb" }}
          >
            The Three-Step Protocol
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
          >
            A rigorous, confidential methodology designed to transition you to your new sovereign state with surgical precision.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div
            className="hidden lg:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
            style={{
              background: "linear-gradient(to right, transparent, rgba(69, 71, 75, 0.3), transparent)",
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative z-10 p-10 rounded-3xl transition-transform duration-300 hover:-translate-y-2"
                style={{
                  backgroundColor: "#10141a",
                  border: "1px solid rgba(69, 71, 75, 0.1)",
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: EASE }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                  style={{ backgroundColor: step.iconBg }}
                >
                  <step.icon className="h-8 w-8" style={{ color: step.iconColor }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block"
                  style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#d6c3b7" }}
                >
                  {step.phase}
                </span>
                <h3
                  className="text-2xl mb-4"
                  style={{ fontFamily: "var(--font-noto-serif, 'Noto Serif', serif)", color: "#dfe2eb" }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
