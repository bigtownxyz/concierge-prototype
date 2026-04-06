"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { type Program, STAGES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { RadarChart } from "@/components/shared/RadarChart";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QualifyModal } from "@/components/shared/QualifyModal";

// ---------------------------------------------------------------------------
// Benefit icon mapping
// ---------------------------------------------------------------------------

function getBenefitIcon(benefit: string): string {
  const t = benefit.toLowerCase();
  if (t.includes("tax") || t.includes("income")) return "account_balance";
  if (t.includes("travel") || t.includes("visa-free") || t.includes("visa free")) return "travel_explore";
  if (t.includes("visa")) return "card_travel";
  if (t.includes("family") || t.includes("dependent") || t.includes("spouse")) return "family_restroom";
  if (t.includes("security") || t.includes("protection") || t.includes("shield")) return "security";
  if (t.includes("passport") || t.includes("citizenship")) return "badge";
  if (t.includes("bitcoin") || t.includes("crypto")) return "currency_bitcoin";
  if (t.includes("real estate") || t.includes("property")) return "home_work";
  if (t.includes("business") || t.includes("entrepreneur")) return "business_center";
  if (t.includes("privacy") || t.includes("private")) return "lock";
  if (t.includes("eu") || t.includes("schengen") || t.includes("europe")) return "euro";
  if (t.includes("fast") || t.includes("speed") || t.includes("quick")) return "bolt";
  if (t.includes("cost") || t.includes("affordable") || t.includes("low")) return "savings";
  if (t.includes("lifestyle") || t.includes("infrastructure") || t.includes("modern")) return "apartment";
  if (t.includes("global") || t.includes("international") || t.includes("world")) return "public";
  if (t.includes("nomad") || t.includes("remote")) return "laptop_mac";
  if (t.includes("estate") || t.includes("planning")) return "account_tree";
  return "check_circle";
}

// ---------------------------------------------------------------------------
// Requirement icon mapping
// ---------------------------------------------------------------------------

function getRequirementIcon(req: string): string {
  const t = req.toLowerCase();
  if (t.includes("criminal") || t.includes("background")) return "gavel";
  if (t.includes("fund") || t.includes("investment") || t.includes("financial")) return "payments";
  if (t.includes("health") || t.includes("medical") || t.includes("insurance")) return "health_and_safety";
  if (t.includes("document") || t.includes("kyc") || t.includes("proof")) return "description";
  if (t.includes("due diligence") || t.includes("verification")) return "verified_user";
  if (t.includes("passport") || t.includes("identity")) return "badge";
  if (t.includes("residency") || t.includes("stay")) return "home";
  if (t.includes("business") || t.includes("license")) return "business_center";
  if (t.includes("accommodation")) return "hotel";
  if (t.includes("income") || t.includes("employment")) return "work";
  if (t.includes("consult") || t.includes("legal")) return "handshake";
  return "task_alt";
}

// ---------------------------------------------------------------------------
// Investment routes — groups requirements into 3 cards
// ---------------------------------------------------------------------------

interface InvestmentRoute {
  title: string;
  items: string[];
  duration: string;
}

function fmt(amount: number, currency: string): string {
  if (amount === 0) return "No minimum";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency + " ";
  if (amount >= 1000000) return `${sym}${(amount / 1000000).toFixed(1)}M`;
  return `${sym}${(amount / 1000).toFixed(0)}K`;
}

