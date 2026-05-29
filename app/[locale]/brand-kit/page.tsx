import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CopyHex } from "./CopyHex";

export const metadata: Metadata = {
  title: "Brand Guidelines",
  description:
    "The Concierge brand system: logo, typography, colour, art direction, and templates. Private advisory for global mobility.",
  robots: { index: false, follow: false },
};

/* ── Brand tokens (source of truth: the brand guideline) ───────────────── */
const NAVY = "#070B22";
const INDIGO = "#111449";
const TWILIGHT = "#24376B";
const LAVENDER = "#C9CCFF";
const MIST = "#F5F6FB";
const SLATE = "#6F748E";
const GOLD = "#E2C27A";

const SANS = "var(--font-manrope), 'Manrope', sans-serif";
const SERIF =
  "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif";
const SERIF_ITALIC = {
  fontFamily: SERIF,
  fontStyle: "italic" as const,
  letterSpacing: "-0.01em",
};

const sections = [
  { id: "logo", n: "01", label: "Logo" },
  { id: "typography", n: "02", label: "Typography" },
  { id: "color", n: "03", label: "Colour" },
  { id: "art-direction", n: "04", label: "Art Direction" },
  { id: "web", n: "05", label: "Website" },
  { id: "social", n: "06", label: "Social" },
];

/* Small reusable section eyebrow, e.g. "01 / Logo" */
function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="text-[0.7rem] font-medium tracking-[0.3em]"
        style={{ color: GOLD }}
      >
        {n}
      </span>
      <span className="h-px w-8" style={{ backgroundColor: "rgba(201,204,255,0.35)" }} />
      <span
        className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
        style={{ color: LAVENDER }}
      >
        {children}
      </span>
    </div>
  );
}

const principles = [
  {
    title: "Confidential",
    body: "Discretion is the product. Nothing shouts; everything is considered.",
  },
  {
    title: "International",
    body: "A worldview without borders. Cities at night, jurisdictions as opportunity.",
  },
  {
    title: "Precise",
    body: "Strategy, not sentiment. Clean lines, exact figures, no clutter.",
  },
  {
    title: "Calm",
    body: "The composure of people who have planned ahead. Space to breathe.",
  },
  {
    title: "Aspirational",
    body: "A wider life, earned. Refined, never flashy.",
  },
];

/* Atmospheric mood panels — palette-built, not stock photography */
const moods = [
  {
    label: "Coastline, dusk",
    css: `linear-gradient(160deg, ${INDIGO} 0%, ${TWILIGHT} 55%, ${GOLD}33 100%)`,
  },
  {
    label: "Network, global",
    css: `radial-gradient(120% 120% at 70% 20%, ${TWILIGHT} 0%, ${INDIGO} 45%, ${NAVY} 100%)`,
  },
  {
    label: "Skyline, after dark",
    css: `linear-gradient(200deg, ${NAVY} 0%, ${INDIGO} 50%, ${LAVENDER}22 100%)`,
  },
];

