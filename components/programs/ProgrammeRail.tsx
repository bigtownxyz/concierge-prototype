"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Program, ProgrammeGuide as GuideData } from "@/lib/constants";
import { feeBreakdown, type FeeLine } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { CITIZENX_ROUTES } from "@/lib/citizenx-routes";
import { RoutesPricing } from "@/components/programs/RoutesPricing";
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

/**
 * Lean "sticky rail" programme page (the structure Mattie approved in
 * _interactive/programme-page-structures.html). Rendered in place of the
 * radar / benefits-bento / protocols / timeline sections for any programme
 * that has a PROGRAMME_GUIDES entry. The hero, the Qualify/Apply modals and
 * the enquire handler all stay in ProgramDetail; this component only owns the
 * two-column body (flowing guide content + a sticky price/CTA rail).
 *
 * Costs use the shared feeBreakdown() (CitizenX 10% model) as a placeholder —
 * the per-route pricing mirror is a separate, YMYL-gated follow-up.
 */

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

function lineIcon(label: string): string {
  const t = label.toLowerCase();
  if (t.includes("contribution") || t.includes("government cost")) return "account_balance";
  if (t.includes("government fee")) return "receipt_long";
  if (t.includes("service")) return "handshake";
  if (t.includes("due diligence")) return "verified_user";
  if (t.includes("biometric") || t.includes("courier")) return "fingerprint";
  return "payments";
}

const INK = "var(--color-obsidian-on-surface, #eef0f6)";

