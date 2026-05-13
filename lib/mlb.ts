const BASE = "https://statsapi.mlb.com/api/v1";
const MARINERS_TEAM_ID = 136;
const UA = "michaelpadden.com (mpadden33@gmail.com)";

export type GameSummary = {
  gamePk: number;
  date: string;
  opponent: string;
  opponentAbbrev: string;
  homeAway: "home" | "away";
  marinersScore: number;
  opponentScore: number;
  result: "W" | "L";
  venue: string;
};

export type BatterLine = {
  personId: number;
  name: string;
  position: string;
  ab: number;
  h: number;
  r: number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  avg: string;
};

export type PitcherLine = {
  personId: number;
  name: string;
  position: string;
  ip: string;
  h: number;
  er: number;
  k: number;
  bb: number;
  era: string;
};

export type Boxscore = {
  gamePk: number;
  batting: BatterLine[];
  pitching: PitcherLine[];
};

export type SeriesRecord = {
  opponent: string;
  opponentAbbrev: string;
  homeAway: "home" | "away";
  venue: string;
  startDate: string;
  endDate: string;
  marinersWins: number;
  opponentWins: number;
  gamesPlayed: number;
  scheduledGames: number;
  status: "complete" | "in_progress" | "upcoming";
  // For in_progress/upcoming series: the date of the next not-yet-final game.
  nextGameDate?: string;
};

export type SeriesContext = {
  // Most recent completed series, newest first. Excludes the current series
  // if one is in progress.
  recentSeries: SeriesRecord[];
  // The series currently underway (at least one game final, at least one not).
  // Null when the team is between series.
  currentSeries: SeriesRecord | null;
  // The next series that has not started yet. Useful when currentSeries is null.
  nextSeries: SeriesRecord | null;
};

async function mlbFetch<T>(path: string, search: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(search)) url.searchParams.set(k, v);
  const fetchOnce = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "application/json" },
        next: { revalidate: 900, tags: ["mariners-pulse"] },
      });
      if (!res.ok) {
        const retry = res.status >= 500 && res.status < 600;
        throw Object.assign(new Error(`MLB ${res.status}`), { retry });
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    return await fetchOnce();
  } catch (err) {
    if ((err as { retry?: boolean }).retry) {
      await new Promise((r) => setTimeout(r, 500));
      return await fetchOnce();
    }
    throw err;
  }
}

function todayPT(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

type ScheduleResponse = {
  dates: Array<{
    date: string;
    games: Array<{
      gamePk: number;
      gameDate: string;
      officialDate?: string;
      status: { codedGameState: string; abstractGameState: string };
      teams: {
        home: { team: { id: number; name: string; abbreviation?: string }; score?: number };
        away: { team: { id: number; name: string; abbreviation?: string }; score?: number };
      };
      venue?: { name: string };
    }>;
  }>;
};

export async function getLastNFinalGames(n = 5): Promise<GameSummary[]> {
  const endDate = todayPT();
  const startDate = shiftDays(endDate, -60);
  const data = await mlbFetch<ScheduleResponse>("/schedule", {
    sportId: "1",
    teamId: String(MARINERS_TEAM_ID),
    startDate,
    endDate,
    hydrate: "team,linescore",
  });
  const games: GameSummary[] = [];
  for (const day of data.dates ?? []) {
    for (const g of day.games ?? []) {
      if (g.status.codedGameState !== "F") continue;
      const marinersIsHome = g.teams.home.team.id === MARINERS_TEAM_ID;
      const m = marinersIsHome ? g.teams.home : g.teams.away;
      const o = marinersIsHome ? g.teams.away : g.teams.home;
      const marinersScore = m.score ?? 0;
      const opponentScore = o.score ?? 0;
      games.push({
        gamePk: g.gamePk,
        date: g.officialDate ?? g.gameDate.slice(0, 10),
        opponent: o.team.name,
        opponentAbbrev: o.team.abbreviation ?? o.team.name.slice(0, 3).toUpperCase(),
        homeAway: marinersIsHome ? "home" : "away",
        marinersScore,
        opponentScore,
        result: marinersScore > opponentScore ? "W" : "L",
        venue: g.venue?.name ?? "",
      });
    }
  }
  games.sort((a, b) => (a.date < b.date ? 1 : -1));
  return games.slice(0, n);
}

type BoxscoreResponse = {
  teams: {
    home: BoxscoreTeam;
    away: BoxscoreTeam;
  };
};

type BoxscoreTeam = {
  team: { id: number };
  players: Record<
    string,
    {
      person: { id: number; fullName: string };
      position?: { abbreviation: string };
      stats?: {
        batting?: {
          atBats?: number;
          hits?: number;
          runs?: number;
          homeRuns?: number;
          rbi?: number;
          baseOnBalls?: number;
          strikeOuts?: number;
          avg?: string;
        };
        pitching?: {
          inningsPitched?: string;
          hits?: number;
          earnedRuns?: number;
          strikeOuts?: number;
          baseOnBalls?: number;
          era?: string;
        };
      };
    }
  >;
};

export async function getBoxscore(gamePk: number): Promise<Boxscore> {
  const data = await mlbFetch<BoxscoreResponse>(`/game/${gamePk}/boxscore`, {});
  const teamSide =
    data.teams.home.team.id === MARINERS_TEAM_ID ? data.teams.home : data.teams.away;
  const batting: BatterLine[] = [];
  const pitching: PitcherLine[] = [];
  for (const p of Object.values(teamSide.players)) {
    const b = p.stats?.batting;
    if (b && (b.atBats ?? 0) > 0) {
      batting.push({
        personId: p.person.id,
        name: p.person.fullName,
        position: p.position?.abbreviation ?? "",
        ab: b.atBats ?? 0,
        h: b.hits ?? 0,
        r: b.runs ?? 0,
        hr: b.homeRuns ?? 0,
        rbi: b.rbi ?? 0,
        bb: b.baseOnBalls ?? 0,
        so: b.strikeOuts ?? 0,
        avg: b.avg ?? ".000",
      });
    }
    const pi = p.stats?.pitching;
    if (pi && pi.inningsPitched && parseFloat(pi.inningsPitched) > 0) {
      pitching.push({
        personId: p.person.id,
        name: p.person.fullName,
        position: p.position?.abbreviation ?? "P",
        ip: pi.inningsPitched ?? "0.0",
        h: pi.hits ?? 0,
        er: pi.earnedRuns ?? 0,
        k: pi.strikeOuts ?? 0,
        bb: pi.baseOnBalls ?? 0,
        era: pi.era ?? "-.--",
      });
    }
  }
  return { gamePk, batting, pitching };
}

type GroupedGame = {
  date: string;
  opponent: string;
  opponentAbbrev: string;
  homeAway: "home" | "away";
  venue: string;
  abstractGameState: "Final" | "Live" | "Preview";
  marinersScore: number;
  opponentScore: number;
};

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.abs(Math.round((db - da) / 86400000));
}

