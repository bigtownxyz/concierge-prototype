"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const font = "var(--font-manrope, 'Manrope', sans-serif)";

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { user } = useUser();
  const [hasQualification, setHasQualification] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("qualifications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setHasQualification(true); });
  }, [user]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.5, ease: EASE },
  });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10" style={{ backgroundColor: "#0d1018" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-16" {...anim(0)}>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
            style={{ color: "#bbc4f7", fontFamily: font }}
          >
            Why Concierge
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-tight max-w-2xl"
            style={{ color: "#dfe2eb", fontFamily: font }}
          >
            Precision-matched citizenship and residency, tailored to your life.
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 — Large (2 col): Programme Matching */}
          <motion.div
            className="md:col-span-2 rounded-2xl p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1c2026 0%, #181c24 100%)",
              border: "1px solid rgba(187,196,247,0.08)",
            }}
            {...anim(0.1)}
          >
            {/* Subtle glow accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-[80px]" style={{ background: "#bbc4f7" }} />
            <div className="relative z-10">
              <span className="material-symbols-outlined mb-6 block" style={{ fontSize: 28, color: "#bbc4f7" }}>
                auto_awesome
              </span>
              <h3 className="text-xl font-semibold mb-3" style={{ color: "#dfe2eb", fontFamily: font }}>
                Intelligent Programme Matching
              </h3>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#c6c6cb", fontFamily: font }}>
                Answer a few questions about your goals, budget, and timeline. Our engine cross-references 15+ citizenship and residency programmes to surface the options that genuinely fit your situation — no guesswork, no generic lists.
              </p>
            </div>
            <div className="relative z-10 flex gap-8 mt-8">
              <div>
                <p className="text-2xl font-bold" style={{ color: "#bbc4f7", fontFamily: font }}>15+</p>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8f9095" }}>Programmes</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#bbc4f7", fontFamily: font }}>12</p>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8f9095" }}>Jurisdictions</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#bbc4f7", fontFamily: font }}>3 min</p>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8f9095" }}>To Qualify</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 — Small: Global Mobility */}
          <motion.div
            className="rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #262a31 0%, #1c2026 100%)",
              border: "1px solid rgba(187,196,247,0.08)",
            }}
            {...anim(0.2)}
          >
            <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 blur-[60px]" style={{ background: "#bbc4f7" }} />
            <div className="relative z-10">
              <span className="material-symbols-outlined mb-6 block" style={{ fontSize: 28, color: "#bbc4f7" }}>
                public
              </span>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#dfe2eb", fontFamily: font }}>
                Global Mobility
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb", fontFamily: font }}>
                Access up to 180+ visa-free destinations. We help you pick the passport that unlocks the travel freedom you actually need.
              </p>
            </div>
            {!hasQualification && (
              <button
                className="relative z-10 mt-6 flex items-center gap-1.5 text-sm font-semibold self-start transition-opacity hover:opacity-80"
                style={{ color: "#bbc4f7", fontFamily: font }}
                onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
              >
                Start Qualifying
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            )}
          </motion.div>

          {/* Card 3 — Tax Strategy */}
          <motion.div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#1c2026",
              border: "1px solid rgba(187,196,247,0.06)",
            }}
            {...anim(0.3)}
          >
            <span className="material-symbols-outlined mb-5 block" style={{ fontSize: 24, color: "#d6c3b7" }}>
              account_balance
            </span>
            <h3 className="text-base font-semibold mb-2" style={{ color: "#dfe2eb", fontFamily: font }}>
              Tax Optimisation
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb", fontFamily: font }}>
              Navigate 0% income tax jurisdictions, territorial tax systems, and US renunciation pathways — all mapped to your current nationality.
            </p>
          </motion.div>

          {/* Card 4 — Dedicated Advisor */}
          <motion.div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(187,196,247,0.04) 0%, #1c2026 100%)",
              border: "1px solid rgba(187,196,247,0.1)",
            }}
            {...anim(0.35)}
          >
            <span className="material-symbols-outlined mb-5 block" style={{ fontSize: 24, color: "#bbc4f7" }}>
              support_agent
            </span>
            <h3 className="text-base font-semibold mb-2" style={{ color: "#dfe2eb", fontFamily: font }}>
              Dedicated Advisor
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb", fontFamily: font }}>
              Every client is paired with a senior concierge who manages the entire process — from documentation to government submission.
            </p>
          </motion.div>

          {/* Card 5 — Success Rate with circle stat */}
          <motion.div
            className="rounded-2xl p-8 flex items-center justify-between gap-6 relative overflow-hidden"
            style={{
              background: "#1c2026",
              border: "1px solid rgba(187,196,247,0.06)",
            }}
            {...anim(0.4)}
          >
            <div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "#dfe2eb", fontFamily: font }}>
                Approval Rate
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb", fontFamily: font }}>
                Across all programmes and jurisdictions since 2019.
              </p>
            </div>
            <div
              className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative"
              style={{ border: "2px solid rgba(187,196,247,0.25)" }}
            >
              {/* Animated fill arc */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(187,196,247,0.08)" strokeWidth="2" />
                <motion.circle
                  cx="32" cy="32" r="29" fill="none" stroke="#bbc4f7" strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 29}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 29 }}
                  animate={isInView ? { strokeDashoffset: 2 * Math.PI * 29 * 0.02 } : {}}
                  transition={{ delay: 0.6, duration: 1.2, ease: EASE }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-bold relative z-10" style={{ color: "#bbc4f7", fontFamily: font }}>98%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
