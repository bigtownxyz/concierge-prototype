"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Lock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10 relative overflow-hidden" style={{ backgroundColor: "#10141a" }}>
      <div
        className="max-w-7xl mx-auto rounded-[48px] p-12 md:p-24 relative"
        style={{
          background: "linear-gradient(to bottom right, #262a31, #10141a)",
          border: "1px solid rgba(69, 71, 75, 0.2)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-full -z-0"
          style={{ background: "#bbc4f7", opacity: 0.05, filter: "blur(120px)" }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="text-4xl md:text-5xl mb-8"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
            >
              Confidential Consultation
            </h2>
            <p
              className="text-xl mb-10 leading-relaxed"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
            >
              The journey to global freedom begins with a private conversation. Connect with our principal advisors to explore your possibilities under strict non-disclosure terms.
            </p>

            <div className="space-y-6">
              {[
                { title: "End-to-End Encryption", desc: "All communications are routed through secure, military-grade channels." },
                { title: "Dedicated Case Officer", desc: "A single point of contact for the duration of your global transition." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-5">
                  <div
                    className="mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(187, 196, 247, 0.2)" }}
                  >
                    <Check className="h-3 w-3" style={{ color: "#bbc4f7" }} strokeWidth={3} />
                  </div>
                  <div>
                    <h4
                      className="font-bold"
                      style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            className="p-10 rounded-3xl shadow-2xl"
            style={{ backgroundColor: "#0a0e14" }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest ml-1"
                    style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                  >
                    Legal Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Alexander Sterling"
                    className="w-full p-4 rounded-lg border-none focus:ring-1 focus:outline-none"
                    style={{
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      backgroundColor: "#1c2026",
                      color: "#dfe2eb",
                      boxShadow: "none",
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest ml-1"
                    style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                  >
                    Primary Citizenship
                  </label>
                  <input
                    type="text"
                    placeholder="United Kingdom"
                    className="w-full p-4 rounded-lg border-none focus:ring-1 focus:outline-none"
                    style={{
                      fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                      backgroundColor: "#1c2026",
                      color: "#dfe2eb",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest ml-1"
                  style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                >
                  Secure Email
                </label>
                <input
                  type="email"
                  placeholder="office@sterling-group.private"
                  className="w-full p-4 rounded-lg border-none focus:ring-1 focus:outline-none"
                  style={{
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                    backgroundColor: "#1c2026",
                    color: "#dfe2eb",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest ml-1"
                  style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
                >
                  Preferred Protocol
                </label>
                <select
                  className="w-full p-4 rounded-lg border-none focus:ring-1 focus:outline-none"
                  style={{
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                    backgroundColor: "#1c2026",
                    color: "#dfe2eb",
                  }}
                >
                  <option>Citizenship by Investment</option>
                  <option>Residency by Real Estate</option>
                  <option>Corporate Residency Transfer</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full text-lg py-5 rounded-lg font-extrabold transition-all flex items-center justify-center gap-3 hover:brightness-110"
                style={{
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  backgroundColor: "#bbc4f7",
                  color: "#242d58",
                }}
              >
                <Lock className="h-5 w-5" fill="currentColor" />
                Request Advisor Access
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
