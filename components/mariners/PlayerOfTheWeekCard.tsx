import { Trophy } from "lucide-react";
import type { PotwAggregate } from "@/lib/marinersPulse";

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid gap-0.5">
      <span className="font-mono text-[10px] tracking-[0.16em] uppercase tabular text-ink-soft">
        {label}
      </span>
      <span className="font-mono text-base font-semibold tabular text-ink">{value}</span>
    </div>
  );
}

export function PlayerOfTheWeekCard({
  potw,
  blurbSlot,
}: {
  potw: PotwAggregate | null;
  blurbSlot?: React.ReactNode;
}) {
  if (!potw) {
    return (
      <article className="rounded-2xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 sm:p-7">
        <header className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-forest/[0.10] text-forest">
            <Trophy className="size-5" aria-hidden />
          </span>
          <span className="label-eyebrow">Player of the Week</span>
        </header>
        <p className="mt-5 text-ink-soft">
          Stats unavailable for this stretch — check back after the next series.
        </p>
      </article>
    );
  }

  const t = potw.totals;
  return (
    <article className="rounded-2xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 sm:p-7">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-forest/[0.10] text-forest">
          <Trophy className="size-5" aria-hidden />
        </span>
        <span className="label-eyebrow">Mike&apos;s Player of the Week</span>
      </header>
      <h3 className="h-display mt-5 text-3xl text-ink">{potw.name}</h3>
      <p className="mt-1 font-mono text-[11px] tracking-[0.16em] uppercase tabular text-ink-soft">
        {potw.position} · {t.games} {t.games === 1 ? "game" : "games"}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-x-5 gap-y-4 sm:grid-cols-6">
        {potw.kind === "hitter" ? (
          <>
            <StatCell label="AB" value={t.ab ?? 0} />
            <StatCell label="H" value={t.h ?? 0} />
            <StatCell label="HR" value={t.hr ?? 0} />
            <StatCell label="RBI" value={t.rbi ?? 0} />
            <StatCell label="BB" value={t.bb ?? 0} />
            <StatCell label="R" value={t.r ?? 0} />
          </>
        ) : (
          <>
            <StatCell label="IP" value={t.ip ?? 0} />
            <StatCell label="K" value={t.k ?? 0} />
            <StatCell label="ER" value={t.er ?? 0} />
          </>
        )}
      </dl>

      {blurbSlot}
    </article>
  );
}
