import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { getMarinersPulse } from "@/lib/marinersPulse";
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

  const { games, potw, nextSeries, narrative, savantPayload } = data;
  const showChart = !!(savantPayload && !savantPayload.stale && savantPayload.hitters.length > 0);

  return (
    <PageShell>
      <section className="mt-12 grid gap-3">
        <span className="label-eyebrow">Last Five Games</span>
        <GameStrip games={[...games].reverse()} />
      </section>

      <section className="mt-10">
        <RecapPanel recap={narrative?.recap} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <PlayerOfTheWeekCard potw={potw} blurb={narrative?.playerOfTheWeekBlurb} />
        <WatchNextCard nextSeries={nextSeries} watch={narrative?.oneThingToWatch} />
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
        {narrative?.statcastNote ? (
          <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{narrative.statcastNote}</p>
        ) : null}
      </section>

      <div className="mt-14 border-t border-ink/10 pt-6">
        <p className="marginalia">
          Game data from the MLB Stats API · Statcast via Baseball Savant · narrative by gpt-5-mini via OpenRouter · refreshes every 15 minutes.
        </p>
      </div>
    </PageShell>
  );
}