export default function BrandKitPage() {
  return (
    <div
      className="min-h-screen w-full antialiased"
      style={{ backgroundColor: NAVY, color: MIST, fontFamily: SANS }}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "rgba(201,204,255,0.10)",
          backgroundColor: "rgba(7,11,34,0.72)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href="/"
            aria-label="Concierge home"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-mark.svg"
              alt=""
              width={28}
              height={28}
              className="h-6 w-6"
            />
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.26em]">
              Brand Guidelines
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[0.72rem] uppercase tracking-[0.18em] text-[#9aa0c0] transition-colors hover:text-[#F5F6FB]"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <Link
            href="/"
            className="rounded-full border px-4 py-2 text-[0.72rem] font-medium tracking-[0.04em] transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(201,204,255,0.25)", color: LAVENDER }}
          >
            Back to site
          </Link>
        </div>
      </header>

      {/* ── Cover ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(90% 80% at 78% -10%, ${TWILIGHT}66 0%, transparent 60%), radial-gradient(70% 60% at 5% 110%, ${INDIGO} 0%, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 lg:px-10 lg:pb-28 lg:pt-28">
          <p
            className="text-[0.72rem] font-semibold uppercase tracking-[0.4em]"
            style={{ color: SLATE }}
          >
            Concierge : Brand System
          </p>
          <h1
            className="mt-8 max-w-4xl text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[0.98] tracking-[-0.03em]"
            style={{ color: MIST }}
          >
            A coherent language for a{" "}
            <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>
              borderless
            </span>{" "}
            brand.
          </h1>
          <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-[#aab0cc]">
            Private advisory for global mobility. This is how Concierge looks,
            reads, and feels across every surface, from the logomark to the
            quiet edges of a social post.
          </p>

          <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
            {[
              ["Discipline", "Nocturnal, luxurious, discreet"],
              ["Type", "Manrope + Instrument Serif"],
              ["Updated", "May 2026"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt
                  className="text-[0.62rem] uppercase tracking-[0.26em]"
                  style={{ color: SLATE }}
                >
                  {k}
                </dt>
                <dd className="mt-1.5 text-[0.95rem] text-[#cfd3e6]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 01 Logo ─────────────────────────────────────────────── */}
      <Section id="logo">
        <Eyebrow n="01">Logo</Eyebrow>
        <SectionTitle>
          The mark holds the <span style={{ ...SERIF_ITALIC, color: GOLD }}>brand</span>.
        </SectionTitle>
        <SectionLede>
          A spherical, horizon-banded mark: the globe seen at a glance. Use the
          primary lockup wherever space allows. Fall back to the stacked or
          icon-only forms when it does not.
        </SectionLede>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Primary lockup */}
          <Panel className="lg:col-span-2 lg:row-span-2 flex flex-col">
            <PanelLabel>Primary lockup</PanelLabel>
            <div className="flex flex-1 items-center justify-center py-14">
              <Image
                src="/logo.svg"
                alt="Concierge primary lockup"
                width={958}
                height={160}
                className="h-12 w-auto md:h-16"
                priority
              />
            </div>
            <p className="text-[0.8rem] leading-relaxed text-[#8c92b0]">
              Mark and wordmark, optically balanced. The default for
              navigation, documents, and signature moments.
            </p>
          </Panel>

          {/* Stacked */}
          <Panel className="flex flex-col">
            <PanelLabel>Stacked lockup</PanelLabel>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
              <Image
                src="/logo-mark.svg"
                alt=""
                width={56}
                height={56}
                className="h-12 w-12"
              />
              <span
                className="text-[1.05rem] font-semibold uppercase tracking-[0.42em]"
                style={{ color: MIST }}
              >
                Concierge
              </span>
            </div>
          </Panel>

          {/* Icon only */}
          <Panel className="flex flex-col">
            <PanelLabel>Icon only</PanelLabel>
            <div className="flex flex-1 items-center justify-center py-8">
              <Image
                src="/logo-mark.svg"
                alt="Concierge icon mark"
                width={64}
                height={64}
                className="h-14 w-14"
              />
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Clear space */}
          <Panel>
            <PanelLabel>Clear space</PanelLabel>
            <div className="mt-6 flex items-center justify-center py-6">
              <div
                className="rounded-lg p-7"
                style={{ boxShadow: `inset 0 0 0 1px ${LAVENDER}30` }}
              >
                <div
                  className="rounded p-5"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${GOLD}40`,
                  }}
                >
                  <Image
                    src="/logo.svg"
                    alt=""
                    width={958}
                    height={160}
                    className="h-7 w-auto"
                  />
                </div>
              </div>
            </div>
            <p className="text-[0.8rem] leading-relaxed text-[#8c92b0]">
              Keep clear space around the lockup equal to the height of the
              mark. Never crowd it with type or graphics.
            </p>
          </Panel>

          {/* Minimum size */}
          <Panel>
            <PanelLabel>Minimum size</PanelLabel>
            <div className="mt-6 flex items-end justify-around gap-6 py-6">
              <MinSize px={16} label="16px">
                <Image src="/logo-mark.svg" alt="" width={16} height={16} className="h-4 w-4" />
              </MinSize>
              <MinSize px={120} label="120px">
                <Image src="/logo.svg" alt="" width={958} height={160} style={{ width: 120, height: "auto" }} />
              </MinSize>
              <MinSize px={160} label="160px">
                <Image src="/logo.svg" alt="" width={958} height={160} style={{ width: 160, height: "auto" }} />
              </MinSize>
            </div>
            <p className="text-[0.8rem] leading-relaxed text-[#8c92b0]">
              Icon mark holds down to 16px. The full lockup needs at least
              120px of width to stay legible.
            </p>
          </Panel>
        </div>
      </Section>

      {/* ── 02 Typography ───────────────────────────────────────── */}
      <Section id="typography">
        <Eyebrow n="02">Typography</Eyebrow>
        <SectionTitle>
          Two voices, one{" "}
          <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>register</span>.
        </SectionTitle>
        <SectionLede>
          Manrope carries the work: clear, modern, dependable. Instrument Serif
          adds the human note, used in italic for a single emphasised word, never
          a full sentence.
        </SectionLede>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelLabel>Manrope : Sans</PanelLabel>
            <p
              className="mt-5 text-[1.7rem] leading-tight tracking-[-0.01em]"
              style={{ color: MIST }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p className="mt-2 text-[1.7rem] leading-tight text-[#aab0cc]">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p className="mt-2 text-[1.7rem] leading-tight text-[#aab0cc]">
              1234567890 !@#$%^&*()_+
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Regular 400", "Medium 500", "Semibold 600", "Bold 700"].map(
                (w) => (
                  <span
                    key={w}
                    className="rounded-full px-3 py-1 text-[0.68rem] tracking-[0.04em]"
                    style={{
                      color: "#aab0cc",
                      boxShadow: "inset 0 0 0 1px rgba(201,204,255,0.16)",
                    }}
                  >
                    {w}
                  </span>
                )
              )}
            </div>
          </Panel>

          <Panel>
            <PanelLabel>Instrument Serif : Accent</PanelLabel>
            <p
              className="mt-5 text-[1.9rem] leading-tight"
              style={{ ...SERIF_ITALIC, color: MIST }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p
              className="mt-1 text-[1.9rem] leading-tight"
              style={{ ...SERIF_ITALIC, color: "#aab0cc" }}
            >
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p
              className="mt-1 text-[1.9rem] leading-tight"
              style={{ ...SERIF_ITALIC, color: "#aab0cc" }}
            >
              1234567890 !@#$%^&*()_+
            </p>
            <p className="mt-6 text-[0.8rem] leading-relaxed text-[#8c92b0]">
              Reserved for emphasis, in italic. One word per headline at most.
            </p>
          </Panel>
        </div>

        {/* Display specimen */}
        <Panel className="mt-6">
          <PanelLabel>Display / H1</PanelLabel>
          <p
            className="mt-6 text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.03em]"
            style={{ color: MIST }}
          >
            Jurisdiction strategy for a{" "}
            <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>borderless</span>{" "}
            life.
          </p>
          <p className="mt-7 max-w-md text-[1rem] leading-relaxed text-[#aab0cc]">
            Discreet advice. Global perspective. Tailored strategies for life
            without borders.
          </p>
        </Panel>

        {/* Scale */}
        <Panel className="mt-6">
          <PanelLabel>Scale</PanelLabel>
          <div className="mt-4 divide-y" style={{ borderColor: "transparent" }}>
            {[
              ["H2 / Section Title", "Manrope Medium", "1.75rem"],
              ["Body Copy", "Manrope Regular", "1rem"],
              ["Caption", "Manrope Regular", "0.8rem"],
              ["Button", "Manrope Semibold", "0.875rem"],
            ].map(([role, font, size], i) => (
              <div
                key={role}
                className="flex items-center justify-between gap-6 py-4"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid rgba(201,204,255,0.08)",
                }}
              >
                <span
                  className="text-[#cfd3e6]"
                  style={{ fontSize: size as string, fontWeight: role === "Button" ? 600 : 400 }}
                >
                  {role}
                </span>
                <span
                  className="shrink-0 text-[0.7rem] uppercase tracking-[0.18em]"
                  style={{ color: SLATE }}
                >
                  {font}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      {/* ── 03 Colour ───────────────────────────────────────────── */}
      <Section id="color">
        <Eyebrow n="03">Colour</Eyebrow>
        <SectionTitle>
          A palette inspired by the{" "}
          <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>night</span>.
        </SectionTitle>
        <SectionLede>
          Luxurious, nocturnal, and discreet. Deep navies carry the surface,
          lavender lifts the eye, and gold appears rarely, only where it counts.
        </SectionLede>

        <p className="mt-12 mb-5 text-[0.68rem] uppercase tracking-[0.26em]" style={{ color: SLATE }}>
          Tap any swatch to copy its value
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <CopyHex name="Midnight Navy" hex={NAVY} role="Surface" text="light" bordered />
          <CopyHex name="Deep Indigo" hex={INDIGO} role="Panel" text="light" />
          <CopyHex name="Twilight Blue" hex={TWILIGHT} role="Depth" text="light" />
          <CopyHex name="Soft Lavender" hex={LAVENDER} role="Primary accent" text="dark" />
          <CopyHex name="Mist White" hex={MIST} role="Text on dark" text="dark" bordered />
          <CopyHex name="Slate Gray" hex={SLATE} role="Muted / caption" text="light" />
          <CopyHex name="Gold Accent" hex={GOLD} role="Rare highlight" text="dark" />
        </div>
      </Section>

      {/* ── 04 Art Direction ────────────────────────────────────── */}
      <Section id="art-direction">
        <Eyebrow n="04">Art Direction</Eyebrow>
        <SectionTitle>
          Cinematic, elegant, and{" "}
          <span style={{ ...SERIF_ITALIC, color: GOLD }}>composed</span>.
        </SectionTitle>
        <SectionLede>
          Cinematic environments, elegant interface, and a global perspective,
          crafted for clarity and discretion. Imagery favours cities at night,
          coastlines, and the quiet luxury of arrival.
        </SectionLede>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ul className="flex flex-col justify-center gap-2">
            {principles.map((p) => (
              <li
                key={p.title}
                className="flex gap-5 rounded-xl px-5 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <div>
                  <p className="text-[1.05rem] font-medium" style={{ color: MIST }}>
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[0.85rem] leading-relaxed text-[#8c92b0]">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-4">
            {moods.map((m, i) => (
              <div
                key={m.label}
                className={`relative overflow-hidden rounded-xl ${
                  i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                }`}
                style={{ background: m.css }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(7,11,34,0.6) 100%)",
                  }}
                />
                <span className="absolute bottom-3 left-4 text-[0.68rem] uppercase tracking-[0.2em] text-white/75">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 05 Website ──────────────────────────────────────────── */}
      <Section id="web">
        <Eyebrow n="05">Website</Eyebrow>
        <SectionTitle>
          Direction in{" "}
          <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>practice</span>.
        </SectionTitle>
        <SectionLede>
          Generous dark space, a single serif accent per headline, and
          programme detail rendered as calm, factual snapshots, never a hard
          sell.
        </SectionLede>

        {/* Mini hero frame */}
        <div
          className="mt-14 overflow-hidden rounded-2xl"
          style={{ boxShadow: `inset 0 0 0 1px ${LAVENDER}1f` }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ backgroundColor: INDIGO }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SLATE }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SLATE }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SLATE }} />
            <span className="ml-3 text-[0.68rem] tracking-[0.04em] text-[#8c92b0]">
              thecitizenshipconcierge.com
            </span>
          </div>
          <div
            className="relative px-7 py-16 md:px-14 md:py-24"
            style={{
              background: `radial-gradient(80% 90% at 80% 0%, ${TWILIGHT}55 0%, transparent 55%), ${NAVY}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Image src="/logo-mark.svg" alt="" width={22} height={22} className="h-5 w-5" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em]">
                Concierge
              </span>
            </div>
            <h3
              className="mt-10 max-w-2xl text-[clamp(1.9rem,4.5vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.025em]"
              style={{ color: MIST }}
            >
              Jurisdiction strategy for a{" "}
              <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>borderless</span>{" "}
              life.
            </h3>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-[#aab0cc]">
              We design discreet, compliant strategies that fit your life, not
              the other way around.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span
                className="rounded-full px-5 py-2.5 text-[0.8rem] font-semibold"
                style={{ backgroundColor: LAVENDER, color: NAVY }}
              >
                Explore programmes
              </span>
              <span
                className="rounded-full px-5 py-2.5 text-[0.8rem] font-medium"
                style={{ color: MIST, boxShadow: `inset 0 0 0 1px ${LAVENDER}33` }}
              >
                How we work
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 06 Social ───────────────────────────────────────────── */}
      <Section id="social" last>
        <Eyebrow n="06">Social</Eyebrow>
        <SectionTitle>
          Templates that travel{" "}
          <span style={{ ...SERIF_ITALIC, color: GOLD }}>well</span>.
        </SectionTitle>
        <SectionLede>
          Three formats carry the brand across channels. The mark sits top-left,
          a serif accent lands once, and the call to action stays in lavender.
        </SectionLede>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* IG Post 1:1 */}
          <SocialFrame ratio="aspect-square" tag="Instagram Post : 1080×1080">
            <h4 className="text-[1.5rem] font-medium leading-[1.05]" style={{ color: MIST }}>
              A wider read on six{" "}
              <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>real pathways</span>.
            </h4>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-[#9aa0c0]">
              Global mobility strategies designed for your life.
            </p>
            <Pill>Explore programmes</Pill>
          </SocialFrame>

          {/* IG Story 9:16 */}
          <SocialFrame ratio="aspect-[9/16]" tag="Instagram Story : 1080×1920">
            <h4 className="text-[1.5rem] font-medium leading-[1.05]" style={{ color: MIST }}>
              Build your next chapter with{" "}
              <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>confidence</span>.
            </h4>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-[#9aa0c0]">
              Discreet advice. Global perspective.
            </p>
            <Pill>Book consultation</Pill>
          </SocialFrame>

          {/* LinkedIn square */}
          <SocialFrame ratio="aspect-square" tag="LinkedIn / Carousel : 1080×1080">
            <p className="text-[0.62rem] uppercase tracking-[0.28em]" style={{ color: SLATE }}>
              Strategic overview
            </p>
            <h4 className="mt-3 text-[1.5rem] font-medium leading-[1.05]" style={{ color: MIST }}>
              The plan,{" "}
              <span style={{ ...SERIF_ITALIC, color: LAVENDER }}>in one view</span>.
            </h4>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-[#9aa0c0]">
              A clear pathway to global mobility, designed for you.
            </p>
          </SocialFrame>
        </div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: "rgba(201,204,255,0.10)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={28} height={28} className="h-6 w-6" />
            <span className="text-[0.8rem] text-[#8c92b0]">
              Concierge : Private advisory for global mobility.
            </span>
          </div>
          <Link
            href="/"
            className="text-[0.78rem] tracking-[0.04em] transition-colors hover:text-[#F5F6FB]"
            style={{ color: LAVENDER }}
          >
            Return to thecitizenshipconcierge.com →
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* ── Layout primitives ─────────────────────────────────────────── */
function Section({
  id,
  children,
  last = false,
}: {
  id: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t"
      style={{ borderColor: "rgba(201,204,255,0.08)" }}
    >
      <div
        className={`mx-auto max-w-6xl px-6 lg:px-10 ${
          last ? "py-20 lg:py-28" : "py-20 lg:py-24"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-7 max-w-3xl text-[clamp(1.9rem,4.5vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.025em]">
      {children}
    </h2>
  );
}

function SectionLede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-[#aab0cc]">
      {children}
    </p>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-7 ${className}`}
      style={{
        backgroundColor: "rgba(17,20,73,0.4)",
        boxShadow: "inset 0 0 0 1px rgba(201,204,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.62rem] uppercase tracking-[0.26em]" style={{ color: "#6F748E" }}>
      {children}
    </p>
  );
}

function MinSize({
  px,
  label,
  children,
}: {
  px: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-end" style={{ minHeight: 44 }}>
        {children}
      </div>
      <span className="text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: "#6F748E" }}>
        {label}
      </span>
    </div>
  );
}

function SocialFrame({
  ratio,
  tag,
  children,
}: {
  ratio: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`relative flex w-full flex-col justify-end overflow-hidden rounded-2xl p-6 ${ratio}`}
        style={{
          background: `radial-gradient(90% 70% at 85% 8%, ${TWILIGHT}66 0%, transparent 55%), linear-gradient(180deg, ${INDIGO} 0%, ${NAVY} 100%)`,
          boxShadow: `inset 0 0 0 1px ${LAVENDER}1f`,
        }}
      >
        <div className="absolute left-6 top-6 flex items-center gap-2">
          <Image src="/logo-mark.svg" alt="" width={18} height={18} className="h-4 w-4" />
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.26em]">
            Concierge
          </span>
        </div>
        {children}
      </div>
      <p className="mt-3 text-[0.66rem] uppercase tracking-[0.2em]" style={{ color: "#6F748E" }}>
        {tag}
      </p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mt-5 inline-block rounded-full px-4 py-2 text-[0.72rem] font-semibold"
      style={{ backgroundColor: LAVENDER, color: NAVY }}
    >
      {children}
    </span>
  );
}
