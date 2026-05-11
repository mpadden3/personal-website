import type { SavantChartPayload } from "./rollingMetrics";

export type SavantPayload = SavantChartPayload & { stale: boolean };

const STALE_THRESHOLD_MS = 36 * 60 * 60 * 1000;

function validateShape(parsed: unknown): SavantChartPayload | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.updatedAt !== "string") return null;
  if (typeof o.season !== "number") return null;
  if (!o.windowSpan || typeof o.windowSpan !== "object") return null;
  const ws = o.windowSpan as Record<string, unknown>;
  if (typeof ws.from !== "string" || typeof ws.to !== "string") return null;
  if (!Array.isArray(o.hitters)) return null;
  for (const h of o.hitters) {
    if (!h || typeof h !== "object") return null;
    const hr = h as Record<string, unknown>;
    if (typeof hr.playerId !== "number") return null;
    if (typeof hr.name !== "string") return null;
    if (typeof hr.totalPA !== "number") return null;
    if (!Array.isArray(hr.series)) return null;
  }
  return o as unknown as SavantChartPayload;
}

export async function getSavantChartData(): Promise<SavantPayload | null> {
  const url = process.env.SAVANT_BLOB_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ["savant"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const parsed = (await res.json()) as unknown;
    const valid = validateShape(parsed);
    if (!valid) return null;
    if (valid.hitters.length === 0) return null;
    const ageMs = Date.now() - new Date(valid.updatedAt).getTime();
    return { ...valid, stale: ageMs > STALE_THRESHOLD_MS };
  } catch (err) {
    console.warn("[savantBlob] read failed:", (err as Error).message);
    return null;
  }
}
