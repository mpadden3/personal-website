import { cache } from "react";
import {
  getLastNFinalGames,
  getBoxscore,
  getNextSeries,
  type GameSummary,
  type NextSeries,
  type BatterLine,
  type PitcherLine,
} from "./mlb";
import {
  generateNarrative,
  type Narrative,
  type PotwForPrompt,
  type SavantSignal,
} from "./pulseNarrative";
import { getSavantChartData, type SavantPayload } from "./savantBlob";
import {
  narrativeFingerprint,
  readCachedNarrative,
  writeCachedNarrative,
} from "./narrativeBlob";

const SEASON_OPENERS: Record<number, string> = {
  2026: "2026-03-26",
  2027: "2027-03-25",
  2028: "2028-03-30",
};

export type PotwAggregate = {
  kind: "hitter" | "pitcher";
  name: string;
  position: string;
  totals: {
    ab?: number;
    h?: number;
    hr?: number;
    rbi?: number;
    bb?: number;
    so?: number;
    r?: number;
    ip?: number;
    er?: number;
    k?: number;
    games: number;
  };
};

export type PulseState =
  | {
      state: "live";
      games: GameSummary[];
      potw: PotwAggregate | null;
      nextSeries: NextSeries | null;
      narrativePromise: Promise<Narrative | null>;
      savantPayload: SavantPayload | null;
    }
  | {
      state: "off-season";
      seasonStartsOn: string;
      savantPayload: SavantPayload | null;
    }
  | {
      state: "error";
    };

function aggregateHitter(lines: BatterLine[]): PotwAggregate | null {
  const byPlayer = new Map<number, { ref: BatterLine; agg: Required<PotwAggregate>["totals"] }>();
  for (const l of lines) {
    const prev = byPlayer.get(l.personId);
    if (prev) {
      prev.agg.ab! += l.ab;
      prev.agg.h! += l.h;
      prev.agg.r! += l.r;
      prev.agg.hr! += l.hr;
      prev.agg.rbi! += l.rbi;
      prev.agg.bb! += l.bb;
      prev.agg.so! += l.so;
      prev.agg.games += 1;
    } else {
      byPlayer.set(l.personId, {
        ref: l,
        agg: {
          ab: l.ab,
          h: l.h,
          r: l.r,
          hr: l.hr,
          rbi: l.rbi,
          bb: l.bb,
          so: l.so,
          games: 1,
        },
      });
    }
  }
  let best: { score: number; entry: { ref: BatterLine; agg: PotwAggregate["totals"] } } | null =
    null;
  for (const entry of byPlayer.values()) {
    const xbh = Math.max(0, entry.agg.h! - entry.agg.hr!); // approximate — boxscore doesn't break out 2B/3B
    const score =
      1 * entry.agg.h! +
      1 * entry.agg.bb! +
      2 * xbh +
      3 * entry.agg.hr! +
      1.5 * entry.agg.rbi! +
      1.5 * entry.agg.r!;
    if (!best || score > best.score) best = { score, entry };
  }
  if (!best) return null;
  return {
    kind: "hitter",
    name: best.entry.ref.name,
    position: best.entry.ref.position,
    totals: best.entry.agg,
  };
}

function aggregatePitcher(lines: PitcherLine[]): PotwAggregate | null {
  const byPlayer = new Map<number, { ref: PitcherLine; ip: number; er: number; k: number; h: number; bb: number; games: number }>();
  for (const l of lines) {
    const ip = parseFloat(l.ip);
    const prev = byPlayer.get(l.personId);
    if (prev) {
      prev.ip += ip;
      prev.er += l.er;
      prev.k += l.k;
      prev.h += l.h;
      prev.bb += l.bb;
      prev.games += 1;
    } else {
      byPlayer.set(l.personId, {
        ref: l,
        ip,
        er: l.er,
        k: l.k,
        h: l.h,
        bb: l.bb,
        games: 1,
      });
    }
  }
  let best: { score: number; entry: { ref: PitcherLine; ip: number; er: number; k: number; h: number; bb: number; games: number } } | null = null;
  for (const entry of byPlayer.values()) {
    const score = 3 * entry.ip + 1.5 * entry.k - 2 * entry.er - 0.5 * (entry.h + entry.bb);
    if (!best || score > best.score) best = { score, entry };
  }
  if (!best) return null;
  return {
    kind: "pitcher",
    name: best.entry.ref.name,
    position: best.entry.ref.position,
    totals: {
      ip: Math.round(best.entry.ip * 10) / 10,
      er: best.entry.er,
      k: best.entry.k,
      games: best.entry.games,
    },
  };
}

