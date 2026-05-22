"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROGRAMS, programHasImage, type Program } from "@/lib/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function programmeMinDisplay(p: Program): string {
  if (p.minInvestment === 0) return "No minimum";
  const sym = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : `${p.currency} `;
  if (p.minInvestment >= 1_000_000) {
    return `${sym}${(p.minInvestment / 1_000_000).toFixed(p.minInvestment % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  return `${sym}${(p.minInvestment / 1_000).toFixed(0)}K`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationClient({ userId }: { userId: string }) {
  const [loadingData, setLoadingData] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState<Program[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      // Auth and the quiz-vs-enquiry routing guard are enforced server-side
      // by the page (application/page.tsx). This client only ever renders for
      // an authed enquiry user, so it fetches display data against userId.
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      setName(profile?.full_name ?? null);

      const { data: qual } = await supabase
        .from("qualifications")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (qual) {
        const { data: progs } = await supabase
          .from("qualification_programs")
          .select("program_slug")
          .eq("qualification_id", qual.id);

        const mapped = (progs ?? [])
          .map((row: { program_slug: string }) =>
            PROGRAMS.find((p) => p.slug === row.program_slug)
          )
          .filter((p): p is Program => !!p);
        setProgrammes(mapped);
      }

      setLoadingData(false);
    }

    fetchData();
  }, [userId]);

  return (
    <div
      className="min-h-screen px-6 py-12 lg:py-16"
      style={{
        background: "#10141a",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(2,12,55,0.45) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* ── Left: confirmation + applied programmes ─────────────────── */}
          <div className="w-full lg:w-[60%]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: "#bbc4f7" }}
                  aria-hidden="true"
                >
                  folder_open
                </span>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "#bbc4f7" }}
                >
                  Your Application
                </p>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-semibold mb-2"
                style={{ color: "#dfe2eb" }}
              >
                {name ? `${name.split(" ")[0]}, ` : ""}
                <em style={{ color: "#bbc4f7" }}>here&apos;s your overview.</em>
              </h1>
              <p className="text-sm mb-8 max-w-xl" style={{ color: "#8f9095" }}>
                The programmes you&apos;re exploring with our advisory team are
                listed below. Book or reschedule your consultation any time,
                and your advisor will review everything before the call.
              </p>
            </motion.div>

            <div className="mb-2 flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color: "#8f9095" }}
                aria-hidden="true"
              >
                inventory_2
              </span>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#8f9095" }}
              >
                Programmes you&apos;re interested in
              </p>
            </div>

            {loadingData ? (
              <div className="flex flex-col gap-2.5">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-[68px] rounded-xl animate-pulse"
                    style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}
                  />
                ))}
              </div>
            ) : programmes.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {programmes.map((p, i) => (
                  <motion.div
                    key={p.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                    style={{
                      background: "#1c2026",
                      border: "1px solid rgba(187,196,247,0.18)",
                    }}
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden"
                      style={{
                        border: "1px solid rgba(187,196,247,0.2)",
                        background: "rgba(187,196,247,0.08)",
                      }}
                    >
                      {programHasImage(p.slug) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/images/programs/${p.slug}.jpg`}
                          alt={p.country}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-base" aria-hidden="true">
                          {p.flagEmoji}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "#dfe2eb" }}>
                        {p.country}
                      </p>
                      <p className="text-[11px]" style={{ color: "#8f9095" }}>
                        {p.type}
                        {p.minInvestment > 0 ? ` · from ${programmeMinDisplay(p)}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/programs/${p.slug}` as "/programs/[slug]"}
                      className="text-xs font-semibold transition-colors flex-shrink-0"
                      style={{ color: "#bbc4f7" }}
                    >
                      View
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl px-5 py-6 text-sm"
                style={{
                  background: "#1c2026",
                  border: "1px solid rgba(69,71,75,0.15)",
                  color: "#8f9095",
                }}
              >
                Your enquiry is being processed. If you don&apos;t see your
                programmes shortly, your advisor will confirm them on your call.
              </div>
            )}

            <div className="mt-8">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: "#bbc4f7" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add
                </span>
                Explore more programmes
              </Link>
            </div>
          </div>

          {/* ── Right: book the advisor call ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="w-full lg:w-[40%] lg:sticky lg:top-24"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#1c2026",
                border: "1px solid rgba(69,71,75,0.15)",
              }}
            >
              <div
                className="px-6 pt-6 pb-4"
                style={{ borderBottom: "1px solid rgba(69,71,75,0.15)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: "#bbc4f7" }}
                    aria-hidden="true"
                  >
                    calendar_month
                  </span>
                  <h2 className="text-base font-semibold" style={{ color: "#dfe2eb" }}>
                    Book Your Consultation
                  </h2>
                </div>
                <p className="text-xs" style={{ color: "#8f9095" }}>
                  Speak directly with a senior advisor about your enquiry.
                </p>
              </div>

              <div className="w-full">
                <iframe
                  src="https://calendly.com/lc-concierge/concierge-consultation?hide_gdpr_banner=1&background_color=10141a&text_color=dfe2eb&primary_color=bbc4f7"
                  width="100%"
                  height="700"
                  frameBorder={0}
                  title="Book a concierge consultation"
                  style={{ display: "block", border: "none" }}
                />
              </div>

              <div
                className="px-6 py-4 flex items-start gap-2"
                style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0 mt-0.5"
                  style={{ fontSize: 14, color: "#8f9095" }}
                  aria-hidden="true"
                >
                  info
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "#8f9095" }}>
                  Your advisor will review your enquiry before the call.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
