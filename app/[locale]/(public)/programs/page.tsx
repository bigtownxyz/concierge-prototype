import type { Metadata } from "next";
import { ProgramsGrid } from "./programs-grid";

export const metadata: Metadata = {
  title: "Programs  - Global Citizenship & Residency Directory",
  description:
    "Explore citizenship by investment, golden visa, and residency programmes worldwide. Compare costs, processing times, and benefits across 15+ jurisdictions.",
  openGraph: {
    title: "The Global Program Directory | Concierge",
    description:
      "Sovereignty curated for the modern globalist. Discover citizenship and residency options across 15+ countries.",
  },
};

export default function ProgramsPage() {
  return (
    <div style={{ background: "#10141a", minHeight: "100vh" }}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          minHeight: 614,
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(2, 12, 55, 0.5) 0%, transparent 70%), linear-gradient(180deg, rgba(2,12,55,0.4) 0%, #10141a 100%)",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(187, 196, 247, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(187, 196, 247, 0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(10, 14, 20, 0.6) 100%)",
          }}
        />

        {/* Faint star / particle suggestion */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 30%, rgba(187,196,247,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, rgba(187,196,247,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, rgba(187,196,247,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 35% 65%, rgba(187,196,247,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 75% 55%, rgba(187,196,247,0.25) 0%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-24">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(187, 196, 247, 0.08)",
              border: "1px solid rgba(187, 196, 247, 0.18)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, color: "#bbc4f7" }}
            >
              language
            </span>
            <span
              className="text-xs font-semibold tracking-[0.18em] uppercase"
              style={{
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              Exclusive Directory
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight"
              style={{
                color: "#dfe2eb",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              The Global
            </h1>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight italic"
              style={{
                color: "#bbc4f7",
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              }}
            >
              Program Directory
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="max-w-xl text-base sm:text-lg leading-relaxed"
            style={{
              color: "#c6c6cb",
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            }}
          >
            Sovereignty curated for the modern globalist. Compare citizenship,
            residency, and asset protection structures across 15+ jurisdictions.
          </p>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 mt-2 pt-8"
            style={{ borderTop: "1px solid rgba(69,71,75,0.5)" }}
          >
            {[
              { value: "15+", label: "Jurisdictions" },
              { value: "4", label: "Program Types" },
              { value: "191", label: "Visa-Free Max" },
              { value: "1mo", label: "Fastest Process" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    color: "#bbc4f7",
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  }}
                >
                  {value}
                </span>
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{
                    color: "#8f9095",
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar + Grid + Comparison (all client-side) ────────────── */}
      <ProgramsGrid />
    </div>
  );
}