function pickPotw(batting: BatterLine[], pitching: PitcherLine[]): PotwAggregate | null {
  const h = aggregateHitter(batting);
  const p = aggregatePitcher(pitching);
  if (h && p) {
    const hScore = (h.totals.h ?? 0) + (h.totals.hr ?? 0) * 2 + (h.totals.rbi ?? 0);
    const pScore = (p.totals.ip ?? 0) + (p.totals.k ?? 0) * 1.2;
    return hScore >= pScore ? h : p;
  }
  return h ?? p;
}

// MLB league-average wOBA (~.315 in recent seasons). Keep in sync with RollingXwobaChartInner.
const MLB_LEAGUE_WOBA = 0.315;
const HOT_THRESHOLD = MLB_LEAGUE_WOBA + 0.015; // .330
const COLD_THRESHOLD = MLB_LEAGUE_WOBA - 0.015; // .300

function classifyTrend(series: Array<{ rollingXwoba: number }>): "hot" | "cold" | "steady" {
  if (series.length === 0) return "steady";
  const current = series[series.length - 1].rollingXwoba;
  if (current >= HOT_THRESHOLD) return "hot";
  if (current <= COLD_THRESHOLD) return "cold";
  return "steady";
}

function buildSavantSignals(payload: SavantPayload | null): { topHitters: SavantSignal[] } | undefined {
  if (!payload || payload.stale || payload.hitters.length === 0) return undefined;
  const top = payload.hitters.slice(0, 4);
  return {
    topHitters: top.map((h) => {
      const last = h.series[h.series.length - 1];
      return {
        name: h.name,
        rollingXwoba30PA: last.rollingXwoba,
        rollingWoba30PA: last.rollingWoba,
        trend: classifyTrend(h.series),
      };
    }),
  };
}

function potwForPrompt(potw: PotwAggregate | null): PotwForPrompt | null {
  if (!potw) return null;
  return {
    name: potw.name,
    position: potw.position,
    totals: potw.totals as Record<string, number | string>,
  };
}

function offSeasonOpener(today: string): string {
  const year = parseInt(today.slice(0, 4), 10);
  const candidates = [year, year + 1];
  for (const y of candidates) {
    const d = SEASON_OPENERS[y];
    if (d && d >= today) return d;
  }
  return SEASON_OPENERS[year + 1] ?? `${year + 1}-03-27`;
}

function todayPT(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const getMarinersPulse = cache(async (): Promise<PulseState> => {
  // Kick off three independent fetches in parallel.
  const gamesPromise = getLastNFinalGames(10);
  const savantPromise = getSavantChartData();
  const nextSeriesPromise = getNextSeries().catch((err) => {
    console.warn("[pulse] next-series fetch failed:", (err as Error).message);
    return null;
  });

  let recentGames: GameSummary[];
  try {
    recentGames = await gamesPromise;
  } catch (err) {
    console.warn("[pulse] schedule fetch failed:", (err as Error).message);
    return { state: "error" };
  }

  if (recentGames.length < 1) {
    const savantPayload = await savantPromise;
    return {
      state: "off-season",
      seasonStartsOn: offSeasonOpener(todayPT()),
      savantPayload,
    };
  }

  const games = recentGames.slice(0, 5);
  const recentContextGames = recentGames.slice(5);

  const boxResults = await Promise.allSettled(games.map((g) => getBoxscore(g.gamePk)));
  const allBatting: BatterLine[] = [];
  const allPitching: PitcherLine[] = [];
  for (const r of boxResults) {
    if (r.status === "fulfilled") {
      allBatting.push(...r.value.batting);
      allPitching.push(...r.value.pitching);
    }
  }

  const potw = pickPotw(allBatting, allPitching);
  const [savantPayload, nextSeries] = await Promise.all([savantPromise, nextSeriesPromise]);
  const savantSignals = buildSavantSignals(savantPayload);

  const narrativeInput = {
    games,
    recentContextGames,
    potw: potwForPrompt(potw),
    nextSeries,
    savantSignals,
  };
  const fingerprint = narrativeFingerprint(narrativeInput);

  // Try the cached narrative first. If the cached fingerprint matches the
  // current inputs, the Suspense boundary resolves instantly and the user
  // never sees the loading state. Otherwise fall back to a live generation
  // (streamed via Suspense) and persist the result for the next visitor.
  const cached = await readCachedNarrative();
  let narrativePromise: Promise<Narrative | null>;
  if (cached && cached.fingerprint === fingerprint) {
    narrativePromise = Promise.resolve(cached.narrative);
  } else {
    narrativePromise = generateNarrative(narrativeInput).then((n) => {
      if (n) {
        // Best-effort write-back so the next visitor hits cache. Don't block
        // the response on it; writeCachedNarrative swallows its own errors.
        void writeCachedNarrative({
          updatedAt: new Date().toISOString(),
          fingerprint,
          narrative: n,
        });
      }
      return n;
    });
  }

  return {
    state: "live",
    games,
    potw,
    nextSeries,
    narrativePromise,
    savantPayload,
  };
});
