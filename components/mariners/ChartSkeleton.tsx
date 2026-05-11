export function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">Statcast trend</span>
        <span className="font-mono text-[11px] tabular text-ink-soft">Loading…</span>
      </div>
      <div className="mt-5 grid h-[280px] place-items-center rounded-xl bg-ink/[0.04]">
        <div className="grid w-2/3 gap-2">
          <div className="h-2 animate-pulse rounded-full bg-ink/10" />
          <div className="h-2 w-3/4 animate-pulse rounded-full bg-ink/10" />
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
