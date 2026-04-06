"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ backgroundColor: "#10141a" }}>
      {/* Background Glow */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full -z-0"
        style={{ background: "#020c37", opacity: 0.2, filter: "blur(120px)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left column */}
          <div className="lg:col-span-7">
            <motion.div
              className="inline-flex items-center gap-3 px-3 py-1 rounded-full mb-8"
              style={{ backgroundColor: "#262a31" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: "#d6c3b7" }} />
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-bold"
                style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#d6c3b7" }}
              >
                Exclusive Access Only
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl leading-[1.1] mb-8"
              style={{ fontFamily: "var(--font-noto-serif, 'Noto Serif', serif)", color: "#dfe2eb" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            >
              The Sovereign <br />
              <span className="italic" style={{ color: "#bbc4f7" }}>Identity Blueprint.</span>
            </motion.h1>

            <motion.p
              className="text-xl max-w-xl mb-12 leading-relaxed"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            >
              Bespoke citizenship and residency strategies for the global elite. We navigate the complexities of international law to secure your legacy and mobility.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-lg text-lg font-extrabold transition-all hover:shadow-xl"
                style={{
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  backgroundColor: "#bbc4f7",
                  color: "#242d58",
                  boxShadow: "0 0 0 transparent",
                }}
              >
                Start Qualification
                <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                href="/programs"
                className="flex items-center justify-center px-8 py-5 rounded-lg text-lg font-bold transition-colors"
                style={{
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  backgroundColor: "#262a31",
                  color: "#dfe2eb",
                  border: "1px solid rgba(69, 71, 75, 0.2)",
                }}
              >
                View Private Portfolio
              </Link>
            </motion.div>
          </div>

          {/* Right column  - Hero image */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8MA8IRqiBry4qGR2QMSwRKnsRiXuQV3LfjVIO-AsZ-1GTrk7v1oHXhTOhM_ynFtBwEK3Quq02Gee1-WVh7nDAD_BSHx3G1lcwB-CyrtvVw3CgPv9l0CoZWe7J0Tyt3gbTTh7Gp0jMZ612xR823FDB_mNAZVLXp_xfVNz5alPFHGZ_FCFqnCkIZzV7f9c3lWTNX5hqzaYhXUsH1TitxeDVTN6py0lfXoo_BiLN0ap0mRzndTLFx83P8X9ZiuT8U4TfJ86Z9fgYAugS"
                alt="Luxury interior with city skyline view"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, #10141a, transparent, transparent)" }}
              />
              <div
                className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl"
                style={{
                  backgroundColor: "rgba(2, 6, 23, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <BadgeCheck className="h-5 w-5" style={{ color: "#d6c3b7" }} />
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                  >
                    Asset Verification Active
                  </span>
                </div>
                <p
                  className="text-lg"
                  style={{ fontFamily: "var(--font-noto-serif, 'Noto Serif', serif)", color: "#c7d2fe" }}
                >
                  &ldquo;Security isn&rsquo;t an option; it&rsquo;s the foundation of freedom.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
