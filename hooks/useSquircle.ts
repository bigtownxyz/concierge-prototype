"use client";

import { useEffect, useRef, useState } from "react";
import { getSvgPath } from "figma-squircle";

/**
 * cornerRadiusFraction: corner radius as a fraction of the shorter dimension.
 * Measured from the reference screenshot — arc starts ~11% in from the edge.
 * Each card gets a different fraction and smoothing to produce distinct shapes.
 */
export function useSquircle(cornerRadiusFraction: number, cornerSmoothing = 0.72) {
  const ref = useRef<HTMLElement>(null);
  const [clipPath, setClipPath] = useState<string>("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const cornerRadius = Math.min(width, height) * cornerRadiusFraction;
      const path = getSvgPath({
        width,
        height,
        cornerRadius,
        cornerSmoothing,
        preserveSmoothing: true,
      });
      setClipPath(`path('${path}')`);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cornerRadiusFraction, cornerSmoothing]);

  return { ref, clipPath };
}