function getInvestmentRoutes(program: Program): InvestmentRoute[] {
  const reqs = program.requirements;
  const type = program.type;
  const c = program.currency;
  const min = program.minInvestment;
  const max = program.maxInvestment;

  // For CBI programs, frame as donation/real estate/family routes
  if (type === "CBI") {
    const duration = program.processingTimeMonths
      ? `${program.processingTimeMonths} Month Processing`
      : "Varies";
    return [
      {
        title: "Government Donation",
        items: [
          `${fmt(min, c)} minimum contribution`,
          ...reqs.slice(0, 2),
          "Non-refundable government fee",
        ],
        duration,
      },
      {
        title: "Real Estate Investment",
        items: [
          `${max ? fmt(max, c) : fmt(min * 1.5, c)} minimum property value`,
          "Approved government real estate projects",
          max ? `Hold period: 5-7 years` : "Hold period applies",
          ...reqs.slice(2, 3),
        ],
        duration: `${duration} + Hold Period`,
      },
      {
        title: "Family Application",
        items: [
          "Spouse and dependents included",
          "Children under 30 eligible",
          `${program.visaFreeCount ?? "140+"}+ visa-free countries`,
          `Additional ${fmt(Math.round(min * 0.2), c)} per dependent`,
        ],
        duration,
      },
    ];
  }

  // For Golden Visa / Residency
  if (type === "Golden Visa" || type === "Residency") {
    const duration = program.processingTimeMonths
      ? `${program.processingTimeMonths} Month Renewable`
      : "Renewable";
    return [
      {
        title: "Property Acquisition",
        items: [
          `${fmt(min, c)} minimum property value`,
          ...(max && max !== min ? [`Up to ${fmt(max, c)} for premium routes`] : []),
          ...reqs.slice(0, 2),
        ],
        duration,
      },
      {
        title: "Capital & Fund Transfer",
        items: [
          min > 0 ? `${fmt(min, c)} deposit in approved fund` : "Business establishment required",
          ...(min > 0 ? [`Ownership of company with ${fmt(min, c)} capital`] : []),
          ...reqs.slice(2).slice(0, 2),
        ].filter(Boolean),
        duration,
      },
      {
        title: "Exceptional Talent",
        items: [
          "Specialists in medical, science, or culture",
          "Entrepreneurs with viable business plans",
          "High-net-worth individuals",
        ],
        duration: `${duration} (Fixed)`,
      },
    ];
  }

  // For Trust or other types
  const third = Math.ceil(reqs.length / 3);
  return [
    { title: "Structure Setup", items: [`From ${fmt(min, c)}`, ...reqs.slice(0, third)], duration: "Ongoing" },
    { title: "Compliance", items: reqs.slice(third, third * 2), duration: "Annual Review" },
    { title: "Management", items: reqs.slice(third * 2), duration: "Perpetual" },
  ];
}

// ---------------------------------------------------------------------------
// Gradient palette by program type / region
// ---------------------------------------------------------------------------

