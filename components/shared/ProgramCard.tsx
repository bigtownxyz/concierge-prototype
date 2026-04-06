"use client";

import { Link } from "@/i18n/navigation";
import { type Program } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowRight, Clock, Globe, TrendingUp } from "lucide-react";

interface ProgramCardProps {
  program: Program;
  className?: string;
}

const radarLabels: Record<string, string> = {
  cost_score: "Cost",
  speed_score: "Speed",
  lifestyle_score: "Life",
  tax_score: "Tax",
  travel_score: "Travel",
};

export function ProgramCard({ program, className }: ProgramCardProps) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn(
        "group block rounded-2xl bg-glass-bg border border-glass-border p-6 backdrop-blur-xl",
        "transition-all duration-300",
        "hover:bg-glass-bg-hover hover:border-glass-border-hover hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
                    <div>
            <h3 className="text-base font-semibold text-text-primary group-hover:text-white transition-colors">
              {program.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{program.country}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {program.featured && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Featured
            </span>
          )}
          {program.exclusive && (
            <span className="rounded-full bg-luxury/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-luxury">
              Exclusive
            </span>
          )}
        </div>
      </div>

      {/* Investment badge */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-luxury/70" />
          <span className="text-sm font-semibold text-text-primary">
            {program.minInvestment === 0
              ? "No minimum"
              : `From ${formatCurrency(program.minInvestment)}`}
          </span>
        </div>
        {program.processingTimeMonths && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-text-muted/50" />
            <span className="text-xs text-text-muted">
              {program.processingTimeMonths} months
            </span>
          </div>
        )}
        {program.visaFreeCount && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-text-muted/50" />
            <span className="text-xs text-text-muted">
              {program.visaFreeCount} visa-free
            </span>
          </div>
        )}
      </div>

      {/* Radar mini chart  - 5 labeled bars */}
      <div className="space-y-1.5 mb-5">
        {Object.entries(program.radarScores).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-10 text-[10px] text-text-muted/60 uppercase tracking-wider">
              {radarLabels[key]}
            </span>
            <div className="flex-1 h-1 rounded-full bg-glass-border overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  value > 80
                    ? "bg-luxury/60"
                    : value > 50
                      ? "bg-primary/50"
                      : "bg-text-muted/30"
                )}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-6 text-right text-[10px] text-text-muted/40 tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Marketing hook */}
      <p className="text-xs leading-relaxed text-text-muted line-clamp-2 mb-4">
        {program.marketingHook}
      </p>

      {/* Learn more */}
      <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Learn more <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
