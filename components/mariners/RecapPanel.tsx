const FALLBACK =
  "Game data shown above is the source of truth — AI summary unavailable this refresh.";

export function RecapPanel({ recap }: { recap: string | null | undefined }) {
  const text = recap?.trim() || FALLBACK;
  return (
    <article className="rounded-2xl bg-cream-deep/70 p-7 ring-1 ring-ink/10 sm:p-9">
      <header className="flex items-center justify-between border-b border-ink/10 pb-4">
        <span className="label-eyebrow">Five-Game Read</span>
        <span className="font-mono text-[11px] tabular text-ink-soft">Recap</span>
      </header>
      <p className="display-italic mt-6 text-[20px] leading-relaxed text-ink/90 sm:text-[22px]">
        {text}
      </p>
      <p className="marginalia mt-4">Generated from real game data.</p>
    </article>
  );
}
