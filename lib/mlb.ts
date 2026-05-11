const BASE = "https://statsapi.mlb.com/api/v1";
const MARINERS_TEAM_ID = 136;
const UA = "marinerspulse.mikepadden.dev (mike@mikepadden.dev)";

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

export type NextSeries = {
  opponent: string;
  opponentAbbrev: string;
  firstGameDate: string;
  venue: string;
  homeAway: "home" | "away";
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

export async function getNextSeries(): Promise<NextSeries | null> {
  const today = todayPT();
  const startDate = shiftDays(today, 1);
  const endDate = shiftDays(today, 10);
  const data = await mlbFetch<ScheduleResponse>("/schedule", {
    sportId: "1",
    teamId: String(MARINERS_TEAM_ID),
    startDate,
    endDate,
    hydrate: "team",
  });
  for (const day of data.dates ?? []) {
    for (const g of day.games ?? []) {
      const state = g.status.abstractGameState;
      if (state !== "Preview" && state !== "Live") continue;
      const marinersIsHome = g.teams.home.team.id === MARINERS_TEAM_ID;
      const o = marinersIsHome ? g.teams.away : g.teams.home;
      return {
        opponent: o.team.name,
        opponentAbbrev: o.team.abbreviation ?? o.team.name.slice(0, 3).toUpperCase(),
        firstGameDate: g.officialDate ?? g.gameDate.slice(0, 10),
        venue: g.venue?.name ?? "",
        homeAway: marinersIsHome ? "home" : "away",
      };
    }
  }
  return null;
}
