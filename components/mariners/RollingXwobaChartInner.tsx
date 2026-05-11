"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartHitter } from "@/lib/rollingMetrics";

// MLB league-average wOBA (~.315 in recent seasons). Refresh annually if drift matters.
const MLB_LEAGUE_WOBA = 0.315;

const MS_PER_DAY = 86_400_000;

function isoToMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatTick(value: string | number): string {
  if (typeof value === "number") {
    const date = new Date(value);
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
  }
  const [, m, d] = value.split("-").map(Number);
  return `${m}/${d}`;
}

function MlbAvgLabel(props: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}) {
  const { viewBox } = props;
  if (!viewBox) return null;
  const { x = 0, y = 0 } = viewBox;
  const pillW = 108;
  const pillH = 24;
  const px = x + 6;
  const py = y - pillH / 2;
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect
        x={px}
        y={py}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        ry={pillH / 2}
        fill="var(--cream)"
        stroke="var(--ink-soft)"
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      <text
        x={px + pillW / 2}
        y={py + pillH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-mono)"
        fontSize={11.5}
        fill="var(--ink-soft)"
      >
        MLB avg · .315
      </text>
    </g>
  );
}

export function RollingXwobaChartInner({ hitter }: { hitter: ChartHitter }) {
  const data = hitter.series.map((pt) => ({
    dateMs: isoToMs(pt.date),
    date: pt.date,
    xwoba: pt.rollingXwoba,
    woba: pt.rollingWoba,
  }));

  const minMs = data.length ? data[0].dateMs : 0;
  const maxMs = data.length ? data[data.length - 1].dateMs : 0;
  // Generate evenly-spaced ticks across the window (~6 ticks total).
  const span = Math.max(1, maxMs - minMs);
  const tickCount = 6;
  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    const ms = minMs + Math.round((span * i) / (tickCount - 1));
    // Snap to start of UTC day so the formatter doesn't show ambiguous dates.
    ticks.push(Math.floor(ms / MS_PER_DAY) * MS_PER_DAY);
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 14, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--ink)" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="dateMs"
            type="number"
            scale="time"
            domain={[minMs, maxMs]}
            ticks={ticks}
            tickFormatter={formatTick}
            tick={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fill: "var(--ink-soft)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--ink)", strokeOpacity: 0.15 }}
          />
          <YAxis
            domain={[0.2, 0.5]}
            ticks={[0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]}
            tickFormatter={(v: number) => v.toFixed(3)}
            tick={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fill: "var(--ink-soft)",
            }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--cream)",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
            labelFormatter={(v: string | number) => `${hitter.name} · ${formatTick(v)}`}
            formatter={(value: number | string, key: string) => {
              const n = typeof value === "number" ? value.toFixed(3) : String(value);
              return [n, key === "xwoba" ? "xwOBA" : "wOBA"];
            }}
          />
          <Line
            type="monotone"
            dataKey="xwoba"
            stroke="var(--forest)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="woba"
            stroke="var(--forest)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeOpacity={0.7}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <ReferenceLine
            y={MLB_LEAGUE_WOBA}
            stroke="var(--ink-soft)"
            strokeWidth={1.5}
            strokeDasharray="8 5"
            strokeOpacity={0.85}
            ifOverflow="extendDomain"
            label={<MlbAvgLabel />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
