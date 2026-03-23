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
    borderAccent: "border-primary/30",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Consultation",
    description:
      "Your dedicated advisor — a specialist in your target programmes — builds a bespoke strategy for your citizenship journey.",
    borderAccent: "border-primary/20",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Application",
    description:
      "We handle everything: document preparation, due diligence coordination, and government submissions. You focus on your life.",
    borderAccent: "border-luxury/25",
  },
  {
    number: "04",
    icon: Award,
    title: "Approval",
    description:
      "Receive your new citizenship or residency. Your second passport opens 150+ countries — and a world of possibilities.",
    borderAccent: "border-luxury/30",
  },
];

function ProcessStep({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[number];
  index: number;
  isInView: boolean;
}) {
  const StepIcon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.25 + index * 0.13, ease: EASE }}
    >
      {/* Step card */}
      <div
        className={cn(
          "relative pl-8 py-10 border-l-2",
          step.borderAccent
        )}
      >
        {/* Oversized watermark number */}
        <span
          className="heading-display absolute top-0 right-4 select-none leading-none pointer-events-none"
          style={{
            fontSize: "120px",
            color: "rgba(255,255,255,0.03)",
            lineHeight: 1,
          }}
        >
          {step.number}
        </span>

        {/* Icon circle */}
        <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
          <StepIcon className="h-5 w-5 text-text-muted" />
        </div>

        {/* Content */}
        <div className="relative z-10 pr-16">
          <h3 className="text-xl font-semibold text-text-primary mb-3 tracking-tight">
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-text-muted/80">
            {step.description}
          </p>
        </div>
      </div>

      {/* Connector line between steps */}
      {index < steps.length - 1 && (
        <motion.div
          className="w-[1px] h-16 mx-auto bg-gradient-to-b from-primary/20 to-luxury/20"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.5,
            delay: 0.5 + index * 0.13,
            ease: EASE,
          }}
          style={{ transformOrigin: "top" }}
        />
      )}
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Ambient glow — top right */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[700px] h-[700px] opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(107,92,231,0.05), transparent 65%)",
        }}
      />
      {/* Ambient glow — bottom left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, rgba(184,148,63,0.04), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:gap-24">

          {/* LEFT — Sticky heading block */}
          <div className="lg:w-2/5 mb-16 lg:mb-0">
            <div className="lg:sticky lg:top-32">
              <motion.p
                className="text-[11px] font-medium uppercase tracking-[0.3em] text-luxury/70 mb-6"
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, ease: EASE }}
              >
                THE PROCESS
              </motion.p>

              <motion.h2
                className="heading-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] text-text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
              >
                Four steps to your{" "}
                <br className="hidden lg:block" />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #B8943F, #C9A84C, #E8D48B)",
                  }}
                >
                  second passport
                </span>
              </motion.h2>

              {/* Decorative rule below heading */}
              <motion.div
                className="mt-10 h-[1px] w-16 bg-gradient-to-r from-luxury/40 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </div>

          {/* RIGHT — Scrolling steps */}
          <div className="lg:w-3/5">
            {steps.map((step, i) => (
              <ProcessStep
                key={step.number}
                step={step}
                index={i}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