function getHeroGradient(program: Program): string {
  const type = program.type;
  const region = program.region;

  if (type === "CBI" && region === "caribbean")
    return "from-[#0a1628] via-[#0d2040] to-[#10141a]";
  if (type === "Golden Visa" || region === "europe")
    return "from-[#0d1526] via-[#1a1535] to-[#10141a]";
  if (region === "middle_east")
    return "from-[#0f1a10] via-[#12200f] to-[#10141a]";
  if (region === "south_america" || region === "central_america")
    return "from-[#1a0f0a] via-[#1f1208] to-[#10141a]";
  return "from-[#0d0f1a] via-[#111528] to-[#10141a]";
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        background: "rgba(38, 42, 49, 0.4)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(187, 196, 247, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProgramDetail({ program }: { program: Program }) {
  const [qualifyOpen, setQualifyOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const heroGradient = getHeroGradient(program);

  const designationLabel = program.exclusive ? "Exclusive" : "Premium Designation";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#10141a",
        fontFamily: "var(--font-manrope, var(--font-sans), sans-serif)",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Background gradient base */}
        <div className={`absolute inset-0 bg-gradient-to-b ${heroGradient}`} />

        {/* Country hero image with parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <Image
            src={`/images/programs/${program.slug}.jpg`}
            alt={program.country}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        {/* Subtle noise / grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            opacity: 0.4,
          }}
        />

        {/* Bottom fade to page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #10141a)",
          }}
        />

        {/* Back link */}
        <div className="relative z-10 px-6 pt-8 max-w-7xl mx-auto w-full">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "rgba(187, 196, 247, 0.6)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-medium"
            >
              All Programmes
            </span>
          </Link>
        </div>

        {/* Hero content grid */}
        <div className="relative z-10 flex-1 flex items-end pb-20 px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

            {/* Left  - heading block */}
            <motion.div
              className="lg:col-span-7"
              initial="hidden"
              animate="show"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] mb-6"
                  style={{
                    background: "rgba(187, 196, 247, 0.1)",
                    border: "1px solid rgba(187, 196, 247, 0.2)",
                    color: "var(--color-obsidian-primary)",
                  }}
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {program.exclusive ? "workspace_premium" : "verified"}
                  </span>
                  {designationLabel}
                </span>
              </motion.div>

              {/* Flag + country */}
              <motion.div
                variants={fadeUp}
                custom={0.05}
                className="flex items-center gap-3 mb-3"
              >
                <span
                  className="text-sm uppercase tracking-[0.18em]"
                  style={{ color: "rgba(214, 195, 183, 0.7)" }}
                >
                  {program.country} &nbsp;&middot;&nbsp; {program.type}
                </span>
              </motion.div>

              {/* Program name  - large italic serif */}
              <motion.h1
                variants={fadeUp}
                custom={0.1}
                className="font-bold leading-[1.0] mb-6"
                style={{
                  fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  fontSize: "clamp(3rem, 7vw, 6rem)",
                  color: "var(--color-obsidian-on-surface)",
                  letterSpacing: "-0.02em",
                }}
              >
                {program.name}
              </motion.h1>

              {/* Marketing hook */}
              <motion.p
                variants={fadeUp}
                custom={0.15}
                className="text-base leading-relaxed max-w-xl"
                style={{ color: "rgba(198, 198, 203, 0.75)" }}
              >
                {program.marketingHook}
              </motion.p>
            </motion.div>

            {/* Right  - glass stats card */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Min Investment */}
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(187, 196, 247, 0.08)" }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: "var(--color-obsidian-primary)" }}
                      >
                        payments
                      </span>
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "rgba(187, 196, 247, 0.5)" }}
                    >
                      Min Investment
                    </p>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: "var(--color-obsidian-on-surface)" }}
                    >
                      {program.minInvestment === 0
                        ? "No minimum"
                        : formatCurrency(program.minInvestment, program.currency)}
                    </p>
                  </div>

                  {/* Processing time */}
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(214, 195, 183, 0.08)" }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: "var(--color-obsidian-tertiary)" }}
                      >
                        schedule
                      </span>
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "rgba(214, 195, 183, 0.5)" }}
                    >
                      Processing
                    </p>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: "var(--color-obsidian-on-surface)" }}
                    >
                      {program.processingTimeMonths
                        ? `${program.processingTimeMonths} months`
                        : "Varies"}
                    </p>
                  </div>

                  {/* Visa-free count */}
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(187, 196, 247, 0.08)" }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: "var(--color-obsidian-primary)" }}
                      >
                        travel_explore
                      </span>
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "rgba(187, 196, 247, 0.5)" }}
                    >
                      Visa-Free
                    </p>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: "var(--color-obsidian-on-surface)" }}
                    >
                      {program.visaFreeCount != null
                        ? `${program.visaFreeCount} countries`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px mb-5"
                  style={{ background: "rgba(187, 196, 247, 0.07)" }}
                />

                {/* Region / type meta */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-widest mb-0.5"
                      style={{ color: "rgba(198, 198, 203, 0.45)" }}
                    >
                      Region
                    </p>
                    <p
                      className="text-sm font-medium capitalize"
                      style={{ color: "var(--color-obsidian-on-surface-variant)" }}
                    >
                      {program.region.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[10px] uppercase tracking-widest mb-0.5"
                      style={{ color: "rgba(198, 198, 203, 0.45)" }}
                    >
                      Currency
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-obsidian-on-surface-variant)" }}
                    >
                      {program.currency}
                    </p>
                  </div>
                </div>

                {/* CTA button */}
                <button
                  type="button"
                  onClick={() => setQualifyOpen(true)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all"
                  style={{
                    background: "var(--color-obsidian-primary)",
                    color: "var(--color-obsidian-on-primary)",
                  }}
                >
                  Check Eligibility
                  <ArrowRight className="h-4 w-4" />
                </button>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* OVERVIEW + RADAR                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Description */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <SectionLabel>Programme Overview</SectionLabel>
            <h2
              className="font-semibold leading-tight mb-6"
              style={{
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "var(--color-obsidian-on-surface)",
                letterSpacing: "-0.02em",
              }}
            >
              {program.country}  - A Strategic<br />
              <span style={{ color: "var(--color-obsidian-primary)" }}>
                Sovereignty Decision
              </span>
            </h2>
            <p
              className="text-base leading-[1.8]"
              style={{ color: "rgba(198, 198, 203, 0.7)" }}
            >
              {program.description}
            </p>
          </motion.div>

          {/* Radar chart */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0.1}
          >
            <GlassCard className="p-6">
              <SectionLabel>Programme Profile</SectionLabel>
              <RadarChart scores={program.radarScores} size="lg" />
              {/* Score labels */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {(
                  [
                    ["cost_score", "Cost"],
                    ["speed_score", "Speed"],
                    ["lifestyle_score", "Lifestyle"],
                    ["tax_score", "Tax"],
                    ["travel_score", "Travel"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="text-center">
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--color-obsidian-primary)" }}
                    >
                      {program.radarScores[key]}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-widest"
                      style={{ color: "rgba(198, 198, 203, 0.45)" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BENEFITS BENTO GRID                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-6" style={{ background: "#0d1018" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            {/* First benefit  - large 2-column card */}
            {program.benefits[0] && (
              <motion.div key={program.benefits[0]} variants={cardReveal} className="md:col-span-2">
                <div
                  className="rounded-xl p-12 h-full flex flex-col justify-between group"
                  style={{ background: "#262a31" }}
                >
                  <div>
                    <span
                      className="material-symbols-outlined text-[2.5rem] mb-8 block"
                      style={{ color: "#bbc4f7" }}
                    >
                      {getBenefitIcon(program.benefits[0])}
                    </span>
                    <h3
                      className="text-3xl mb-4"
                      style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                    >
                      {program.benefits[0].split(" ").slice(0, 3).join(" ")}
                    </h3>
                    <p className="leading-relaxed max-w-sm" style={{ color: "#c6c6cb" }}>
                      {program.benefits[0]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Benefits 2 & 3  - single column cards */}
            {program.benefits.slice(1, 3).map((benefit) => (
              <motion.div key={benefit} variants={cardReveal} className="md:col-span-1">
                <div
                  className="rounded-xl p-10 h-full"
                  style={{ background: "#1c2026" }}
                >
                  <span
                    className="material-symbols-outlined text-[1.75rem] mb-6 block"
                    style={{ color: "#b7c6ed" }}
                  >
                    {getBenefitIcon(benefit)}
                  </span>
                  <h4
                    className="text-xl mb-2"
                    style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    {benefit.split(" ").slice(0, 3).join(" ")}
                  </h4>
                  <p className="text-sm" style={{ color: "#c6c6cb" }}>
                    {benefit}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Benefit 4  - single column */}
            {program.benefits[3] && (
              <motion.div key={program.benefits[3]} variants={cardReveal} className="md:col-span-1">
                <div
                  className="rounded-xl p-10 h-full"
                  style={{ background: "#1c2026" }}
                >
                  <span
                    className="material-symbols-outlined text-[1.75rem] mb-6 block"
                    style={{ color: "#b7c6ed" }}
                  >
                    {getBenefitIcon(program.benefits[3])}
                  </span>
                  <h4
                    className="text-xl mb-2"
                    style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                  >
                    {program.benefits[3].split(" ").slice(0, 3).join(" ")}
                  </h4>
                  <p className="text-sm" style={{ color: "#c6c6cb" }}>
                    {program.benefits[3]}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Sovereign Advantage  - spans 3 columns */}
            <motion.div variants={cardReveal} className="md:col-span-3">
              <div
                className="rounded-xl p-12 relative overflow-hidden"
                style={{ background: "#020c37" }}
              >
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                  <div className="max-w-lg">
                    <h3
                      className="text-3xl mb-4"
                      style={{
                        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                        color: "#bbc4f7",
                      }}
                    >
                      The Sovereign Advantage
                    </h3>
                    <p style={{ color: "#717aa9" }} className="leading-relaxed">
                      {program.marketingHook}
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
                    style={{
                      background: "#bbc4f7",
                      color: "#242d58",
                    }}
                  >
                    Explore Portfolio
                  </Link>
                </div>
                {/* Background decoration */}
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
                  <span className="material-symbols-outlined" style={{ fontSize: "20rem" }}>
                    diamond
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INVESTMENT PROTOCOLS                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-6" style={{ background: "#0a0e14" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-20"
          >
            <h2
              className="font-semibold"
              style={{
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "var(--color-obsidian-on-surface, #dfe2eb)",
                letterSpacing: "-0.02em",
              }}
            >
              Investment Protocols
            </h2>
            <p className="mt-4" style={{ color: "#c6c6cb" }}>
              Select your gateway to {program.country} via verified capital allocation channels.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            {(() => {
              // Split requirements into up to 3 route cards
              const routes = getInvestmentRoutes(program);
              return routes.map((route, idx) => (
                <motion.div key={route.title} variants={cardReveal}>
                  <div
                    className="rounded-xl overflow-hidden flex flex-col h-full border"
                    style={{
                      background: "rgba(38, 42, 49, 0.4)",
                      backdropFilter: "blur(12px)",
                      borderColor: "rgba(69, 71, 75, 0.1)",
                    }}
                  >
                    {/* Image area */}
                    <div
                      className="h-48 relative overflow-hidden flex items-center justify-center"
                      style={{
                        background: [
                          "linear-gradient(135deg, #1a2332 0%, #0d1a2d 100%)",
                          "linear-gradient(135deg, #1a2a1a 0%, #0d2d1a 100%)",
                          "linear-gradient(135deg, #2a1a2a 0%, #1a0d2d 100%)",
                        ][idx % 3],
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "4rem", color: "rgba(187, 196, 247, 0.15)" }}
                      >
                        {["home_work", "account_balance", "workspace_premium"][idx % 3]}
                      </span>
                      {idx === 0 && (
                        <div
                          className="absolute top-4 left-4 px-3 py-1 rounded-sm text-[0.65rem] font-bold uppercase tracking-widest"
                          style={{ background: "#d6c3b7", color: "#3a2e26" }}
                        >
                          Most Preferred
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-10 flex-grow flex flex-col">
                      <h3
                        className="text-2xl mb-6"
                        style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
                      >
                        {route.title}
                      </h3>
                      <ul className="space-y-4 mb-10 flex-grow">
                        {route.items.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm">
                            <span
                              className="material-symbols-outlined text-sm mt-0.5"
                              style={{ color: "#bbc4f7" }}
                            >
                              check_circle
                            </span>
                            <span style={{ color: "#c6c6cb" }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div
                        className="pt-6"
                        style={{ borderTop: "1px solid rgba(69, 71, 75, 0.2)" }}
                      >
                        <span
                          className="text-xs uppercase tracking-widest block mb-2"
                          style={{ color: "#c6c6cb" }}
                        >
                          Duration
                        </span>
                        <span
                          className="text-xl"
                          style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
                        >
                          {route.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ));
            })()}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ISSUANCE PROTOCOL TIMELINE                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 px-6" style={{ background: "#10141a" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-24"
          >
            <span
              className="text-xs uppercase tracking-[0.3em] block mb-4"
              style={{ color: "#d6c3b7", fontFamily: "var(--font-manrope, sans-serif)" }}
            >
              The Journey
            </span>
            <h2
              className="font-semibold"
              style={{
                fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#dfe2eb",
                letterSpacing: "-0.02em",
              }}
            >
              Issuance Protocol
            </h2>
          </motion.div>

          {/* Desktop  - horizontal timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connector line */}
              <div
                className="absolute top-6 left-0 right-0 h-px hidden lg:block"
                style={{ background: "rgba(69, 71, 75, 0.2)" }}
              />

              <div className="grid grid-cols-7 gap-3 relative">
                {STAGES.map((stage, i) => (
                  <motion.div
                    key={stage.stage}
                    className="flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Step circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mb-6 relative z-10 border"
                      style={{
                        background: i === 3 ? "#bbc4f7" : i === STAGES.length - 1 ? "#31353c" : "#31353c",
                        borderColor: i === 3 ? "#bbc4f7" : i === STAGES.length - 1 ? "rgba(214, 195, 183, 0.5)" : "rgba(69, 71, 75, 0.3)",
                        boxShadow: i === 3 ? "0 0 20px rgba(187, 196, 247, 0.3)" : "none",
                      }}
                    >
                      {i === STAGES.length - 1 ? (
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ color: "#d6c3b7" }}
                        >
                          workspace_premium
                        </span>
                      ) : (
                        <span
                          className="text-sm font-bold"
                          style={{ color: i === 3 ? "#242d58" : "#c6c6cb" }}
                        >
                          {String(stage.stage).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <h4
                      className="text-lg mb-2"
                      style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
                    >
                      {stage.label}
                    </h4>
                    <p
                      className="text-xs px-4"
                      style={{ color: "#c6c6cb" }}
                    >
                      {stage.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile  - vertical timeline */}
          <div className="lg:hidden space-y-0">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.stage}
                className="flex gap-4"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Left column  - circle + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border"
                    style={{
                      background: "#10141a",
                      borderColor: "rgba(187, 196, 247, 0.2)",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "rgba(187, 196, 247, 0.6)" }}
                    >
                      {String(stage.stage).padStart(2, "0")}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className="flex-1 w-px my-1"
                      style={{ background: "rgba(187, 196, 247, 0.1)", minHeight: "2rem" }}
                    />
                  )}
                </div>

                {/* Right column  - content */}
                <div className="pb-8 pt-2.5 flex-1">
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--color-obsidian-on-surface)" }}
                  >
                    {stage.label}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(198, 198, 203, 0.55)" }}
                  >
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA SECTION                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="rounded-3xl border overflow-hidden relative"
              style={{
                background: "rgba(38, 42, 49, 0.4)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(187, 196, 247, 0.1)",
              }}
            >
              {/* Ambient top glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(187, 196, 247, 0.4), transparent)",
                }}
              />

              <div className="p-10 text-center">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] mb-6"
                  style={{
                    background: "rgba(187, 196, 247, 0.08)",
                    border: "1px solid rgba(187, 196, 247, 0.15)",
                    color: "rgba(187, 196, 247, 0.6)",
                  }}
                >
                  <span className="material-symbols-outlined text-[11px]">lock</span>
                  Confidential Advisory
                </span>

                <h2
                  className="font-semibold mb-4"
                  style={{
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    color: "var(--color-obsidian-on-surface)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Secure Your<br />
                  <span style={{ color: "var(--color-obsidian-primary)" }}>
                    Sovereign Future
                  </span>
                </h2>

                <p
                  className="text-sm leading-relaxed max-w-lg mx-auto mb-8"
                  style={{ color: "rgba(198, 198, 203, 0.65)" }}
                >
                  Determine whether {program.name} aligns with your wealth
                  profile and personal objectives. Our advisors operate with
                  complete discretion.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setQualifyOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "var(--color-obsidian-primary)",
                      color: "var(--color-obsidian-on-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      checklist
                    </span>
                    Check Qualification
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border"
                    style={{
                      background: "rgba(187, 196, 247, 0.06)",
                      borderColor: "rgba(187, 196, 247, 0.18)",
                      color: "var(--color-obsidian-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      mail
                    </span>
                    Private Enquiry
                  </Link>
                </div>

                <p
                  className="mt-6 text-xs"
                  style={{ color: "rgba(198, 198, 203, 0.35)" }}
                >
                  Free assessment &nbsp;&middot;&nbsp; 2 minutes &nbsp;&middot;&nbsp; No commitment
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* MATERIAL SYMBOLS  - loaded via inline style tag                      */}
      {/* Note: Google Material Symbols must be loaded in the document head.  */}
      {/* If not already present in the root layout, add:                     */}
      {/*   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?  */}
      {/*   family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,     */}
      {/*   100..700,0..1,-50..200" />                                         */}
      {/* ------------------------------------------------------------------ */}

      {/* Qualify modal */}
      <QualifyModal isOpen={qualifyOpen} onClose={() => setQualifyOpen(false)} />
    </div>
  );
}
