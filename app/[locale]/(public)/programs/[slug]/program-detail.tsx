"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { type Program } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { RadarChart } from "@/components/shared/RadarChart";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Globe,
  TrendingUp,
} from "lucide-react";

export function ProgramDetail({ program }: { program: Program }) {
  return (
    <div className="py-12 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Back link */}
        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All Programmes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl">{program.flagEmoji}</span>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="heading-display text-3xl sm:text-4xl text-text-primary">
                      {program.name}
                    </h1>
                    {program.exclusive && (
                      <span className="rounded-full bg-luxury/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-luxury">
                        Exclusive
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted">
                    {program.country} &middot; {program.type}
                  </p>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-glass-bg border border-glass-border p-4">
                  <TrendingUp className="h-4 w-4 text-luxury/60 mb-2" />
                  <p className="text-lg font-semibold text-text-primary">
                    {program.minInvestment === 0
                      ? "No minimum"
                      : formatCurrency(program.minInvestment)}
                  </p>
                  <p className="text-xs text-text-muted">Minimum investment</p>
                </div>
                <div className="rounded-xl bg-glass-bg border border-glass-border p-4">
                  <Clock className="h-4 w-4 text-primary/60 mb-2" />
                  <p className="text-lg font-semibold text-text-primary">
                    {program.processingTimeMonths
                      ? `${program.processingTimeMonths} months`
                      : "Varies"}
                  </p>
                  <p className="text-xs text-text-muted">Processing time</p>
                </div>
                <div className="rounded-xl bg-glass-bg border border-glass-border p-4">
                  <Globe className="h-4 w-4 text-primary/60 mb-2" />
                  <p className="text-lg font-semibold text-text-primary">
                    {program.visaFreeCount ?? "N/A"}
                  </p>
                  <p className="text-xs text-text-muted">Visa-free countries</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Overview
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {program.description}
                </p>
              </div>

              {/* Radar chart */}
              <div className="mb-8 rounded-2xl bg-glass-bg border border-glass-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Programme Profile
                </h2>
                <RadarChart scores={program.radarScores} size="lg" />
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Key Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {program.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-2.5 rounded-xl bg-glass-bg border border-glass-border p-3.5"
                    >
                      <Check className="h-4 w-4 shrink-0 text-luxury mt-0.5" />
                      <span className="text-sm text-text-secondary">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {program.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-center gap-2.5 text-sm text-text-muted"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Sticky sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-2xl bg-glass-bg border border-glass-border p-6 backdrop-blur-xl"
              >
                <h3 className="heading-display text-xl text-text-primary mb-2">
                  Interested in {program.country}?
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  Check if you qualify for this programme with our free
                  assessment tool.
                </p>
                <Link
                  href="/qualify"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-luxury py-3.5 text-sm font-semibold text-background transition-all hover:bg-luxury-hover hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                >
                  Check Eligibility
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-text-muted/50">
                  Free &middot; 2 minutes &middot; No commitment
                </p>

                {/* Quick facts */}
                <div className="mt-6 pt-6 border-t border-glass-border space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Type</span>
                    <span className="text-text-primary font-medium">
                      {program.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Region</span>
                    <span className="text-text-primary font-medium capitalize">
                      {program.region.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Currency</span>
                    <span className="text-text-primary font-medium">
                      {program.currency}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
