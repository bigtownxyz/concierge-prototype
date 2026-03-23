"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Cubic bezier ease shared across animations
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Qualification",
    description:
      "Complete our smart matching tool to find programmes that fit your profile.",
  },
  {
    number: "02",
    title: "Consultation",
    description:
      "Speak with a dedicated advisor who specialises in your target programmes.",
  },
  {
    number: "03",
    title: "Application",
    description:
      "We handle the paperwork, due diligence, and government submissions.",
  },
  {
    number: "04",
    title: "Approval",
    description:
      "Receive your new citizenship or residency — typically within 3–12 months.",
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_OUT_EXPO,
      delay: i * 0.15,
    },
  }),
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: Step;
  index: number;
  inView: boolean;
}

function StepCard({ step, index, inView }: StepCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative flex-1",
        "bg-glass-bg border border-glass-border rounded-2xl p-6",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-glass-border-hover hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      )}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={cardVariants}
    >
      {/* Subtle inner glass highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Step number */}
        <span
          className={cn(
            "heading-display block text-5xl leading-none select-none",
            "text-primary/20",
            "transition-[color,text-shadow] duration-300",
            "group-hover:text-primary/40",
            "group-hover:[text-shadow:0_0_24px_rgba(107,92,231,0.5)]"
          )}
          aria-hidden="true"
        >
          {step.number}
        </span>

        {/* Title */}
        <h3 className="mt-4 text-lg font-semibold text-text-primary">
          {step.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Connector line (desktop only)
// ---------------------------------------------------------------------------

function Connector({ inView, delay }: { inView: boolean; delay: number }) {
  return (
    <motion.div
      className="hidden lg:block w-8 shrink-0 self-center"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      style={{ originX: 0 }}
      aria-hidden="true"
    >
      <div
        className="h-px w-full"
        style={{ background: "rgba(107, 92, 231, 0.2)" }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HowItWorks
// ---------------------------------------------------------------------------

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Heading block */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={headingVariants}
        >
          <h2 className="heading-display text-4xl text-text-primary">
            How It Works
          </h2>
          <p className="mt-3 text-text-muted">
            From first consultation to passport in hand
          </p>
        </motion.div>

        {/* Steps row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="contents lg:flex lg:flex-1 lg:items-stretch">
              <StepCard step={step} index={i} inView={inView} />
              {/* Connector between cards — not after the last one */}
              {i < STEPS.length - 1 && (
                <Connector inView={inView} delay={i * 0.15 + 0.4} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
