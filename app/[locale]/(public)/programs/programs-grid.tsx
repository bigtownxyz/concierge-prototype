"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROGRAMS, REGIONS } from "@/lib/constants";
import { ProgramCard } from "@/components/shared/ProgramCard";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const types = ["All", "CBI", "Golden Visa", "Residency", "Trust"] as const;

export function ProgramsGrid() {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState("all");
  const [activeType, setActiveType] = useState<string>("All");

  const filtered = useMemo(() => {
    return PROGRAMS.filter((p) => {
      if (!p.isActive) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.country.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeRegion !== "all" && p.region !== activeRegion) return false;
      if (activeType !== "All" && p.type !== activeType) return false;
      return true;
    });
  }, [search, activeRegion, activeType]);

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted/50" />
          <input
            type="text"
            placeholder="Search programmes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-glass-bg border border-glass-border py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Region + type filters */}
        <div className="flex flex-wrap gap-2">
          {/* Region pills */}
          <button
            onClick={() => setActiveRegion("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              activeRegion === "all"
                ? "bg-primary text-white"
                : "bg-glass-bg border border-glass-border text-text-muted hover:text-text-primary"
            )}
          >
            All Regions
          </button>
          {REGIONS.filter(r => r.value !== "global").map((region) => (
            <button
              key={region.value}
              onClick={() => setActiveRegion(region.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                activeRegion === region.value
                  ? "bg-primary text-white"
                  : "bg-glass-bg border border-glass-border text-text-muted hover:text-text-primary"
              )}
            >
              {region.emoji} {region.label}
            </button>
          ))}

          <div className="w-px h-6 bg-glass-border self-center mx-1" />

          {/* Type pills */}
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                activeType === type
                  ? "bg-luxury/15 text-luxury border border-luxury/30"
                  : "bg-glass-bg border border-glass-border text-text-muted hover:text-text-primary"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mb-6">
        {filtered.length} programme{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeRegion}-${activeType}-${search}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((program, i) => (
            <motion.div
              key={program.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <ProgramCard program={program} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-text-muted">
            No programmes match your filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
}
