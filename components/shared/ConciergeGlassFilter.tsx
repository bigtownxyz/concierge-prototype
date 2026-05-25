"use client";

/*
 * A smooth lens-shaped normal map generated as inline SVG:
 *   - R channel: linear gradient left (full) → right (none), so pixels on
 *     the left edge are pushed right toward the centre.
 *   - G channel: linear gradient top (full) → bottom (none), so pixels on
 *     the top edge are pushed down toward the centre.
 *   - The two gradients are combined with "screen" blend so they sum
 *     correctly into an RG-encoded normal map with no facets, no
 *     compression artefacts, no directional banding.
 * This replaces the Apple Tahoe WebP map (which was designed for square
 * pill buttons and produced visible chevron banding when stretched across
 * the wide quiz card).
 */
const SMOOTH_LENS_MAP =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" preserveAspectRatio="none">
    <defs>
      <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff0000"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00ff00"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#r)"/>
    <rect width="200" height="200" fill="url(#g)" style="mix-blend-mode:screen"/>
  </svg>`);

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
          <feImage
            result="rawMap"
            width="100%"
            height="100%"
            x="0"
            y="0"
            href={SMOOTH_LENS_MAP}
            preserveAspectRatio="none"
          />
          {/* Light blur on the (already smooth) generated map to soften the
              transition at the very centre. */}
          <feGaussianBlur in="rawMap" stdDeviation="0.02" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.015" result="blur" />
          <feDisplacementMap
            in="blur"
            in2="map"
            scale="0.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </>
  );
}
