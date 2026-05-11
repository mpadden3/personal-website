"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { ChartHitter } from "@/lib/rollingMetrics";
import { ChartSkeleton } from "./ChartSkeleton";

const RollingXwobaChartInner = dynamic(
  () => import("./RollingXwobaChartInner").then((m) => m.RollingXwobaChartInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export function RollingXwobaChart({
  hitters,
  windowSpan,
}: {
  hitters: ChartHitter[];
  windowSpan: { from: string; to: string };
}) {
  const [selectedId, setSelectedId] = useState<number>(hitters[0]?.playerId ?? 0);
  const selected = hitters.find((h) => h.playerId === selectedId) ?? hitters[0];

  return (
    <div className="rounded-2xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 sm:p-7">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <span className="label-eyebrow">30-AB rolling xwOBA</span>
          <p className="mt-1 font-mono text-[11px] tabular text-ink-soft">
            {windowSpan.from} → {windowSpan.to}
          </p>
        </div>
        <span className="font-mono text-[11px] tabular text-ink-soft">
          {selected?.totalPA ?? 0} PA
        </span>
      </header>

      <div
        role="tablist"
        aria-label="Select hitter"
        className="mt-5 flex flex-wrap gap-2"
      >
        {hitters.map((h) => {
          const active = h.playerId === selectedId;
          return (
            <button
              key={h.playerId}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(h.playerId)}
              className={cn(
                "rounded-full px-3 py-1.5 font-mono text-[12px] tracking-[0.02em] tabular transition-colors",
                active
                  ? "bg-forest text-cream ring-1 ring-forest-deep"
                  : "bg-ink/[0.05] text-ink-soft ring-1 ring-ink/10 hover:bg-ink/[0.08] hover:text-ink",
              )}
            >
              {h.name}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {selected ? <RollingXwobaChartInner hitter={selected} /> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tabular text-ink-soft">
        <span className="inline-flex items-center gap-2">
          <span className="block h-0.5 w-6 bg-forest" aria-hidden />
          xwOBA
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="block w-6"
            style={{ borderTop: "2px dashed var(--forest)", opacity: 0.7 }}
            aria-hidden
          />
          wOBA
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="block w-6"
            style={{ borderTop: "1px dashed var(--ink-soft)", opacity: 0.6 }}
            aria-hidden
          />
          MLB avg (.315)
        </span>
      </div>
    </div>
  );
}
