"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const programs = [
  {
    title: "The Alpine Sanctuary",
    subtitle: "Residency by Investment",
    tier: "Tier I",
    timeline: "4-6 Months",
    access: "Schengen Area",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXRNBcTNBecCeTsQPjmi0tN4y9kAs2emo6TmNM6T8H5tkx4FedNHMtF5x2IADYVGrklM2hpb3J_IPk_Wse-A5XHAKwD1dnFA7TTZaLRi4DoO9TowFFR_HPWc7lGYfdDVwZTBIA48bwiC-LnisHbYViG_F99xUfITjrQF1IDETxk1m7KnQifVk6Lqu1w2lizMMECfNHmd3FsW_ZfPp8F5qSaBI-vzy7vjDzMAFZ3WMh1SuUlmjlkpLSVaMcauyPJGh-n9IqhhS5V7zd",
    slug: "alpine-sanctuary",
  },
  {
    title: "The Pacific Gateway",
    subtitle: "Permanent Residency",
    tier: "Elite",
    timeline: "9-12 Months",
    access: "Global Hub",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXJXRFIPfQl9f6XLIOWrsw-5JIBZ6AueMsHtyFmKGucxmy8uVoPuwbzF7RvHokAFPaUOhT4lz48TUGUr0wi1x1UvZkuJz-pbb5-lBS2Y8UZUNtxtqx88Ehw8OeGLIu6x1cVAEBRifveceGTrSGeVWElEn2K6z88QzSGjCuOqfcuEp9xdoFfUfH-fUVVH1YljckRUQPquXA1VG2yG9axYsQgL7dWCwNSa0zDLtAm_rN-TFNu0o_FTmwrMYmJ2xZyCnMxgVlhIz4eKIJ",
    slug: "pacific-gateway",
  },
  {
    title: "The Desert Oasis",
    subtitle: "Golden Visa Program",
    tier: "Legacy",
    timeline: "2-3 Months",
    access: "Tax-Free Zone",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk2cu0A2QcOb4iz8ffogZWZua1ArfvwmiHy6f02IU46JaNt5kNnN_93N8j6hCt5Obyyx2Vri4sNUsc-JhdWX15cZe8H35qCSOk2I9JI36OhKTxvACqOPrs8N6sQa3ugLU6BSVZPa__c1SkFQT8aPo6cXPw2YxgzDzBviDEq_tKv4yPH5YA7jd5KUlKREY6oRYRPSTpDYTvXv0XIeoLkeVBnvR5utehmz6VhPBgX5LJnaWIvJ-OVlnVgyMguOmvdf4lc-tC7ywB3t1I",
    slug: "desert-oasis",
  },
];

function ProgramCard({ program, index }: { program: typeof programs[0]; index: number }) {
  return (
    <motion.div
      className="rounded-3xl p-2 group transition-all duration-500"
      style={{ backgroundColor: "#10141a" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: EASE }}
      whileHover={{ backgroundColor: "#262a31" }}
    >
      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={program.image}
          alt={program.title}
        />
      </div>
      <div className="px-6 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3
              className="text-2xl"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
            >
              {program.title}
            </h3>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
            >
              {program.subtitle}
            </p>
          </div>
          <span
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
            style={{
              fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
              backgroundColor: "#180f08",
              color: "#d6c3b7",
            }}
          >
            {program.tier}
          </span>
        </div>
        <div
          className="flex items-center gap-6 py-4 mb-6"
          style={{ borderTop: "1px solid rgba(69, 71, 75, 0.1)", borderBottom: "1px solid rgba(69, 71, 75, 0.1)" }}
        >
          <div>
            <p
              className="text-[10px] uppercase mb-1"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
            >
              Timeline
            </p>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
            >
              {program.timeline}
            </p>
          </div>
          <div>
            <p
              className="text-[10px] uppercase mb-1"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
            >
              Access
            </p>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
            >
              {program.access}
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="block w-full py-3 text-center rounded-lg font-bold text-sm transition-colors"
          style={{
            fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
            backgroundColor: "#31353c",
            color: "#dfe2eb",
          }}
        >
          Inquire for Details
        </Link>
      </div>
    </motion.div>
  );
}

export function ProgramsShowcase() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10" style={{ backgroundColor: "#0a0e14" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <h2
              className="text-4xl mb-6"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#dfe2eb" }}
            >
              Curated Portfolio
            </h2>
            <p
              className="text-lg"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#c6c6cb" }}
            >
              A strictly vetted selection of residency and citizenship programs chosen for their stability, tax efficiency, and global mobility rating.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/programs"
              className="font-bold flex items-center gap-2 group"
              style={{ fontFamily: "var(--font-manrope, 'Manrope', sans-serif)", color: "#bbc4f7" }}
            >
              View Complete Directory
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, i) => (
            <ProgramCard key={program.slug} program={program} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