export function ProgrammeRail({
  program,
  guide,
  cta,
  onQuiz,
}: {
  program: Program;
  guide: GuideData;
  /** Primary enquire button, owned by the parent (carries the apply handler). */
  cta: ReactNode;
  onQuiz?: () => void;
}) {
  const fb = feeBreakdown(program);

  // Real CitizenX per-route pricing (verbatim all-in) when we have it; the rail
  // headline then reflects the cheapest open route, and the costs section is
  // replaced by the per-route + family breakdown.
  const routeData = CITIZENX_ROUTES[program.slug];
  const openPriced = routeData?.routes.filter((r) => r.status === "open" && r.allIn != null) ?? [];
  const minAllIn = openPriced.length ? Math.min(...openPriced.map((r) => r.allIn as number)) : null;
  const railPriceLabel = routeData ? "All-in, from" : fb.allInLabel;
  const railPriceAmount = routeData
    ? minAllIn != null
      ? formatCurrency(minAllIn, routeData.currency)
      : "By consultation"
    : fb.allInAmount;

  // Most programmes read best by country ("Who Grenada suits"); generic
  // products like the global trust fall back to the programme name.
  const subject = program.country && program.country !== "Global" ? program.country : program.name;

  const facts: { icon: string; k: string; v: string }[] = [];
  if (program.processingTimeMonths)
    facts.push({ icon: "schedule", k: "Processing", v: `${program.processingTimeMonths} months` });
  if (program.visaFreeCount != null)
    facts.push({ icon: "flight_takeoff", k: "Visa-free", v: String(program.visaFreeCount) });
  facts.push({ icon: "badge", k: "Type", v: program.type });

  const jump = [
    { id: "g-suits", label: "Who it suits" },
    { id: "g-routes", label: "Investment routes" },
    { id: "g-costs", label: "Costs" },
    { id: "g-tax", label: "Tax" },
    { id: "g-faq", label: "FAQ" },
  ];

  return (
    <div
      className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1fr_320px] lg:items-start"
    >
      {/* ----------------------- MAIN COLUMN ----------------------- */}
      <div className="min-w-0 space-y-14" style={{ color: "rgba(198,198,203,0.78)" }}>
        {/* WHO IT SUITS */}
        <motion.section id="g-suits" {...inView} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>Is it right for you</SectionLabel>
            <Heading>Who {subject} suits</Heading>
          </motion.div>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        </motion.section>

        {/* INVESTMENT ROUTES */}
        <motion.section id="g-routes" {...inView} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>Capital</SectionLabel>
            <Heading>Investment routes</Heading>
          </motion.div>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {guide.investmentRoutes.map((route, i) => {
              const closed = /closed/i.test(route.detail);
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-2xl p-6"
                  style={{ ...glass, opacity: closed ? 0.66 : 1 }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: closed ? "rgba(255,255,255,0.12)" : PRIMARY }}
                  />
                  <div className="flex items-start gap-4">
                    <span
                      className="hidden font-semibold leading-none sm:block"
                      style={{ fontSize: "1.9rem", color: "rgba(255,255,255,0.10)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(187,196,247,0.1)", color: closed ? "rgba(214,195,183,0.7)" : PRIMARY }}
                    >
                      <Icon name={routeIcon(route.name)} className="text-[22px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-3">
                        <h3 className="font-medium" style={{ color: INK }}>
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
        </motion.section>

        {/* COSTS  - real per-route CitizenX pricing when available, else the placeholder fee model */}
        {routeData ? (
          <RoutesPricing slug={program.slug} />
        ) : (
        <motion.section id="g-costs" {...inView} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>Transparency</SectionLabel>
            <Heading>What you&rsquo;ll pay</Heading>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed">{fb.modelNote}</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-col gap-4 rounded-2xl p-7 sm:flex-row sm:items-end sm:justify-between"
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

          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-2xl" style={glass}>
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
                    <span style={{ color: line.emphasis ? INK : undefined }}>{line.label}</span>
                    {line.note && (
                      <span className="text-xs" style={{ color: "rgba(198,198,203,0.45)" }}>
                        {line.note}
                      </span>
                    )}
                  </span>
                </span>
                <span
                  className="whitespace-nowrap text-right text-sm"
                  style={{
                    color: line.emphasis ? PRIMARY : line.atCost ? "rgba(214,195,183,0.6)" : INK,
                    fontStyle: line.atCost ? "italic" : "normal",
                  }}
                >
                  {withNotes(line.amount)}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.section>
        )}

        {/* TAX */}
        <motion.section id="g-tax" {...inView} variants={fadeUp}>
          <SectionLabel>Tax</SectionLabel>
          <Heading>Tax considerations</Heading>
          <div className="relative mt-6 flex gap-5 rounded-2xl p-7" style={glass}>
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: PRIMARY }} />
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(187,196,247,0.1)", color: PRIMARY }}
            >
              <Icon name="account_balance" className="text-[22px]" />
            </div>
            <p className="self-center text-[0.95rem] leading-[1.8]">{guide.taxNote}</p>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section id="g-faq" {...inView} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>Questions</SectionLabel>
            <Heading>{subject}: frequently asked</Heading>
          </motion.div>
          <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
            {guide.faqs.map((item, i) => (
              <motion.details
                key={i}
                variants={fadeUp}
                className="group rounded-2xl px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                style={glass}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-medium" style={{ color: INK }}>
                    {item.q}
                  </span>
                  <Icon
                    name="add"
                    className="shrink-0 text-[20px] transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed">{withNotes(item.a)}</p>
              </motion.details>
            ))}
          </div>
        </motion.section>

        {/* REVIEWED BY */}
        <motion.div
          {...inView}
          variants={fadeUp}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl p-6 text-sm"
          style={glass}
        >
          <Icon name="verified" className="text-[20px]" style={{ color: PRIMARY }} />
          <span style={{ color: INK }}>Reviewed by</span>
          <span>{withNotes(guide.author.name)}</span>
          {guide.author.title ? <span className="opacity-70">, {withNotes(guide.author.title)}</span> : null}
          <span className="opacity-50">·</span>
          <span className="opacity-70">Last reviewed {withNotes(guide.lastReviewed)}</span>
          {guide.sources.length > 0 && (
            <span className="mt-2 w-full opacity-70">
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
      </div>

      {/* ----------------------- STICKY RAIL ----------------------- */}
      <aside
        className="order-first rounded-2xl p-6 lg:order-none lg:sticky lg:top-24"
        style={glass}
      >
        <span className="text-[0.7rem] uppercase tracking-[0.12em]" style={{ color: "#d6c3b7" }}>
          {railPriceLabel}
        </span>
        <div
          className="mt-1 font-semibold leading-none"
          style={{ fontSize: "2rem", color: INK, letterSpacing: "-0.02em" }}
        >
          {railPriceAmount}
        </div>
        <div className="mb-5 mt-1 text-[0.78rem]" style={{ color: "rgba(198,198,203,0.6)" }}>
          single applicant
        </div>

        {cta}

        <div className="mt-4">
          {facts.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 text-sm"
              style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="flex items-center gap-2" style={{ color: "rgba(198,198,203,0.55)" }}>
                <Icon name={f.icon} className="text-[18px]" />
                {f.k}
              </span>
              <span className="font-semibold" style={{ color: INK }}>
                {f.v}
              </span>
            </div>
          ))}
        </div>

        <nav className="mt-4 flex flex-col gap-0.5 border-t pt-3" style={{ borderColor: "rgba(187,196,247,0.12)" }}>
          {jump.map((j) => (
            <a
              key={j.id}
              href={`#${j.id}`}
              className="flex items-center gap-2 rounded-lg px-1 py-2 text-[0.85rem] transition-colors hover:bg-white/5"
              style={{ color: "rgba(198,198,203,0.7)" }}
            >
              <Icon name="arrow_forward" className="text-[18px]" />
              {j.label}
            </a>
          ))}
        </nav>

        {onQuiz && (
          <button
            type="button"
            onClick={onQuiz}
            className="mt-3 w-full text-center text-xs transition-colors"
            style={{ color: "rgba(198,198,203,0.55)", background: "transparent", border: 0, cursor: "pointer" }}
          >
            Not sure this fits? Take the 2-min quiz →
          </button>
        )}
      </aside>
    </div>
  );
}
