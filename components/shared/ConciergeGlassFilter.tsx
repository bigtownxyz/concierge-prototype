"use client";

import { GLASS_DISPLACEMENT_MAP } from "@/lib/glass-displacement-map";

/**
 * Hidden SVG that defines the displacement filter referenced by
 * `.concierge-glass-lens` (in app/globals.css). Render once on a page that
 * uses the liquid-glass treatment. Safe to mount more than once — the
 * filter id is fixed and the browser deduplicates by id.
 */
export function ConciergeGlassFilter() {
  return (
    <svg
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      aria-hidden
    >
      <filter id="concierge-liquid-glass" primitiveUnits="objectBoundingBox">
        <feImage
          result="map"
          width="100%"
          height="100%"
          x="0"
          y="0"
          href={GLASS_DISPLACEMENT_MAP}
          preserveAspectRatio="none"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
        <feDisplacementMap
          in="blur"
          in2="map"
          scale="0.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
