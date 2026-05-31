"use client";

import { motion } from "framer-motion";
import type { Program } from "@/lib/constants";
import { feeBreakdown, type FeeLine } from "@/lib/pricing";
import {
  fadeUp,
  stagger,
  inView,
  glass,
  PRIMARY,
  SectionLabel,
  Heading,
  Icon,
  withNotes,
} from "@/components/programs/guide-ui";

function lineIcon(label: string): string {
  const t = label.toLowerCase();
  if (t.includes("contribution") || t.includes("government cost")) return "account_balance";
  if (t.includes("government fee")) return "receipt_long";
  if (t.includes("service")) return "handshake";
  if (t.includes("due diligence")) return "verified_user";
  if (t.includes("biometric") || t.includes("courier")) return "fingerprint";
  return "payments";
}

export function FeeBreakdown({ program }: { program: Program }) {
  const fb = feeBreakdown(program);

  return (
    <section className="py-24 px-6" style={{ background: "#0d1018" }}>
      <motion.div {...inView} variants={stagger} className="mx-auto max-w-5xl">
        <motion.div variants={fadeUp}>
          <SectionLabel>Transparency</SectionLabel>
          <Heading>What you&rsquo;ll pay</Heading>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "rgba(198,198,203,0.78)" }}>
            {fb.modelNote}
          </p>
        </motion.div>

        {/* All-in hero figure */}
        <motion.div
          variants={fadeUp}
          className="mt-10 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          style={{ ...glass, borderColor: "rgba(187,196,247,0.25)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#d6c3b7" }}>
              {fb.allInLabel}
            </p>
            <p
              className="mt-2 font-semibold leading-none"
              style={{ fontSize: "clamp(2rem,5vw,3rem)", color: PRIMARY, letterSpacing: "-0.02em" }}
            >
              {fb.allInAmount}
            </p>
          </div>
          <Icon name="account_balance_wallet" className="text-[40px]" style={{ color: "rgba(198,198,203,0.5)" }} />
        </motion.div>

        {/* Itemised breakdown */}
        <motion.div variants={fadeUp} className="mt-4 rounded-2xl overflow-hidden" style={glass}>
          {fb.lines.map((line: FeeLine, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-6 px-6 py-4"
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                background: line.emphasis ? "rgba(187,196,247,0.06)" : "transparent",
              }}
            >
              <span className="flex items-center gap-3 text-sm">
                <Icon
                  name={lineIcon(line.label)}
                  className="text-[18px]"
                  style={{ color: line.emphasis ? PRIMARY : "rgba(198,198,203,0.6)" }}
                />
                <span className="flex flex-col">
                  <span style={{ color: line.emphasis ? "var(--color-obsidian-on-surface,#eef0f6)" : undefined }}>
                    {line.label}
                  </span>
                  {line.note && (
                    <span className="text-xs" style={{ color: "rgba(198,198,203,0.45)" }}>
                      {line.note}
                    </span>
                  )}
                </span>
              </span>
              <span
                className="text-right text-sm whitespace-nowrap"
                style={{
                  color: line.emphasis
                    ? PRIMARY
                    : line.atCost
                      ? "rgba(214,195,183,0.6)"
                      : "var(--color-obsidian-on-surface,#eef0f6)",
                  fontStyle: line.atCost ? "italic" : "normal",
                }}
              >
                {withNotes(line.amount)}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
