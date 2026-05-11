export function SavantSignalsPlaceholder({ reason }: { reason: "empty" | "stale" }) {
  const body =
    reason === "stale"
      ? "Today's signals are refreshing — chart should be back tomorrow."
      : "Signals refreshing — check back tomorrow once the daily cron has run.";
  return (
    <div className="rounded-2xl border border-dashed border-ink/25 bg-cream-deep/40 p-8">
      <span className="label-eyebrow">Statcast trend</span>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
