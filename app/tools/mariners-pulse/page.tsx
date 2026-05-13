import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { tools } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { getMarinersPulse } from "@/lib/marinersPulse";
import type { Narrative } from "@/lib/pulseNarrative";
import { GameStrip } from "@/components/mariners/GameStrip";
import { RecapPanel } from "@/components/mariners/RecapPanel";
import { PlayerOfTheWeekCard } from "@/components/mariners/PlayerOfTheWeekCard";
import { WatchNextCard } from "@/components/mariners/WatchNextCard";
import { PulseUnavailable } from "@/components/mariners/PulseUnavailable";
import { RollingXwobaChart } from "@/components/mariners/RollingXwobaChart";
import { SavantSignalsPlaceholder } from "@/components/mariners/SavantSignalsPlaceholder";

export const revalidate = 900;

const tool = tools.find((t) => t.slug === "mariners-pulse")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

async function RecapPanelAsync({
  narrativePromise,
}: {
  narrativePromise: Promise<Narrative | null>;
}) {
  const n = await narrativePromise;
  return <RecapPanel recap={n?.recap} />;
}

async function PotwBlurbSlot({
  narrativePromise,
}: {
  narrativePromise: Promise<Narrative | null>;
}) {
  const n = await narrativePromise;
  if (!n?.playerOfTheWeekBlurb) return null;
  return (
    <p className="mt-6 border-t border-ink/10 pt-5 text-[15.5px] leading-relaxed text-ink/85">
      {n.playerOfTheWeekBlurb}
    </p>
  );
}

async function WatchSlot({
  narrativePromise,
}: {
  narrativePromise: Promise<Narrative | null>;
}) {
  const n = await narrativePromise;
  if (!n?.oneThingToWatch) return null;
  return (
    <p className="mt-6 border-t border-ink/10 pt-5 text-[15.5px] leading-relaxed text-ink/85">
      {n.oneThingToWatch}
    </p>
  );
}

async function StatcastNoteAsync({
  narrativePromise,
}: {
  narrativePromise: Promise<Narrative | null>;
}) {
  const n = await narrativePromise;
  if (!n?.statcastNote) return null;
  return (
    <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{n.statcastNote}</p>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
      <div className="grid gap-3 text-ink-soft">
        <Link
          href="/lab"
          className="group inline-flex w-fit items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase tabular hover:text-ink"
        >
          <span aria-hidden>←</span>
          <span className="ink-underline">Back to AI Lab</span>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] tabular">
            № {tool.index}
          </span>
          <span className="h-px w-8 bg-ink/30" aria-hidden />
          <StatusBadge status={tool.status} />
        </div>
      </div>

      <h1 className="h-display mt-7 text-[clamp(2.2rem,5.5vw,4rem)] text-ink">
        {tool.name}
      </h1>
      {tool.kicker ? (
        <p className="display-italic mt-2 text-[18px] text-ink-soft">
          {tool.kicker}
        </p>
      ) : null}

      {children}
    </div>
  );
}

export default async function MarinersPulsePage() {
  const data = await getMarinersPulse();

  if (data.state === "error") {
    return (
      <PageShell>
        <div className="mt-12">
          <PulseUnavailable
            title="Pulse unavailable"
            body="We couldn't reach the MLB feed. Refresh in a few minutes — game data drives the rest of this page."
          />
        </div>
      </PageShell>
    );
  }

  if (data.state === "off-season") {
    return (
      <PageShell>
        <div className="mt-12">
          <PulseUnavailable
            title={`Season starts ${data.seasonStartsOn}.`}
            body="Mariners Pulse goes live with the first game of the year."
          />
        </div>
      </PageShell>
    );
  }

  const { games, potw, seriesContext, narrativePromise, savantPayload } = data;
  const watchSeries = seriesContext.currentSeries ?? seriesContext.nextSeries;
  const showChart = !!(savantPayload && !savantPayload.stale && savantPayload.hitters.length > 0);

  return (
    <PageShell>
      <section className="mt-12 grid gap-3">
        <span className="label-eyebrow">Last Five Games</span>
        <GameStrip games={[...games].reverse()} />
      </section>

      <section className="mt-10">
        <Suspense fallback={<RecapPanel recap="Loading Mariners summary" />}>
          <RecapPanelAsync narrativePromise={narrativePromise} />
        </Suspense>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <PlayerOfTheWeekCard
          potw={potw}
          blurbSlot={
            <Suspense fallback={null}>
              <PotwBlurbSlot narrativePromise={narrativePromise} />
            </Suspense>
          }
        />
        <WatchNextCard
          series={watchSeries}
          watchSlot={
            <Suspense fallback={null}>
              <WatchSlot narrativePromise={narrativePromise} />
            </Suspense>
          }
        />
      </section>

      <section className="mt-10 grid gap-3">
        {showChart ? (
          <RollingXwobaChart
            hitters={savantPayload!.hitters}
            windowSpan={savantPayload!.windowSpan}
          />
        ) : (
          <SavantSignalsPlaceholder reason={savantPayload?.stale ? "stale" : "empty"} />
        )}
        <p className="marginalia">
          30-PA trailing rolling average · solid: xwOBA · dashed: wOBA · top hitters by PA, last 30 game-dates · data via Baseball Savant.
        </p>
        <Suspense fallback={null}>
          <StatcastNoteAsync narrativePromise={narrativePromise} />
        </Suspense>
      </section>

      <div className="mt-14 border-t border-ink/10 pt-6">
        <p className="marginalia">
          Game data from the MLB Stats API · Statcast via Baseball Savant · narrative by gpt-5-mini via OpenRouter · refreshes every 15 minutes.
        </p>
      </div>
    </PageShell>
  );
}
