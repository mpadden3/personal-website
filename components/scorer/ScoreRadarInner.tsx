"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { AXIS_LABELS, type AxisKey, type AxisScore } from "@/lib/useCaseScorer";

const AXIS_ORDER: AxisKey[] = ["helpfulness", "novelty", "value", "feasibility"];

export function ScoreRadarInner({
  scores,
}: {
  scores: Record<AxisKey, AxisScore>;
}) {
  const data = AXIS_ORDER.map((k) => ({
    axis: AXIS_LABELS[k],
    value: scores[k].value,
  }));

  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="var(--ink)" strokeOpacity={0.15} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: "var(--ink-soft)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{
              fill: "var(--ink-soft)",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
            }}
            stroke="var(--ink)"
            strokeOpacity={0.1}
            tickCount={6}
          />
          <Radar
            dataKey="value"
            stroke="var(--forest)"
            strokeWidth={1.5}
            fill="var(--forest)"
            fillOpacity={0.22}
            isAnimationActive
            animationDuration={650}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
