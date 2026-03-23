"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  useTransform,
  motion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  /** Target number to count to */
  value: number;
  /** Optional suffix like "%" or "+" */
  suffix?: string;
  /** Optional prefix like "$" */
  prefix?: string;
  /** Whether to use gold color (for scores/highlights) */
  gold?: boolean;
  /** Animation duration in seconds */
  duration?: number;
  /** Decimal places to show */
  decimals?: number;
  /** Additional className */
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  gold = false,
  duration = 1.5,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 20,
    duration: duration * 1000,
  });

  const displayValue = useTransform(springValue, (latest) =>
    latest.toFixed(decimals)
  );

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  return (
    <span
      ref={ref}
      className={cn(
        "tabular-nums tracking-tight",
        gold
          ? "bg-gradient-to-r from-[#C9A84C] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent"
          : "text-text-primary",
        className
      )}
    >
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix && (
        <span
          className={cn(
            "ml-0.5",
            gold ? "" : "text-text-muted"
          )}
        >
          {suffix}
        </span>
      )}
    </span>
  );
}
