import type { AxisKey, AxisScore } from "@/lib/useCaseScorer";
import { AXIS_LABELS } from "@/lib/useCaseScorer";

const AXIS_DESCRIPTIONS: Record<AxisKey, string> = {
  helpfulness: "Does this solve a real, painful problem?",
  novelty: "Is this not already available off the shelf?",
  value: "How much ROI could this realistically produce?",
  feasibility: "How buildable is a useful v1?",
};

export function AxisCard({
  axis,
  score,
}: {
  axis: AxisKey;
  score: AxisScore;
}) {
  const pct = (score.value / 10) * 100;
  return (
    <div className="grid gap-3 rounded-xl border border-ink/10 bg-cream-deep/40 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span className="label-eyebrow">{AXIS_LABELS[axis]}</span>
          <p className="marginalia mt-0.5 text-[12.5px]">
            {AXIS_DESCRIPTIONS[axis]}
          </p>
        </div>
        <span className="h-display tabular text-[28px] leading-none text-ink">
          {score.value}
          <span className="text-[15px] text-ink-soft">/10</span>
        </span>
      </div>

      <div
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]"
      >
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[14px] leading-relaxed text-ink/85">{score.rationale}</p>
    </div>
  );
}
