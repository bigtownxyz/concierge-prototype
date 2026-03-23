"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Globe,
  TrendingDown,
  Shield,
  Users,
  Zap,
  Lock,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const benefits = [
  {
    icon: Globe,
    title: "Global Mobility",
    description: "150+ countries visa-free",
  },
  {
    icon: TrendingDown,
    title: "Tax Optimisation",
    description: "Zero income tax jurisdictions",
  },
  {
    icon: Shield,
    title: "Asset Protection",
    description: "Shield wealth from instability",
  },
  {
    icon: Users,
    title: "Family Security",
    description: "Include spouse, children, parents",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Citizenship in as little as 30 days",
  },
  {
    icon: Lock,
    title: "Confidentiality",
    description: "Absolute discretion guaranteed",
  },
];

export function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-32"
      style={{ backgroundColor: "#1A1830" }}
    >
      {/* Subtle top border to delineate from adjacent sections */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row">

          {/* LEFT — Atmospheric stat panel */}
          <div className="relative lg:w-1/2 flex flex-col items-center justify-center py-20 lg:py-0 lg:pr-16">
            {/* Violet glow behind the stat */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div
                className="h-[420px] w-[420px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(107,92,231,0.10) 0%, transparent 70%)",
                }}
              />
            </div>

            {/* Noise grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              aria-hidden="true"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px",
              }}
            />

            {/* The massive stat */}
            <div className="relative z-10 text-center select-none">
              <motion.span
                className="heading-display block leading-none bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(8rem, 18vw, 14rem)",
                  backgroundImage:
                    "linear-gradient(135deg, #B8943F 0%, #C9A84C 40%, #E8D48B 70%, #C9A84C 100%)",
                }}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, ease: EASE }}
              >
                150+
              </motion.span>

              <motion.p
                className="mt-2 text-xl text-text-muted tracking-wide"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              >
                visa-free destinations
              </motion.p>
            </div>

            {/* Vertical divider on desktop */}
            <motion.div
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-3/4 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              style={{ transformOrigin: "center" }}
            />
          </div>

          {/* RIGHT — Benefits 2x3 grid */}
          <div className="lg:w-1/2 lg:pl-16 flex items-center">
            <div className="w-full grid grid-cols-2 gap-x-8 gap-y-10 lg:gap-x-12 lg:gap-y-12">
              {benefits.map((benefit, i) => {
                const BenefitIcon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    className="group flex flex-col gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.55,
                      delay: 0.15 + i * 0.09,
                      ease: EASE,
                    }}
                  >
                    {/* Icon — transitions to gold on hover */}
                    <BenefitIcon
                      className={cn(
                        "h-5 w-5 mb-1 transition-colors duration-300",
                        "text-primary/60 group-hover:text-[#C9A84C]"
                      )}
                    />

                    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                      {benefit.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-text-muted/70">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
