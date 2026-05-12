import type { Comparable } from "@/lib/useCaseScorer";

export function ComparablesList({ comparables }: { comparables: Comparable[] }) {
  if (comparables.length === 0) return null;
  return (
    <section className="grid gap-3">
      <span className="label-eyebrow">Already in market</span>
      <p className="marginalia max-w-2xl">
        Tools and products that overlap with this idea — pulled from the live
        web at scoring time, then judged for relevance.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {comparables.map((c) => (
          <li
            key={c.url}
            className="grid gap-1.5 rounded-xl border border-ink/10 bg-cream-deep/30 p-4"
          >
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-forest underline-offset-2 hover:underline"
            >
              {c.title}
            </a>
            <p className="text-[13.5px] leading-relaxed text-ink/80">{c.note}</p>
            <span className="truncate font-mono text-[10.5px] text-ink-soft/80">
              {new URL(c.url).hostname}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
