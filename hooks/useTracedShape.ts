"use client";

import { useEffect, useRef, useState } from "react";

export function useTracedShape(pts: [number, number][]) {
  const ref = useRef<HTMLElement>(null);
  const [clipPath, setClipPath] = useState<string>("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const d =
        `M ${pts[0][0] * width} ${pts[0][1] * height}` +
        pts.slice(1).map(([x, y]) => ` L ${x * width} ${y * height}`).join("") +
        " Z";
      setClipPath(`path('${d}')`);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pts]);

  return { ref, clipPath };
}
