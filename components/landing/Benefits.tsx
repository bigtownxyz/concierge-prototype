"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  TrendingDown,
  Users,
  Zap,
  Lock,
} from "lucide-react";

const benefits = [
  {
    icon: Globe,
    title: "Global Mobility",
    description:
      "Access 150+ countries visa-free with a second passport. Travel, live, and work without borders.",
  },
  {
    icon: TrendingDown,
    title: "Tax Optimisation",
    description:
      "Legally reduce your tax burden with territorial tax systems and zero-income-tax jurisdictions.",
  },
  {
    icon: Shield,
    title: "Asset Protection",
    description:
      "Shield your wealth from political instability, litigation, and economic uncertainty.",
  },
  {
    icon: Users,
    title: "Family Security",
    description:
      "Include your spouse, children, and parents. Secure your family's future across generations.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description:
      "Most programmes process in 3-6 months. Some offer citizenship in as little as 30 days.",
  },
  {
    icon: Lock,
    title: "Full Confidentiality",
    description:
      "Your application is handled with absolute discretion. We never share your information.",
  },
];

export function Benefits() {
  return (
    <section className="py-24 px-6 relative">
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(107,92,231,0.04), transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.03), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <h2 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
            Why Second Citizenship?
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            A second passport is the ultimate insurance policy for your
            freedom, wealth, and family
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.08,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group rounded-2xl bg-glass-bg border border-glass-border p-7 backdrop-blur-sm transition-all duration-300 hover:bg-glass-bg-hover hover:border-glass-border-hover"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <benefit.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
