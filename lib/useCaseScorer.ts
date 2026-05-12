import { list, put } from "@vercel/blob";

export type AxisKey = "helpfulness" | "novelty" | "value" | "feasibility";
export type AxisScore = { value: number; rationale: string };

export type VerdictBand = "build" | "pilot" | "narrow" | "pass";

export type Comparable = {
  title: string;
  url: string;
  note: string;
};

export type Wireframe = {
  url: string;
  prompt: string;
};

export type ScoreRecord = {
  id: string;
  createdAt: string;
  input: {
    description: string;
    clarifications: { question: string; answer: string }[];
  };
  scores: Record<AxisKey, AxisScore>;
  composite: number;
  band: VerdictBand;
  verdictTagline: string;
  summary: string;
  comparables: Comparable[];
  nextSteps: string[];
  appOneLiner: string;
  wireframe?: Wireframe;
};

export const AXIS_WEIGHTS: Record<AxisKey, number> = {
  helpfulness: 0.3,
  novelty: 0.1,
  value: 0.3,
  feasibility: 0.3,
};

export const AXIS_LABELS: Record<AxisKey, string> = {
  helpfulness: "Helpfulness",
  novelty: "Novelty",
  value: "Value",
  feasibility: "Feasibility",
};

export function computeComposite(scores: Record<AxisKey, AxisScore>): number {
  const total =
    scores.helpfulness.value * AXIS_WEIGHTS.helpfulness +
    scores.novelty.value * AXIS_WEIGHTS.novelty +
    scores.value.value * AXIS_WEIGHTS.value +
    scores.feasibility.value * AXIS_WEIGHTS.feasibility;
  return Math.max(0, Math.min(100, Math.round(total * 10)));
}

export function computeVerdict(composite: number): {
  band: VerdictBand;
  label: string;
  colorVar: string;
} {
  if (composite >= 80) return { band: "build", label: "Build it", colorVar: "var(--forest)" };
  if (composite >= 60) return { band: "pilot", label: "Pilot it", colorVar: "var(--peach)" };
  if (composite >= 40)
    return { band: "narrow", label: "Narrow it", colorVar: "var(--amber-status)" };
  return { band: "pass", label: "Pass", colorVar: "var(--rust)" };
}

// 8-char URL-safe random ID. Avoids visually-similar characters.
const ID_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export function generateScoreId(): string {
  const len = 8;
  let id = "";
  for (let i = 0; i < len; i++) {
    id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  }
  return id;
}

const BLOB_PREFIX = "use-case-scores/";

function blobPath(id: string): string {
  return `${BLOB_PREFIX}${id}.json`;
}

// Module-level URL cache by id, plus an in-memory mirror to defeat
// Vercel Blob CDN read-after-write lag.
const urlCache = new Map<string, string>();
const memoryMirror = new Map<string, ScoreRecord>();

async function resolveUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  try {
    const { blobs } = await list({ prefix: blobPath(id) });
    const match = blobs.find((b) => b.pathname === blobPath(id));
    if (match) {
      urlCache.set(id, match.url);
      return match.url;
    }
  } catch (err) {
    console.warn("[useCaseScorer] list failed:", (err as Error).message);
  }
  return null;
}

function validateRecord(parsed: unknown): ScoreRecord | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.createdAt !== "string") return null;
  if (typeof o.composite !== "number") return null;
  if (typeof o.band !== "string") return null;
  if (typeof o.verdictTagline !== "string") return null;
  if (typeof o.summary !== "string") return null;
  if (typeof o.appOneLiner !== "string") return null;
  if (!Array.isArray(o.comparables) || !Array.isArray(o.nextSteps)) return null;
  if (!o.input || typeof o.input !== "object" || !o.scores || typeof o.scores !== "object") {
    return null;
  }
  return o as unknown as ScoreRecord;
}

export async function getScore(id: string): Promise<ScoreRecord | null> {
  const mirrored = memoryMirror.get(id);
  if (mirrored) return mirrored;
  const url = await resolveUrl(id);
  if (!url) return null;
  try {
    const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const res = await fetch(bust, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const parsed = (await res.json()) as unknown;
    const record = validateRecord(parsed);
    if (record) memoryMirror.set(id, record);
    return record;
  } catch (err) {
    console.warn("[useCaseScorer] read failed:", (err as Error).message);
    return null;
  }
}

export async function saveScore(record: ScoreRecord): Promise<void> {
  const blob = await put(blobPath(record.id), JSON.stringify(record), {
    access: "public",
    allowOverwrite: false,
    addRandomSuffix: false,
    contentType: "application/json",
  });
  urlCache.set(record.id, blob.url);
  memoryMirror.set(record.id, record);
}
