"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  scores: {
    cost_score: number;
    speed_score: number;
    lifestyle_score: number;
    tax_score: number;
    travel_score: number;
  };
  /** Optional second program scores for comparison overlay */
  compareScores?: {
    cost_score: number;
    speed_score: number;
    lifestyle_score: number;
    tax_score: number;
    travel_score: number;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const labels: Record<string, string> = {
  cost_score: "Cost",
  speed_score: "Speed",
  lifestyle_score: "Lifestyle",
  tax_score: "Tax",
  travel_score: "Travel",
};

export function RadarChart({
  scores,
  compareScores,
  className,
  size = "md",
}: RadarChartProps) {
  const data = Object.entries(labels).map(([key, label]) => ({
    subject: label,
    value: scores[key as keyof typeof scores],
    ...(compareScores
      ? { compare: compareScores[key as keyof typeof compareScores] }
      : {}),
  }));

  const heights = { sm: 180, md: 260, lg: 340 };

  return (
    <div className={cn("w-full", className)} style={{ height: heights[size] }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "#8B89A0",
              fontSize: size === "sm" ? 9 : 11,
              fontFamily: "var(--font-inter, sans-serif)",
            }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6B5CE7"
            fill="#6B5CE7"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          {compareScores && (
            <Radar
              name="Compare"
              dataKey="compare"
              stroke="#C9A84C"
              fill="#C9A84C"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
