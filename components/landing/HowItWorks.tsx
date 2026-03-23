"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Crosshair, MessageCircle, FileCheck, Award } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const steps = [
  { icon: Crosshair, title: "Qualification", description: "Complete our smart matching tool to find programmes that fit your profile, budget, and timeline." },
  { icon: MessageCircle, title: "Consultation", description: "Speak with a dedicated advisor who specialises in your target programmes and builds a bespoke strategy." },
  { icon: FileCheck, title: "Application", description: "We handle the paperwork, due diligence coordination, and government submissions. You focus on your life." },
  { icon: Award, title: "Approval", description: "Receive your new citizenship or residency — typically within 3–12 months. Passport in hand." },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — mixed-weight italic style */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            <span className="font-semibold text-foreground">How It</span>{" "}
            <span className="font-light text-foreground/50 italic">Works</span>
          </h2>
        </motion.div>

        {/* Steps — 4 column grid with connector line */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Desktop connector line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: EASE }}
            >
              {/* Icon box */}
              <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-card border border-border">
                <step.icon className="h-10 w-10 text-foreground/70" />
                {/* Step number badge */}
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
