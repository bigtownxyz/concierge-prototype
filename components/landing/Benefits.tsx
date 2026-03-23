"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Globe,
  TrendingDown,
  Users,
  Zap,
  Lock,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const benefits = [
  {
    icon: Globe,
    title: "Global Mobility",
    description:
      "Access 150+ countries visa-free. Travel, live, and work without borders.",
    stat: "150+",
    statLabel: "countries",
  },
  {
    icon: TrendingDown,
    title: "Tax Optimisation",
    description:
      "Legally reduce your tax burden with territorial tax systems and zero-income-tax jurisdictions.",
    stat: "0%",
    statLabel: "income tax",
  },
  {
    icon: Shield,
    title: "Asset Protection",
    description:
      "Shield your wealth from political instability, litigation, and economic uncertainty.",
    stat: "100%",
    statLabel: "legal",
  },
  {
    icon: Users,
    title: "Family Security",
    description:
      "Include your spouse, children, and parents. Secure your family's future.",
    stat: "4",
    statLabel: "generations",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description:
      "Most programmes process in 3-6 months. Some offer citizenship in 30 days.",
    stat: "30",
    statLabel: "days min",
  },
  {
    icon: Lock,
    title: "Full Confidentiality",
    description:
      "Absolute discretion. We never share your information with third parties.",
    stat: "100%",
    statLabel: "private",
  },
];

export function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(107,92,231,0.05), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(201,168,76,0.04), transparent 50%)",
        }}
      />

      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-20 max-w-xl">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/60 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Why Second Citizenship
          </motion.p>
          <motion.h2
            className="heading-display text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            The ultimate insurance for your{" "}
            <span className="text-primary">freedom</span>
          </motion.h2>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + i * 0.08,
                duration: 0.5,
                ease: EASE,
              }}
              className="group relative rounded-2xl border border-white/[0.05] p-7 bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] overflow-hidden"
            >
              {/* Large background stat */}
              <span className="absolute -bottom-2 -right-1 heading-display text-[80px] font-bold leading-none text-white/[0.02] transition-colors duration-500 group-hover:text-primary/[0.04] select-none">
                {benefit.stat}
              </span>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20">
                    <benefit.icon className="h-4.5 w-4.5 text-text-muted transition-colors group-hover:text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-text-muted/30">
                    {benefit.statLabel}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-2 tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-text-muted/70">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
