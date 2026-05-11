import { put } from "@vercel/blob";
import { fetchSavantBatterPAs, resolveSeason, shiftDays, todayPT } from "@/lib/savant";
import { buildChartPayload } from "@/lib/rollingMetrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "mariners-pulse/savant-rolling.json";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const today = todayPT();
  const startDate = shiftDays(today, -60);
  const season = resolveSeason(today);

  try {
    const pas = await fetchSavantBatterPAs({ startDate, endDate: today, season });
    const payload = buildChartPayload(pas, { season, lastNGameDates: 30, topN: 5 });

    if (payload.hitters.length === 0) {
      return Response.json(
        {
          ok: false,
          error: "no hitters with >= 30 PA in window",
          totalPA: pas.length,
          season,
          windowSpan: payload.windowSpan,
        },
        { status: 200 },
      );
    }

    const blob = await put(BLOB_PATH, JSON.stringify(payload), {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });

    const durationMs = Date.now() - startedAt;
    const log = {
      ok: true,
      updatedAt: payload.updatedAt,
      hitterCount: payload.hitters.length,
      totalPA: pas.length,
      season,
      windowSpan: payload.windowSpan,
      blobUrl: blob.url,
      durationMs,
    };
    console.log("[cron/refresh-savant]", JSON.stringify(log));
    return Response.json(log);
  } catch (err) {
    const message = (err as Error).message;
    console.error("[cron/refresh-savant] failed:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
