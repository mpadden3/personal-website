import { Eye } from "lucide-react";
import type { NextSeries } from "@/lib/mlb";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function WatchNextCard({
  nextSeries,
  watchSlot,
}: {
  nextSeries: NextSeries | null;
  watchSlot?: React.ReactNode;
}) {
  if (!nextSeries) return null;
  return (
    <article className="rounded-2xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 sm:p-7">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-sky/[0.35] text-forest">
          <Eye className="size-5" aria-hidden />
        </span>
        <span className="label-eyebrow">One Thing to Watch</span>
      </header>
      <h3 className="h-display mt-5 text-2xl text-ink">
        {nextSeries.homeAway === "home" ? "vs " : "at "}
        {nextSeries.opponent}
      </h3>
      <p className="mt-1 font-mono text-[11px] tracking-[0.16em] uppercase tabular text-ink-soft">
        {formatDate(nextSeries.firstGameDate)} · {nextSeries.venue}
      </p>
      {watchSlot}
    </article>
  );
}
