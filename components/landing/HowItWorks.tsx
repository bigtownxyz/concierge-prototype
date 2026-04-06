"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const font = "var(--font-manrope, 'Manrope', sans-serif)";

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.5, ease: EASE },
  });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10" style={{ backgroundColor: "#10141a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-16" {...anim(0)}>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
            style={{ color: "#bbc4f7", fontFamily: font }}
          >
            Neural Infrastructure
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-tight max-w-2xl"
            style={{ color: "#dfe2eb", fontFamily: font }}
          >
            Advanced recommendation engine powered by proprietary geopolitical datasets.
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Large (2 col) */}
          <motion.div
            className="md:col-span-2 rounded-2xl p-8 lg:p-10 flex flex-col justify-between"
            style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}
            {...anim(0.1)}
          >
            <div>
              <span className="material-symbols-outlined mb-6 block" style={{ fontSize: 28, color: "#8f9095" }}>
                trending_up
              </span>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#dfe2eb", fontFamily: font }}
              >
                Predictive Jurisdiction Modeling
              </h3>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#8f9095", fontFamily: font }}>
                Our AI simulates legislative shifts 36 months into the future to ensure your residency remains a fortress, not a liability.
              </p>
            </div>
            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-2xl font-bold" style={{ color: "#dfe2eb", fontFamily: font }}>420k</p>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8f9095" }}>Data Nodes</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#dfe2eb", fontFamily: font }}>12ms</p>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8f9095" }}>Latency</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 — Small (1 col) */}
          <motion.div
            className="rounded-2xl p-8 flex flex-col justify-between"
            style={{ background: "#262a31", border: "1px solid rgba(69,71,75,0.15)" }}
            {...anim(0.2)}
          >
            <div>
              <span className="material-symbols-outlined mb-6 block" style={{ fontSize: 28, color: "#bbc4f7" }}>
                hub
              </span>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "#dfe2eb", fontFamily: font }}
              >
                Global Interconnectivity
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8f9095", fontFamily: font }}>
                Map your tax liabilities against global mobility scores in real-time across 180+ jurisdictions.
              </p>
            </div>
            <button
              className="mt-6 flex items-center gap-1.5 text-sm font-semibold self-start"
              style={{ color: "#bbc4f7", fontFamily: font }}
              onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
            >
              Explore Map
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </motion.div>

          {/* Card 3 — Small */}
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}
            {...anim(0.3)}
          >
            <span className="material-symbols-outlined mb-5 block" style={{ fontSize: 24, color: "#8f9095" }}>
              lock
            </span>
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "#dfe2eb", fontFamily: font }}
            >
              Zero-Knowledge Protocols
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8f9095", fontFamily: font }}>
              Your financial blueprint is encrypted at the hardware level. We never store your raw data.
            </p>
          </motion.div>

          {/* Card 4 — Small, highlighted */}
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: "#262a31", border: "1px solid rgba(69,71,75,0.15)" }}
            {...anim(0.35)}
          >
            <span className="material-symbols-outlined mb-5 block" style={{ fontSize: 24, color: "#bbc4f7" }}>
              api
            </span>
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "#dfe2eb", fontFamily: font }}
            >
              API Integration
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8f9095", fontFamily: font }}>
              Seamlessly connect your family office dashboard to our intelligence stream via secure hooks.
            </p>
          </motion.div>

          {/* Card 5 — Small with stat */}
          <motion.div
            className="rounded-2xl p-8 flex items-center justify-between gap-6"
            style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}
            {...anim(0.4)}
          >
            <div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "#dfe2eb", fontFamily: font }}
              >
                System Uptime
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8f9095", fontFamily: font }}>
                Continuous monitoring of 48 sovereign funds.
              </p>
            </div>
            <div
              className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ border: "2px solid rgba(187,196,247,0.3)" }}
            >
              <span className="text-sm font-bold" style={{ color: "#bbc4f7", fontFamily: font }}>99.9%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
