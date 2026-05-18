"use client";

import { useEffect, useState } from "react";
import { ApplyForProgrammeModal } from "./ApplyForProgrammeModal";

/**
 * Global mount for the programme-first apply flow, triggered anywhere via
 * `window.dispatchEvent(new CustomEvent("open-apply-modal"))`. No programme is
 * pre-selected — Step 1 lets the user pick. Used by the no-context CTAs (nav,
 * landing final CTA, shader hero). Mirrors QualifyModalGlobal.
 */
export function ApplyModalGlobal() {
  const [open, setOpen] = useState(false);
  const [programmes, setProgrammes] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      // Optional payload: dispatch with { detail: { slug } } or { slugs }
      // to pre-select a programme (e.g. a programme card's "Inquire").
      const detail = (e as CustomEvent<{ slug?: string; slugs?: string[] }>).detail;
      const slugs = detail?.slugs ?? (detail?.slug ? [detail.slug] : []);
      setProgrammes(slugs);
      setOpen(true);
    };
    window.addEventListener("open-apply-modal", handler);
    return () => window.removeEventListener("open-apply-modal", handler);
  }, []);

  return (
    <ApplyForProgrammeModal
      isOpen={open}
      onClose={() => setOpen(false)}
      initialProgrammes={programmes}
    />
  );
}
