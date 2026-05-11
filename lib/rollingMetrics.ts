import type { SavantPA } from "./savant";
import { flipNameToDisplay } from "./savant";

const WINDOW = 30;

export type RollingPoint = {
  date: string;
  rollingXwoba: number;
  rollingWoba: number;
};

export type ChartHitter = {
  playerId: number;
  name: string;
  totalPA: number;
  series: RollingPoint[];
};

export type SavantChartPayload = {
  updatedAt: string;
  season: number;
  windowSpan: { from: string; to: string };
  hitters: ChartHitter[];
};

function rollingMean(values: number[], i: number): number {
  const start = Math.max(0, i - WINDOW + 1);
  let sum = 0;
  let n = 0;
  for (let k = start; k <= i; k++) {
    sum += values[k];
    n += 1;
  }
  return sum / n;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function computeRolling(pas: SavantPA[]): Map<number, { name: string; rolling: RollingPoint[]; pas: SavantPA[] }> {
  const byPlayer = new Map<number, SavantPA[]>();
  for (const pa of pas) {
    const arr = byPlayer.get(pa.playerId) ?? [];
    arr.push(pa);
    byPlayer.set(pa.playerId, arr);
  }

  const out = new Map<number, { name: string; rolling: RollingPoint[]; pas: SavantPA[] }>();
  for (const [playerId, list] of byPlayer.entries()) {
    if (list.length < WINDOW) continue;
    list.sort((a, b) => (a.gameDate === b.gameDate ? 0 : a.gameDate < b.gameDate ? -1 : 1));

    const wobaValues = list.map((p) => p.woba);
    const xwobaValues = list.map((p) => (p.xwoba ?? p.woba));

    const rolling: RollingPoint[] = list.map((pa, i) => ({
      date: pa.gameDate,
      rollingWoba: round3(rollingMean(wobaValues, i)),
      rollingXwoba: round3(rollingMean(xwobaValues, i)),
    }));

    out.set(playerId, { name: flipNameToDisplay(list[0].playerName), rolling, pas: list });
  }
  return out;
}

export function downsampleToGameDates(
  rolling: Map<number, { name: string; rolling: RollingPoint[]; pas: SavantPA[] }>,
  lastNGameDates: number,
): { hitters: ChartHitter[]; windowSpan: { from: string; to: string } } {
  const allDatesSet = new Set<string>();
  for (const { pas } of rolling.values()) {
    for (const p of pas) allDatesSet.add(p.gameDate);
  }
  const allDates = Array.from(allDatesSet).sort();
  const windowDates = allDates.slice(-lastNGameDates);
  const windowSet = new Set(windowDates);

  const hitters: ChartHitter[] = [];
  for (const [playerId, { name, rolling: series, pas }] of rolling.entries()) {
    const byDate = new Map<string, RollingPoint>();
    for (const pt of series) {
      if (!windowSet.has(pt.date)) continue;
      byDate.set(pt.date, pt);
    }
    if (byDate.size === 0) continue;
    const collapsed = windowDates
      .filter((d) => byDate.has(d))
      .map((d) => byDate.get(d)!);
    const paInWindow = pas.filter((p) => windowSet.has(p.gameDate)).length;
    hitters.push({
      playerId,
      name,
      totalPA: paInWindow,
      series: collapsed,
    });
  }

  return {
    hitters,
    windowSpan: {
      from: windowDates[0] ?? "",
      to: windowDates[windowDates.length - 1] ?? "",
    },
  };
}

export function pickTopHitters(hitters: ChartHitter[], n: number): ChartHitter[] {
  return [...hitters].sort((a, b) => b.totalPA - a.totalPA).slice(0, n);
}

export function buildChartPayload(
  pas: SavantPA[],
  opts: { season: number; lastNGameDates?: number; topN?: number },
): SavantChartPayload {
  const lastN = opts.lastNGameDates ?? 30;
  const topN = opts.topN ?? 5;
  const rolling = computeRolling(pas);
  const { hitters, windowSpan } = downsampleToGameDates(rolling, lastN);
  const top = pickTopHitters(hitters, topN);
  return {
    updatedAt: new Date().toISOString(),
    season: opts.season,
    windowSpan,
    hitters: top,
  };
}
