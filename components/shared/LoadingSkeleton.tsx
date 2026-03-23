"use client";

import { cn } from "@/lib/utils";

/**
 * Base shimmer animation — a traveling highlight across the glass surface
 */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]",
        className
      )}
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, transparent 100%)",
      }}
    />
  );
}

interface SkeletonBaseProps {
  className?: string;
}

export function TextSkeleton({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        "h-4 w-full",
        "bg-[rgba(255,255,255,0.04)]",
        className
      )}
    >
      <Shimmer />
    </div>
  );
}

export function AvatarSkeleton({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full",
        "h-10 w-10",
        "bg-[rgba(255,255,255,0.04)]",
        "ring-1 ring-[rgba(255,255,255,0.06)]",
        className
      )}
    >
      <Shimmer className="rounded-full" />
    </div>
  );
}

interface CardSkeletonProps extends SkeletonBaseProps {
  /** Number of text lines to show */
  lines?: number;
  /** Show avatar in the header */
  showAvatar?: boolean;
}

export function CardSkeleton({
  className,
  lines = 3,
  showAvatar = false,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-[rgba(255,255,255,0.04)]",
        "border border-[rgba(255,255,255,0.08)]",
        "backdrop-blur-xl",
        className
      )}
    >
      <Shimmer />
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {showAvatar && <AvatarSkeleton />}
        <div className="flex-1 space-y-2">
          <TextSkeleton className="h-5 w-2/5" />
          <TextSkeleton className="h-3 w-1/4 opacity-60" />
        </div>
      </div>
      {/* Body lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <TextSkeleton
            key={i}
            className={cn(
              "h-3.5",
              i === lines - 1 ? "w-3/5" : "w-full",
              i > 0 && "opacity-70"
            )}
          />
        ))}
      </div>
      {/* Footer bar */}
      <div className="mt-6 flex items-center justify-between">
        <TextSkeleton className="h-8 w-24 rounded-lg" />
        <TextSkeleton className="h-3 w-16 opacity-50" />
      </div>
    </div>
  );
}

/**
 * Page-level skeleton for program grid
 */
export function GridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={2} />
      ))}
    </div>
  );
}
