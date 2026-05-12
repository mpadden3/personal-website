import { list, put } from "@vercel/blob";
import type { ChecklistItem, PhaseKey } from "@/data/weddingChecklistSeed";

const BLOB_PATH = "wedding/checklist-state.json";

export type WeddingChecklistState = {
  checked: Record<string, true>;
  custom: ChecklistItem[];
  /** Per-item phase override (applies to both seed and custom items). */
  phaseOverrides: Record<string, PhaseKey>;
  /** Per-item label override (lets users rename a seed item). */
  labelOverrides: Record<string, string>;
  /** Seed item IDs that the user has chosen to hide via delete. */
  deletedSeedIds: string[];
  updatedAt: string;
};

function emptyState(): WeddingChecklistState {
  return {
    checked: {},
    custom: [],
    phaseOverrides: {},
    labelOverrides: {},
    deletedSeedIds: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function isPhase(k: unknown): k is PhaseKey {
  return (
    k === "y1" ||
    k === "m9" ||
    k === "m6" ||
    k === "m4" ||
    k === "m3" ||
    k === "m2" ||
    k === "m1" ||
    k === "w2" ||
    k === "week-of"
  );
}

function validate(parsed: unknown): WeddingChecklistState | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.updatedAt !== "string") return null;
  if (!o.checked || typeof o.checked !== "object") return null;
  if (!Array.isArray(o.custom)) return null;
  const checked: Record<string, true> = {};
  for (const [k, v] of Object.entries(o.checked as Record<string, unknown>)) {
    if (v === true && typeof k === "string") checked[k] = true;
  }
  const custom: ChecklistItem[] = [];
  for (const c of o.custom) {
    if (!c || typeof c !== "object") continue;
    const ci = c as Record<string, unknown>;
    if (typeof ci.id !== "string" || typeof ci.label !== "string" || !isPhase(ci.phase)) continue;
    custom.push({ id: ci.id, label: ci.label, phase: ci.phase });
  }
  const phaseOverrides: Record<string, PhaseKey> = {};
  if (o.phaseOverrides && typeof o.phaseOverrides === "object") {
    for (const [k, v] of Object.entries(o.phaseOverrides as Record<string, unknown>)) {
      if (typeof k === "string" && isPhase(v)) phaseOverrides[k] = v;
    }
  }
  const labelOverrides: Record<string, string> = {};
  if (o.labelOverrides && typeof o.labelOverrides === "object") {
    for (const [k, v] of Object.entries(o.labelOverrides as Record<string, unknown>)) {
      if (typeof k === "string" && typeof v === "string" && v.length > 0 && v.length <= 200) {
        labelOverrides[k] = v;
      }
    }
  }
  const deletedSeedIds: string[] = [];
  if (Array.isArray(o.deletedSeedIds)) {
    for (const id of o.deletedSeedIds) {
      if (typeof id === "string" && id.length > 0 && id.length < 200) deletedSeedIds.push(id);
    }
  }
  return {
    checked,
    custom,
    phaseOverrides,
    labelOverrides,
    deletedSeedIds,
    updatedAt: o.updatedAt,
  };
}

let cachedUrl: string | null = null;
// In-memory mirror: Vercel Blob's public URL is CDN-cached, so a read immediately
// after a write can return stale data. We keep the last-written state alongside
// the Blob write and return it if it's newer than what the network read returns.
let memoryMirror: WeddingChecklistState | null = null;

async function resolveUrl(): Promise<string | null> {
  if (process.env.WEDDING_BLOB_URL) return process.env.WEDDING_BLOB_URL;
  if (cachedUrl) return cachedUrl;
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    const match = blobs.find((b) => b.pathname === BLOB_PATH);
    if (match) {
      cachedUrl = match.url;
      return match.url;
    }
  } catch (err) {
    console.warn("[weddingBlob] list failed:", (err as Error).message);
  }
  return null;
}

export async function getWeddingState(): Promise<WeddingChecklistState> {
  const url = await resolveUrl();
  if (!url) return memoryMirror ?? emptyState();
  try {
    const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const res = await fetch(bust, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return memoryMirror ?? emptyState();
    const parsed = (await res.json()) as unknown;
    const fromBlob = validate(parsed) ?? emptyState();
    // Prefer the mirror if it's newer (covers the post-write CDN lag).
    if (memoryMirror && memoryMirror.updatedAt > fromBlob.updatedAt) {
      return memoryMirror;
    }
    memoryMirror = fromBlob;
    return fromBlob;
  } catch (err) {
    console.warn("[weddingBlob] read failed:", (err as Error).message);
    return memoryMirror ?? emptyState();
  }
}

// Read-modify-write. Last-writer-wins — acceptable for this traffic level.
export async function mutateWeddingState(
  fn: (current: WeddingChecklistState) => WeddingChecklistState,
): Promise<WeddingChecklistState> {
  const current = await getWeddingState();
  const next: WeddingChecklistState = { ...fn(current), updatedAt: new Date().toISOString() };
  const blob = await put(BLOB_PATH, JSON.stringify(next), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
  cachedUrl = blob.url;
  memoryMirror = next;
  return next;
}
