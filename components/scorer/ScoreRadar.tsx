"use client";

import dynamic from "next/dynamic";
import type { AxisKey, AxisScore } from "@/lib/useCaseScorer";

const ScoreRadarInner = dynamic(
  () => import("./ScoreRadarInner").then((m) => m.ScoreRadarInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full animate-pulse rounded-xl bg-ink/[0.04] sm:h-[320px]" />
    ),
  },
);

export function ScoreRadar({ scores }: { scores: Record<AxisKey, AxisScore> }) {
  return <ScoreRadarInner scores={scores} />;
}
