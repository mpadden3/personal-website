import { list, put } from "@vercel/blob";
import type { Narrative, SavantSignal, PotwForPrompt } from "./pulseNarrative";
import type { GameSummary, NextSeries } from "./mlb";

const BLOB_PATH = "mariners-pulse/narrative.json";

export type CachedNarrative = {
  updatedAt: string;
  fingerprint: string;
  narrative: Narrative;
};

type NarrativeInput = {
  games: GameSummary[];
  recentContextGames?: GameSummary[];
  potw: PotwForPrompt | null;
  nextSeries: NextSeries | null;
  savantSignals?: { topHitters: SavantSignal[] };
};

// Stable string derived from the inputs that meaningfully affect the LLM
// output. If any of these change, the cached narrative is invalidated and a
// fresh one is generated. Same inputs → same fingerprint → reuse cache.
export function narrativeFingerprint(input: NarrativeInput): string {
  const stable = {
    games: input.games.map((g) => g.gamePk).sort(),
    contextGames: (input.recentContextGames ?? []).map((g) => g.gamePk).sort(),
    potw: input.potw?.name ?? null,
    nextSeries: input.nextSeries
      ? `${input.nextSeries.opponentAbbrev}:${input.nextSeries.firstGameDate}`
      : null,
    savantTrends:
      input.savantSignals?.topHitters
        .map((h) => `${h.name}:${h.trend}`)
        .sort() ?? null,
  };
  return JSON.stringify(stable);
}

function validate(parsed: unknown): CachedNarrative | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.updatedAt !== "string") return null;
  if (typeof o.fingerprint !== "string") return null;
  if (!o.narrative || typeof o.narrative !== "object") return null;
  const n = o.narrative as Record<string, unknown>;
  if (
    typeof n.recap !== "string" ||
    typeof n.playerOfTheWeekBlurb !== "string" ||
    typeof n.oneThingToWatch !== "string"
  ) {
    return null;
  }
  const narrative: Narrative = {
    recap: n.recap,
    playerOfTheWeekBlurb: n.playerOfTheWeekBlurb,
    oneThingToWatch: n.oneThingToWatch,
  };
  if (typeof n.statcastNote === "string" && n.statcastNote.trim()) {
    narrative.statcastNote = n.statcastNote;
  }
  return {
    updatedAt: o.updatedAt,
    fingerprint: o.fingerprint,
    narrative,
  };
}

let cachedUrl: string | null = null;

async function resolveUrl(): Promise<string | null> {
  if (process.env.NARRATIVE_BLOB_URL) return process.env.NARRATIVE_BLOB_URL;
  if (cachedUrl) return cachedUrl;
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    const match = blobs.find((b) => b.pathname === BLOB_PATH);
    if (match) {
      cachedUrl = match.url;
      return match.url;
    }
  } catch (err) {
    console.warn("[narrativeBlob] list failed:", (err as Error).message);
  }
  return null;
}

// In-memory mirror: Vercel Blob's public URL is CDN-cached, so a read taken
// immediately after a write can return stale data. We keep the last-written
// state alongside the Blob write so we can fall back to it.
let memoryMirror: CachedNarrative | null = null;

export async function readCachedNarrative(): Promise<CachedNarrative | null> {
  const url = await resolveUrl();
  if (!url) return memoryMirror;
  try {
    const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const res = await fetch(bust, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return memoryMirror;
    const parsed = (await res.json()) as unknown;
    const fromBlob = validate(parsed);
    if (memoryMirror && fromBlob && memoryMirror.updatedAt > fromBlob.updatedAt) {
      return memoryMirror;
    }
    if (fromBlob) memoryMirror = fromBlob;
    return fromBlob ?? memoryMirror;
  } catch (err) {
    console.warn("[narrativeBlob] read failed:", (err as Error).message);
    return memoryMirror;
  }
}

export async function writeCachedNarrative(payload: CachedNarrative): Promise<void> {
  try {
    const blob = await put(BLOB_PATH, JSON.stringify(payload), {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    cachedUrl = blob.url;
    memoryMirror = payload;
  } catch (err) {
    console.warn("[narrativeBlob] write failed:", (err as Error).message);
  }
}
