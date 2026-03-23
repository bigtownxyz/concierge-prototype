import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  /** Show text alongside the mark */
  showText?: boolean;
}

const sizeMap: Record<LogoSize, { icon: number; text: string; gap: string }> = {
  sm: { icon: 28, text: "text-base", gap: "gap-2" },
  md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-2xl", gap: "gap-3" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring — violet with subtle gradient */}
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="url(#logo-ring)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        {/* C letterform — geometric, open on the right */}
        <path
          d="M30.5 14.5C28.8 13.2 26.5 12.5 24 12.5C17.7 12.5 12.5 17.7 12.5 24C12.5 30.3 17.7 35.5 24 35.5C26.5 35.5 28.8 34.8 30.5 33.5"
          stroke="url(#logo-c)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold accent — a refined serif terminal at the top of the C */}
        <path
          d="M30.5 14.5L34 12.5"
          stroke="#C9A84C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Gold accent — matching terminal at the bottom */}
        <path
          d="M30.5 33.5L34 35.5"
          stroke="#C9A84C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="logo-ring"
            x1="4"
            y1="4"
            x2="44"
            y2="44"
          >
            <stop stopColor="#6B5CE7" stopOpacity="0.6" />
            <stop offset="1" stopColor="#6B5CE7" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient
            id="logo-c"
            x1="12"
            y1="12"
            x2="32"
            y2="36"
          >
            <stop stopColor="#7D70ED" />
            <stop offset="1" stopColor="#6B5CE7" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span
          className={cn(
            "font-display font-semibold tracking-wide text-text-primary",
            text
          )}
          style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)" }}
        >
          Concierge
        </span>
      )}
    </div>
  );
}
