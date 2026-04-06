import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  /** Show text alongside the mark */
  showText?: boolean;
}

const sizeMap: Record<LogoSize, { height: number; text: string; gap: string }> = {
  sm: { height: 28, text: "text-base", gap: "gap-2" },
  md: { height: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { height: 48, text: "text-2xl", gap: "gap-3" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const { height, gap } = sizeMap[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      <Image
        src="/logo.svg"
        alt="Concierge"
        width={height * 4}
        height={height}
        style={{ height: `${height}px`, width: "auto" }}
        priority
      />
    </div>
  );
}
