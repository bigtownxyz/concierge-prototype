// Shared presentational primitives for the programme guide + fee breakdown, so
// both match the page's premium design language. No client-only features here;
// safe to import from client components.
import type { CSSProperties, ReactNode } from "react";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const inView = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
};

export const PRIMARY = "var(--color-obsidian-primary, #bbc4f7)";

export const glass: CSSProperties = {
  background: "rgba(38, 42, 49, 0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
};

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-xs uppercase tracking-[0.3em] block mb-4"
      style={{ color: "#d6c3b7", fontFamily: "var(--font-manrope, sans-serif)" }}
    >
      {children}
    </span>
  );
}

export function Heading({ children }: { children: ReactNode }) {
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

export function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style} aria-hidden>
      {name}
    </span>
  );
}

/** Render text with [bracketed editorial notes] dimmed so placeholders read as intentional. */
export function withNotes(text: string) {
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
