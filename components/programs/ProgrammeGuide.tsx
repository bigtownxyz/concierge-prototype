"use client";

import { motion } from "framer-motion";
import type { Program, ProgrammeGuide as GuideData } from "@/lib/constants";

/**
 * Additive long-form guide rendered BELOW the existing ProgramDetail layout.
 * Renders only when a programme has a PROGRAMME_GUIDES entry. Client component
 * for scroll-reveal motion; content is still server-rendered into the HTML, and
 * the JSON-LD (Service / BreadcrumbList / FAQPage) is emitted from the server
 * page, so search and AI crawlers get everything.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const inView = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs uppercase tracking-[0.3em] block mb-4"
      style={{ color: "#d6c3b7", fontFamily: "var(--font-manrope, sans-serif)" }}
    >
      {children}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-semibold leading-tight"
      style={{
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
        fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
        color: "var(--color-obsidian-on-surface, #eef0f6)",
        letterSpacing: "-0.025em",
      }}
    >
      {children}
    </h2>
  );
}

function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style} aria-hidden>
      {name}
    </span>
  );
}

const glass: React.CSSProperties = {
  background: "rgba(38, 42, 49, 0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
};

/** Render text with [bracketed editorial notes] dimmed so placeholders read as intentional. */
function withNotes(text: string) {
  return text.split(/(\[[^\]]*\])/g).map((part, i) =>
    part.startsWith("[") ? (
      <span key={i} style={{ color: "rgba(214,195,183,0.6)" }} className="text-[0.92em]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function suitIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("famil") || t.includes("children") || t.includes("spouse")) return "family_restroom";
  if (t.includes("travel") || t.includes("passport") || t.includes("visa-free")) return "flight_takeoff";
  if (t.includes("relocat") || t.includes("eu access") || t.includes("residen")) return "public";
  return "person_pin_circle";
}

function routeIcon(name: string): string {
  const t = name.toLowerCase();
  if (t.includes("fund")) return "savings";
  if (t.includes("business") || t.includes("job")) return "business_center";
  if (t.includes("real estate") || t.includes("property")) return "home_work";
  return "payments";
}

function costIcon(item: string): string {
  const t = item.toLowerCase();
  if (t.includes("invest")) return "payments";
  if (t.includes("government") || t.includes("fee")) return "account_balance";
  if (t.includes("due diligence")) return "verified_user";
  if (t.includes("advisory") || t.includes("concierge")) return "handshake";
  return "receipt_long";
}

const PRIMARY = "var(--color-obsidian-primary, #bbc4f7)";

export function ProgrammeGuide({
  program,
  guide,
}: {
  program: Program;
  guide: GuideData;
}) {
  return (
    <div style={{ color: "rgba(198,198,203,0.78)" }}>
      {/* ---------------- WHO IT SUITS ---------------- */}
      <section className="relative py-24 px-6" style={{ background: "#0d1018" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: `radial-gradient(60% 100% at 50% 0%, rgba(187,196,247,0.08), transparent)` }}
        />
        <motion.div {...inView} variants={stagger} className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp}>
            <SectionLabel>Is it right for you</SectionLabel>
            <Heading>Who {program.name} suits</Heading>
          </motion.div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {guide.whoItSuits.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
                style={glass}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "rgba(187,196,247,0.12)", color: PRIMARY }}
                >
                  <Icon name={suitIcon(item)} className="text-[24px]" />
                </div>
                <p className="text-[0.95rem] leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------- INVESTMENT ROUTES ---------------- */}
      <section className="py-24 px-6" style={{ background: "#0a0e14" }}>
        <motion.div {...inView} variants={stagger} className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp}>
            <SectionLabel>Capital</SectionLabel>
            <Heading>Investment routes</Heading>
          </motion.div>
          <div className="mt-10 space-y-4">
            {guide.investmentRoutes.map((route, i) => {
              const closed = /closed/i.test(route.detail);
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-2xl p-6 sm:p-7"
                  style={{ ...glass, opacity: closed ? 0.66 : 1 }}
                >
                  {/* accent rail */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: closed ? "rgba(255,255,255,0.12)" : PRIMARY }}
                  />
                  <div className="flex items-start gap-5">
                    <span
                      className="hidden sm:block font-semibold leading-none"
                      style={{ fontSize: "2rem", color: "rgba(255,255,255,0.10)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(187,196,247,0.1)", color: closed ? "rgba(214,195,183,0.7)" : PRIMARY }}>
                      <Icon name={routeIcon(route.name)} className="text-[22px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-3">
                        <h3 className="font-medium" style={{ color: "var(--color-obsidian-on-surface,#eef0f6)" }}>
                          {route.name}
                        </h3>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
                          style={
                            closed
                              ? { background: "rgba(229,99,99,0.12)", color: "#e57d7d" }
                              : { background: "rgba(187,196,247,0.14)", color: PRIMARY }
                          }
                        >
                          {closed ? "Closed" : "Open"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{withNotes(route.detail)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ---------------- COSTS ---------------- */}
      <section className="py-24 px-6" style={{ background: "#0d1018" }}>
        <motion.div {...inView} variants={stagger} className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp}>
            <SectionLabel>Transparency</SectionLabel>
            <Heading>Costs, in full</Heading>
          </motion.div>
          {/* Hero figure: first cost row */}
          {guide.costs[0] && (
            <motion.div
              variants={fadeUp}
              className="mt-10 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              style={{ ...glass, borderColor: "rgba(187,196,247,0.25)" }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#d6c3b7" }}>
                  {guide.costs[0].item}
                </p>
                <p
                  className="mt-2 font-semibold leading-none"
                  style={{ fontSize: "clamp(2rem,5vw,3rem)", color: PRIMARY, letterSpacing: "-0.02em" }}
                >
                  {withNotes(guide.costs[0].amount)}
                </p>
              </div>
              <Icon name="payments" className="text-[40px]" />
            </motion.div>
          )}
          {/* Remaining rows */}
          <motion.div
            variants={fadeUp}
            className="mt-4 rounded-2xl overflow-hidden"
            style={glass}
          >
            {guide.costs.slice(1).map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-6 px-6 py-4"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="flex items-center gap-3 text-sm">
                  <Icon name={costIcon(row.item)} className="text-[18px]" />
                  {row.item}
                </span>
                <span className="text-right text-sm" style={{ color: "var(--color-obsidian-on-surface,#eef0f6)" }}>
                  {withNotes(row.amount)}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ---------------- TAX ---------------- */}
      <section className="py-24 px-6" style={{ background: "#0a0e14" }}>
        <motion.div {...inView} variants={fadeUp} className="mx-auto max-w-5xl">
          <SectionLabel>Tax</SectionLabel>
          <Heading>Tax considerations</Heading>
          <div
            className="mt-8 relative rounded-2xl p-7 sm:p-8 flex gap-5"
            style={{ ...glass }}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: PRIMARY }} />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(187,196,247,0.1)", color: PRIMARY }}>
              <Icon name="account_balance" className="text-[22px]" />
            </div>
            <p className="text-[0.95rem] leading-[1.8] self-center">{guide.taxNote}</p>
          </div>
        </motion.div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-24 px-6" style={{ background: "#0d1018" }}>
        <motion.div {...inView} variants={stagger} className="mx-auto max-w-3xl">
          <motion.div variants={fadeUp}>
            <SectionLabel>Questions</SectionLabel>
            <Heading>{program.name}: frequently asked</Heading>
          </motion.div>
          <div className="mt-10 space-y-3">
            {guide.faqs.map((item, i) => (
              <motion.details
                key={i}
                variants={fadeUp}
                className="group rounded-2xl px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                style={glass}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-medium" style={{ color: "var(--color-obsidian-on-surface,#eef0f6)" }}>
                    {item.q}
                  </span>
                  <Icon
                    name="add"
                    className="text-[20px] shrink-0 transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed">{withNotes(item.a)}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------- REVIEWED BY ---------------- */}
      <section className="py-16 px-6" style={{ background: "#0a0e14" }}>
        <motion.div
          {...inView}
          variants={fadeUp}
          className="mx-auto max-w-3xl rounded-2xl p-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
          style={{ ...glass }}
        >
          <Icon name="verified" className="text-[20px]" style={{ color: PRIMARY }} />
          <span style={{ color: "var(--color-obsidian-on-surface,#eef0f6)" }}>Reviewed by</span>
          <span>{withNotes(guide.author.name)}</span>
          {guide.author.title ? <span className="opacity-70">, {withNotes(guide.author.title)}</span> : null}
          <span className="opacity-50">·</span>
          <span className="opacity-70">Last reviewed {withNotes(guide.lastReviewed)}</span>
          {guide.sources.length > 0 && (
            <span className="w-full mt-2 opacity-70">
              Sources:{" "}
              {guide.sources.map((s, i) => (
                <a key={i} href={s.url} rel="noopener noreferrer" className="underline hover:opacity-100">
                  {i > 0 ? ", " : ""}
                  {withNotes(s.label)}
                </a>
              ))}
            </span>
          )}
        </motion.div>
      </section>
    </div>
  );
}
