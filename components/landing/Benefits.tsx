"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, TrendingDown, Shield, Users, Zap, Lock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const benefits = [
  { icon: Globe, title: "Global Mobility", description: "Access 150+ countries visa-free with a second passport. Travel, live, and work without borders." },
  { icon: TrendingDown, title: "Tax Optimisation", description: "Legally reduce your tax burden with territorial tax systems and zero-income-tax jurisdictions." },
  { icon: Shield, title: "Asset Protection", description: "Shield your wealth from political instability, litigation, and economic uncertainty." },
  { icon: Users, title: "Family Security", description: "Include your spouse, children, and parents. Secure your family's future across generations." },
  { icon: Zap, title: "Fast Processing", description: "Most programmes process in 3–6 months. Some offer citizenship in as little as 30 days." },
  { icon: Lock, title: "Full Confidentiality", description: "Your application is handled with absolute discretion. We never share your information." },
];

export function Benefits() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-navy relative">
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            <span className="font-semibold text-white">Why Choose</span>{" "}
            <span className="font-light text-white/50 italic">Concierge</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EASE }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <benefit.icon className="h-6 w-6 text-white/70" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm font-light text-white/60 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
