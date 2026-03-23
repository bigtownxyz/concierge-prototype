"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { PROGRAMS, REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Clock, Globe, TrendingUp } from "lucide-react";

const allRegionOption = { value: "all" as const, label: "All", emoji: "🌍" };

export function ProgramsShowcase() {
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const filtered =
    activeRegion === "all"
      ? PROGRAMS.filter((p) => p.featured)
      : PROGRAMS.filter((p) => p.region === activeRegion);

  const displayPrograms = filtered.slice(0, 6);

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
            Explore Programmes
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Discover citizenship and residency options across the globe
          </p>
        </div>

        {/* Region tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[allRegionOption, ...REGIONS.filter(r => r.value !== "global")].map((region) => (
            <button
              key={region.value}
              onClick={() => setActiveRegion(region.value)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                activeRegion === region.value
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(107,92,231,0.25)]"
                  : "bg-glass-bg border border-glass-border text-text-muted hover:text-text-primary hover:border-glass-border-hover"
              )}
            >
              <span className="mr-1.5">{region.emoji}</span>
              {region.label}
            </button>
          ))}
        </div>

        {/* Program grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRegion}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayPrograms.map((program, i) => (
              <motion.div
                key={program.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/programs/${program.slug}`}
                  className="group block rounded-2xl bg-glass-bg border border-glass-border p-6 backdrop-blur-xl transition-all duration-300 hover:bg-glass-bg-hover hover:border-glass-border-hover hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{program.flagEmoji}</span>
                      <div>
                        <h3 className="text-base font-semibold text-text-primary group-hover:text-white transition-colors">
                          {program.name}
                        </h3>
                        <p className="text-xs text-text-muted">{program.country}</p>
                      </div>
                    </div>
                    {program.exclusive && (
                      <span className="rounded-full bg-luxury/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-luxury">
                        Exclusive
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <TrendingUp className="h-3 w-3 text-primary/60" />
                      <span>
                        {program.minInvestment === 0
                          ? "No min"
                          : formatCurrency(program.minInvestment)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3 w-3 text-primary/60" />
                      <span>{program.processingTimeMonths}mo</span>
                    </div>
                    {program.visaFreeCount && (
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Globe className="h-3 w-3 text-primary/60" />
                        <span>{program.visaFreeCount} countries</span>
                      </div>
                    )}
                  </div>

                  {/* Radar mini-bar */}
                  <div className="flex gap-1 mb-4">
                    {Object.entries(program.radarScores).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex-1 h-1 rounded-full bg-glass-border overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full bg-primary/50"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Hook */}
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {program.marketingHook}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-lg border border-glass-border px-6 py-3 text-sm font-medium text-text-muted transition-all hover:border-glass-border-hover hover:text-text-primary hover:bg-glass-bg"
          >
            View All Programmes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