// Group consecutive games against the same opponent into series. We use a
// date-proximity rule (gap <= 2 days) rather than MLB's seriesGameNumber so
// the grouping is deterministic and doesn't depend on undocumented fields.
function groupIntoSeries(games: GroupedGame[]): SeriesRecord[] {
  const groups: GroupedGame[][] = [];
  for (const g of games) {
    const last = groups[groups.length - 1];
    if (last && last[0].opponent === g.opponent) {
      const lastDate = last[last.length - 1].date;
      if (dayDiff(lastDate, g.date) <= 2) {
        last.push(g);
        continue;
      }
    }
    groups.push([g]);
  }
  return groups.map((group) => {
    const first = group[0];
    const last = group[group.length - 1];
    let marinersWins = 0;
    let opponentWins = 0;
    let gamesPlayed = 0;
    let nextGameDate: string | undefined;
    for (const g of group) {
      if (g.abstractGameState === "Final") {
        gamesPlayed += 1;
        if (g.marinersScore > g.opponentScore) marinersWins += 1;
        else opponentWins += 1;
      } else if (!nextGameDate) {
        nextGameDate = g.date;
      }
    }
    const allFinal = group.every((g) => g.abstractGameState === "Final");
    const anyFinal = group.some((g) => g.abstractGameState === "Final");
    const status: SeriesRecord["status"] = allFinal
      ? "complete"
      : anyFinal
        ? "in_progress"
        : "upcoming";
    return {
      opponent: first.opponent,
      opponentAbbrev: first.opponentAbbrev,
      homeAway: first.homeAway,
      venue: first.venue,
      startDate: first.date,
      endDate: last.date,
      marinersWins,
      opponentWins,
      gamesPlayed,
      scheduledGames: group.length,
      status,
      nextGameDate,
    };
  });
}

export async function getSeriesContext(): Promise<SeriesContext> {
  const today = todayPT();
  const startDate = shiftDays(today, -28);
  const endDate = shiftDays(today, 10);
  const data = await mlbFetch<ScheduleResponse>("/schedule", {
    sportId: "1",
    teamId: String(MARINERS_TEAM_ID),
    startDate,
    endDate,
    hydrate: "team",
  });
  const games: GroupedGame[] = [];
  for (const day of data.dates ?? []) {
    for (const g of day.games ?? []) {
      const marinersIsHome = g.teams.home.team.id === MARINERS_TEAM_ID;
      const m = marinersIsHome ? g.teams.home : g.teams.away;
      const o = marinersIsHome ? g.teams.away : g.teams.home;
      const abstractGameState = g.status.abstractGameState as
        | "Final"
        | "Live"
        | "Preview";
      if (
        abstractGameState !== "Final" &&
        abstractGameState !== "Live" &&
        abstractGameState !== "Preview"
      ) {
        continue;
      }
      games.push({
        date: g.officialDate ?? g.gameDate.slice(0, 10),
        opponent: o.team.name,
        opponentAbbrev: o.team.abbreviation ?? o.team.name.slice(0, 3).toUpperCase(),
        homeAway: marinersIsHome ? "home" : "away",
        venue: g.venue?.name ?? "",
        abstractGameState,
        marinersScore: m.score ?? 0,
        opponentScore: o.score ?? 0,
      });
    }
  }
  games.sort((a, b) => (a.date < b.date ? -1 : 1));

  const series = groupIntoSeries(games);
  const completed = series.filter((s) => s.status === "complete");
  const inProgress = series.filter((s) => s.status === "in_progress");
  const upcoming = series.filter((s) => s.status === "upcoming");

  return {
    recentSeries: completed.slice(-3).reverse(),
    currentSeries: inProgress[inProgress.length - 1] ?? null,
    nextSeries: upcoming[0] ?? null,
  };
}
