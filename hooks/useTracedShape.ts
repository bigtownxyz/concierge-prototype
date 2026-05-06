"use client";

import { useEffect, useRef, useState } from "react";

export function useTracedShape(pts: [number, number][]) {
  const ref = useRef<HTMLElement>(null);
  const [clipPath, setClipPath] = useState<string>("");
  const [pathD, setPathD] = useState<string>("");
  const [viewBox, setViewBox] = useState<string>("0 0 100 100");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      // Use offsetWidth/Height (pre-zoom CSS pixels) rather than
      // getBoundingClientRect (which returns post-zoom values). The
      // public layout wraps content in `zoom: 0.88`, and both CSS
      // `clip-path: path()` resolution and SVG viewBox-to-CSS-box
      // mapping work in pre-zoom space — using post-zoom values here
      // would make the SVG outline render ~13.6% larger than the clip.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (!width || !height || !pts.length) return;
      const d =
        `M ${pts[0][0] * width} ${pts[0][1] * height}` +
        pts.slice(1).map(([x, y]) => ` L ${x * width} ${y * height}`).join("") +
        " Z";
      setClipPath(`path('${d}')`);
      setPathD(d);
      setViewBox(`0 0 ${width} ${height}`);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pts]);

  return { ref, clipPath, pathD, viewBox };
}
