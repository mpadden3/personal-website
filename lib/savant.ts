import { parse } from "csv-parse/sync";

const BASE = "https://baseballsavant.mlb.com/statcast_search/csv";
const UA = "michaelpadden.com (mpadden33@gmail.com)";

export type SavantPA = {
  playerId: number;
  playerName: string;
  gameDate: string;
  events: string;
  woba: number;
  xwoba: number | null;
};

const REQUIRED_COLUMNS = [
  "player_name",
  "batter",
  "game_date",
  "events",
  "woba_value",
  "estimated_woba_using_speedangle",
] as const;

export function resolveSeason(today: string): number {
  const year = parseInt(today.slice(0, 4), 10);
  const cutoff = `${year}-03-20`;
  return today < cutoff ? year - 1 : year;
}

export function todayPT(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function shiftDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export async function fetchSavantBatterPAs(opts: {
  startDate: string;
  endDate: string;
  season: number;
}): Promise<SavantPA[]> {
  const url = new URL(BASE);
  url.searchParams.set("all", "true");
  url.searchParams.set("hfSea", `${opts.season}|`);
  url.searchParams.set("game_date_gt", opts.startDate);
  url.searchParams.set("game_date_lt", opts.endDate);
  url.searchParams.set("team", "SEA");
  url.searchParams.set("player_type", "batter");
  url.searchParams.set("type", "details");
  url.searchParams.set("min_pas", "0");
  url.searchParams.set("group_by", "name");

  const fetchOnce = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "text/csv" },
        cache: "no-store",
      });
      if (!res.ok) {
        const retry = res.status >= 500 && res.status < 600;
        throw Object.assign(new Error(`Savant ${res.status}`), { retry });
      }
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  };

  let csv: string;
  try {
    csv = await fetchOnce();
  } catch (err) {
    if ((err as { retry?: boolean }).retry) {
      await new Promise((r) => setTimeout(r, 1000));
      csv = await fetchOnce();
    } else {
      throw err;
    }
  }

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;

  if (rows.length === 0) return [];

  for (const col of REQUIRED_COLUMNS) {
    if (!(col in rows[0])) {
      throw new Error(`Savant CSV missing required column: ${col}`);
    }
  }

  const out: SavantPA[] = [];
  for (const row of rows) {
    const events = row.events?.trim();
    if (!events || events === "null") continue;
    const woba = parseFloat(row.woba_value);
    if (!Number.isFinite(woba)) continue;
    const rawX = row.estimated_woba_using_speedangle;
    const xwoba = rawX && rawX !== "null" ? parseFloat(rawX) : NaN;
    out.push({
      playerId: parseInt(row.batter, 10),
      playerName: row.player_name,
      gameDate: row.game_date,
      events,
      woba,
      xwoba: Number.isFinite(xwoba) ? xwoba : null,
    });
  }
  return out;
}

export function flipNameToDisplay(lastFirst: string): string {
  const idx = lastFirst.indexOf(",");
  if (idx === -1) return lastFirst.trim();
  const last = lastFirst.slice(0, idx).trim();
  const first = lastFirst.slice(idx + 1).trim();
  return `${first} ${last}`;
}
