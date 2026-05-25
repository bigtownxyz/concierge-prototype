"use client";

import { GLASS_DISPLACEMENT_MAP } from "@/lib/glass-displacement-map";

/**
 * Hidden SVG that defines the displacement filter referenced by
 * `.concierge-glass-lens` (in app/globals.css). Render once on a page that
 * uses the liquid-glass treatment.
 *
 * Structure deliberately matches the Apple Tahoe reference component:
 * no <defs> wrapper, no explicit filter region, feImage at 100%/100%,
 * objectBoundingBox primitive units, feGaussianBlur(stdDeviation=0.01)
 * before the feDisplacementMap so the underlying backdrop is gently
 * smoothed before refraction.
 */
export function ConciergeGlassFilter() {
  return (
    <>
      {/* backdrop-filter has to be set via inline <style> because Tailwind v4 /
          Lightning CSS strips the url(#…) reference when the rule lives in a
          processed stylesheet. */}
      <style>{`
        .concierge-glass-lens {
          backdrop-filter: blur(12px) url(#concierge-liquid-glass) saturate(150%);
        }
      `}</style>
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        <filter id="concierge-liquid-glass" primitiveUnits="objectBoundingBox">
          {/* Crop a centred strip of the square normal-map (xMidYMid slice)
              instead of stretching it to fit. The map is designed for
              roughly-square buttons; on a wide card "none" stretches the
              diagonal facets 6:1 and they read as huge chevron bands.
              Slicing keeps the natural per-axis frequency of the map. */}
          <feImage
            result="rawMap"
            width="100%"
            height="100%"
            x="0"
            y="0"
            href={GLASS_DISPLACEMENT_MAP}
            preserveAspectRatio="xMidYMid slice"
          />
          {/* Heavy map blur to dissolve any remaining facet structure into
              continuous gradients. Combined with the slice above, the lens
              surface should now read as one continuous piece of glass. */}
          <feGaussianBlur in="rawMap" stdDeviation="0.08" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.03" result="blur" />
          <feDisplacementMap
            in="blur"
            in2="map"
            scale="0.35"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </>
  );
}
