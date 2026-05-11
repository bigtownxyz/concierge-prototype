"use client";

import { useState } from "react";
import { ApplyForProgrammeModal, type ApplyFormData } from "@/components/shared/ApplyForProgrammeModal";
import { PROGRAMS } from "@/lib/constants";

/**
 * Temporary preview route for the ApplyForProgrammeModal — lets us click through
 * the modal interactively before wiring it to the real programme-detail CTAs in
 * Phase 2. Safe to delete once the real wiring lands.
 */
export default function ApplyModalPreviewPage() {
  const [open, setOpen] = useState(true);
  const [submitted, setSubmitted] = useState<ApplyFormData | null>(null);
  const [initialSlugs, setInitialSlugs] = useState<string[]>(["dominica"]);

  const handleSubmit = async (data: ApplyFormData) => {
    setSubmitted(data);
    setOpen(false);
  };

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{
        background: "#10141a",
        color: "#dfe2eb",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <p
          className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
          style={{ color: "#bbc4f7" }}
        >
          Internal preview
        </p>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: "#dfe2eb" }}>
          ApplyForProgrammeModal — click-through
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8f9095", lineHeight: 1.6 }}>
          The modal opens with a programme pre-selected (simulating arrival from a programme detail page).
          Walk through all 5 steps. Submission is stubbed — it logs the form payload below instead of
          posting to Supabase. The actual signup + LC CRM intake wiring lands in Phase 2.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {PROGRAMS.slice(0, 8).map((p) => (
            <button
              key={p.slug}
              onClick={() => {
                setInitialSlugs([p.slug]);
                setOpen(true);
                setSubmitted(null);
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: "rgba(187,196,247,0.06)",
                border: "1px solid rgba(187,196,247,0.18)",
                color: "#bbc4f7",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Open as {p.country}
            </button>
          ))}
          <button
            onClick={() => {
              setInitialSlugs(["dominica", "st-kitts-and-nevis", "antigua-and-barbuda"]);
              setOpen(true);
              setSubmitted(null);
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: "#bbc4f7",
              color: "#242d58",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Open with 3 Caribbean programmes
          </button>
        </div>

        {submitted && (
          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: "#1c2026",
              border: "1px solid rgba(187,196,247,0.25)",
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-3"
              style={{ color: "#bbc4f7" }}
            >
              Last submission (stubbed)
            </p>
            <pre
              className="text-xs overflow-x-auto"
              style={{ color: "#c6c6cb", fontFamily: "var(--font-jetbrains, monospace)" }}
            >
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <ApplyForProgrammeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initialProgrammes={initialSlugs}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
