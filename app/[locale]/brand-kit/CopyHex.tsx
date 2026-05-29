"use client";

import { useState } from "react";

interface SwatchProps {
  name: string;
  hex: string;
  /** Tailwind/role hint shown under the hex */
  role: string;
  /** light = dark text on the swatch, dark = light text */
  text?: "light" | "dark";
  /** add a hairline border for near-background swatches */
  bordered?: boolean;
  className?: string;
}

export function CopyHex({
  name,
  hex,
  role,
  text = "dark",
  bordered = false,
  className = "",
}: SwatchProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable: no-op */
    }
  };

  const fg = text === "dark" ? "#070B22" : "#F5F6FB";
  const sub = text === "dark" ? "rgba(7,11,34,0.62)" : "rgba(245,246,251,0.66)";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${name} ${hex}`}
      className={`group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-xl p-5 text-left transition-transform duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9CCFF]/70 ${className}`}
      style={{
        backgroundColor: hex,
        boxShadow: bordered
          ? "inset 0 0 0 1px rgba(245,246,251,0.10)"
          : "0 24px 60px -28px rgba(0,0,0,0.65)",
      }}
    >
      <span
        className="text-[0.95rem] font-semibold leading-tight tracking-[-0.01em]"
        style={{ color: fg }}
      >
        {name}
      </span>
      <span
        className="mt-1 font-mono text-[0.78rem] tracking-[0.04em]"
        style={{ color: fg }}
      >
        {hex.toUpperCase()}
      </span>
      <span
        className="mt-2 text-[0.62rem] uppercase tracking-[0.22em]"
        style={{ color: sub }}
      >
        {role}
      </span>

      <span
        aria-hidden
        className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          color: fg,
          backgroundColor:
            text === "dark" ? "rgba(7,11,34,0.10)" : "rgba(245,246,251,0.14)",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
