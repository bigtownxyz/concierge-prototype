"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassVariant = "default" | "interactive" | "highlighted";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: GlassVariant;
  className?: string;
  /** Optional glow color override  - defaults to violet for highlighted */
  glowColor?: string;
}

const variantStyles: Record<GlassVariant, string> = {
  default: [
    "bg-[rgba(255,255,255,0.04)]",
    "border border-[rgba(255,255,255,0.08)]",
    "backdrop-blur-xl",
    "rounded-2xl",
  ].join(" "),
  interactive: [
    "bg-[rgba(255,255,255,0.04)]",
    "border border-[rgba(255,255,255,0.08)]",
    "backdrop-blur-xl",
    "rounded-2xl",
    "cursor-pointer",
  ].join(" "),
  highlighted: [
    "bg-[rgba(107,92,231,0.06)]",
    "border border-[rgba(107,92,231,0.25)]",
    "backdrop-blur-xl",
    "rounded-2xl",
  ].join(" "),
};

export function GlassCard({
  children,
  variant = "default",
  className,
  glowColor,
  ...motionProps
}: GlassCardProps) {
  const isInteractive = variant === "interactive";
  const isHighlighted = variant === "highlighted";

  return (
    <motion.div
      className={cn(
        variantStyles[variant],
        "relative overflow-hidden",
        className
      )}
      {...(isInteractive
        ? {
            whileHover: {
              backgroundColor: "rgba(255, 255, 255, 0.07)",
              borderColor: "rgba(255, 255, 255, 0.14)",
              y: -2,
              transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
            },
            whileTap: { scale: 0.985 },
          }
        : {})}
      {...motionProps}
    >
      {/* Subtle inner highlight  - catches the light like beveled glass */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
        }}
      />
      {/* Glow ring for highlighted variant */}
      {isHighlighted && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
          style={{
            boxShadow: `inset 0 0 24px ${glowColor || "rgba(107, 92, 231, 0.15)"}, 0 0 32px ${glowColor || "rgba(107, 92, 231, 0.08)"}`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
