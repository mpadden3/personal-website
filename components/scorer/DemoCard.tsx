import Link from "next/link";
import { computeVerdict, type ScoreRecord } from "@/lib/useCaseScorer";

export function DemoCard({ record }: { record: ScoreRecord }) {
  const verdict = computeVerdict(record.composite);
  return (
    <Link
      href={`/tools/ai-use-case-scorer/${record.id}`}
      className="group grid gap-3 rounded-xl border border-ink/10 bg-cream-deep/40 p-5 transition hover:border-ink/25 hover:bg-cream-deep/70"
    >
      <header className="flex items-baseline justify-between gap-3">
        <span
          className="h-display tabular text-[40px] leading-none"
          style={{ color: verdict.colorVar }}
        >
          {record.composite}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-cream"
          style={{ backgroundColor: verdict.colorVar }}
        >
          {verdict.label}
        </span>
      </header>

      <p className="display-italic text-[16px] leading-snug text-ink">
        {record.verdictTagline}
      </p>
      <p className="text-[13.5px] leading-relaxed text-ink-soft line-clamp-3">
        {record.input.description}
      </p>
      <span className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft transition group-hover:text-forest">
        See the breakdown →
      </span>
    </Link>
  );
}
