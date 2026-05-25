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
      aria-hidden
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter
          id="concierge-liquid-glass"
          primitiveUnits="objectBoundingBox"
          x="0"
          y="0"
          width="1"
          height="1"
        >
          <feImage
            result="map"
            width="1"
            height="1"
            x="0"
            y="0"
            href={GLASS_DISPLACEMENT_MAP}
            preserveAspectRatio="none"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.01"
            result="blur"
          />
          <feDisplacementMap
            in="blur"
            in2="map"
            scale="0.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
