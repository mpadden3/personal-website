export function PulseUnavailable({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-dashed border-ink/25 bg-cream-deep/40 p-8 sm:p-10">
      <span className="label-eyebrow">Mariners Pulse</span>
      <h3 className="h-display mt-3 text-2xl text-ink">{title}</h3>
      <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">{body}</p>
    </article>
  );
}
