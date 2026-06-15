"use client";

import { motion } from "framer-motion";
import { CITIZENX_ROUTES, type CitizenXRoute } from "@/lib/citizenx-routes";
import { formatCurrency } from "@/lib/utils";
import {
  fadeUp,
  stagger,
  inView,
  glass,
  PRIMARY,
  SectionLabel,
  Heading,
  Icon,
} from "@/components/programs/guide-ui";

/**
 * Per-route pricing mirrored verbatim from CitizenX (incl. their service fee),
 * with family-composition bands and closed-route exclusions. Replaces the flat
 * synthetic fee model for programmes present in CITIZENX_ROUTES.
 *
 * YMYL: unverified figures render a [VERIFY] tag and the section carries a
 * source + date footnote. Preview-only until advisor sign-off.
 */

const INK = "var(--color-obsidian-on-surface, #eef0f6)";
const DIM = "rgba(214,195,183,0.6)";

function Verify() {
  return (
    <span className="ml-1 text-[0.72em] align-middle" style={{ color: DIM }}>
      [VERIFY]
    </span>
  );
}

function money(amount: number | null, currency: string): string | null {
  return amount == null ? null : formatCurrency(amount, currency);
}

function RouteCard({ route, currency }: { route: CitizenXRoute; currency: string }) {
  const closed = route.status === "closed";
  const allIn = money(route.allIn, currency);

  const components: { label: string; amount: number | null | undefined }[] = [
    { label: "Government contribution", amount: route.governmentContribution },
    { label: "Government fees", amount: route.governmentFees },
    { label: "CitizenX service fee", amount: route.citizenxServiceFee },
  ].filter((c) => c.amount !== undefined && c.amount !== null);

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-2xl p-6 sm:p-7"
      style={{ ...glass, opacity: closed ? 0.62 : 1 }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: closed ? "rgba(229,99,99,0.5)" : PRIMARY }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-3">
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
        {!route.verified && !closed && <Verify />}
      </div>

      {closed ? (
        <p className="text-sm leading-relaxed" style={{ color: DIM }}>
          {route.closedReason ?? "Currently unavailable."}
        </p>
      ) : (
        <>
          {/* All-in headline */}
          <div className="mb-4">
            <span className="text-[0.7rem] uppercase tracking-[0.12em]" style={{ color: "#d6c3b7" }}>
              All-in{route.baseComposition ? ` · ${route.baseComposition}` : ""}
            </span>
            <div
              className="mt-1 font-semibold leading-none"
              style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", color: PRIMARY, letterSpacing: "-0.02em" }}
            >
              {allIn ? <>from {allIn}</> : <span style={{ color: DIM }}>By consultation</span>}
            </div>
          </div>

          {/* Component breakdown */}
          {components.length > 0 && (
            <div className="mb-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              {components.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span style={{ color: "rgba(198,198,203,0.7)" }}>{c.label}</span>
                  <span style={{ color: INK }}>{money(c.amount as number, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Family bands */}
          <div className="mb-3">
            <p className="mb-1.5 text-[0.7rem] uppercase tracking-[0.12em]" style={{ color: "#d6c3b7" }}>
              Family pricing
            </p>
            {route.familyIncrements.length > 0 ? (
              <ul className="space-y-1.5">
                {route.familyIncrements.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span style={{ color: "rgba(198,198,203,0.7)" }}>{f.label}</span>
                    <span style={{ color: INK }}>
                      {f.amount == null ? <Verify /> : `+${money(f.amount, currency)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: DIM }}>
                Spouse, children, parents and siblings priced per composition <Verify />
              </p>
            )}
          </div>

          {(route.processing || route.notes) && (
            <div className="mt-3 space-y-1 text-xs" style={{ color: "rgba(198,198,203,0.5)" }}>
              {route.processing && (
                <p className="flex items-center gap-1.5">
                  <Icon name="schedule" className="text-[14px]" />
                  {route.processing}
                </p>
              )}
              {route.notes && <p>{route.notes}</p>}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export function RoutesPricing({ slug }: { slug: string }) {
  const data = CITIZENX_ROUTES[slug];
  if (!data) return null;

  return (
    <motion.section id="g-costs" {...inView} variants={stagger}>
      <motion.div variants={fadeUp}>
        <SectionLabel>Transparency</SectionLabel>
        <Heading>Routes &amp; pricing</Heading>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "rgba(198,198,203,0.78)" }}>
          Each route shows the all-in cost for the base family, then what each additional
          family member adds. Government fees and due diligence are billed at cost.
        </p>
      </motion.div>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {data.routes.map((route, i) => (
          <RouteCard key={i} route={route} currency={data.currency} />
        ))}
      </div>

      <motion.p variants={fadeUp} className="mt-5 text-xs leading-relaxed" style={{ color: "rgba(198,198,203,0.45)" }}>
        <Icon name="info" className="mr-1 text-[14px] align-middle" style={{ color: DIM }} />
        Pricing mirrored from{" "}
        <a href={data.source} rel="noopener noreferrer" className="underline hover:opacity-100">
          CitizenX
        </a>{" "}
        ({data.retrieved}). Figures marked <span style={{ color: DIM }}>[VERIFY]</span> are pending
        independent confirmation and an advisor review before publication.
      </motion.p>
    </motion.section>
  );
}
