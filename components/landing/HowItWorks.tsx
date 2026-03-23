"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crosshair, MessageCircle, FileCheck, Award } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const steps = [
  {
    number: "01",
    icon: Crosshair,
    title: "Qualification",
    description:
      "Complete our intelligent matching tool. In 2 minutes, discover which programmes align with your goals, budget, and nationality.",
    accent: "from-primary/20 to-transparent",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Consultation",
    description:
      "Your dedicated advisor — a specialist in your target programmes — builds a bespoke strategy for your citizenship journey.",
    accent: "from-luxury/15 to-transparent",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Application",
    description:
      "We handle everything: document preparation, due diligence coordination, and government submissions. You focus on your life.",
    accent: "from-primary/20 to-transparent",
  },
  {
    number: "04",
    icon: Award,
    title: "Approval",
    description:
      "Receive your new citizenship or residency. Your second passport opens 150+ countries — and a world of possibilities.",
    accent: "from-luxury/15 to-transparent",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Subtle background asymmetric glow */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, rgba(107,92,231,0.06), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Header — left-aligned for editorial feel */}
        <div className="mb-20 max-w-xl">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-luxury/70 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            The Process
          </motion.p>
          <motion.h2
            className="heading-display text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            Four steps to your{" "}
            <span className="bg-gradient-to-r from-luxury via-[#E8D48B] to-luxury bg-clip-text text-transparent">
              second passport
            </span>
          </motion.h2>
        </div>

        {/* Steps — staggered asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
                ease: EASE,
              }}
              className={cn(
                "group relative rounded-2xl border border-white/[0.06] p-8 lg:p-10",
                "bg-white/[0.02] backdrop-blur-sm",
                "transition-all duration-500",
                "hover:bg-white/[0.04] hover:border-white/[0.1]",
                i % 2 === 1 && "md:mt-12"
              )}
            >
              {/* Corner gradient glow on hover */}
              <div
                className={cn(
                  "pointer-events-none absolute top-0 left-0 h-32 w-32 rounded-tl-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  `bg-gradient-to-br ${step.accent}`
                )}
              />

              {/* Step number — large, ghosted */}
              <div className="flex items-start justify-between mb-8">
                <span className="heading-display text-6xl lg:text-7xl font-bold text-white/[0.04] leading-none transition-colors duration-500 group-hover:text-primary/10">
                  {step.number}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20">
                  <step.icon className="h-5 w-5 text-text-muted transition-colors group-hover:text-primary" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mb-3 tracking-tight">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-text-muted/80">
                {step.description}
              </p>

              {/* Animated accent line */}
              <div className="mt-8 h-[1px] w-full overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/40 to-luxury/30"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + i * 0.15,
                    ease: EASE,
                  }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
