import type { AxisKey, ScoreRecord } from "@/lib/useCaseScorer";
import { ScoreHero } from "./ScoreHero";
import { ScoreRadar } from "./ScoreRadar";
import { AxisCard } from "./AxisCard";
import { WireframeSketch } from "./WireframeSketch";
import { ComparablesList } from "./ComparablesList";
import { NextSteps } from "./NextSteps";
import { ShareBar } from "./ShareBar";

const AXIS_ORDER: AxisKey[] = ["helpfulness", "novelty", "value", "feasibility"];

export function ScoreResult({ record }: { record: ScoreRecord }) {
  return (
    <div className="grid gap-12">
      <ScoreHero record={record} />

      <section className="grid gap-3">
        <span className="label-eyebrow">The use case</span>
        <blockquote className="pull-quote max-w-3xl border-l-2 border-forest/40 pl-4 text-[18px] leading-relaxed text-ink/90">
          {record.input.description}
        </blockquote>
        {record.input.clarifications.length > 0 ? (
          <details className="mt-1 text-[13px] text-ink-soft">
            <summary className="cursor-pointer font-mono uppercase tracking-[0.16em] hover:text-ink">
              {record.input.clarifications.length} clarification
              {record.input.clarifications.length === 1 ? "" : "s"}
            </summary>
            <ul className="mt-2 grid gap-2 border-l-2 border-ink/10 pl-4">
              {record.input.clarifications.map((c, i) => (
                <li key={i} className="grid gap-0.5">
                  <span className="font-medium text-ink">{c.question}</span>
                  <span>{c.answer}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-ink/10 bg-cream-deep/40 p-5">
          <ScoreRadar scores={record.scores} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {AXIS_ORDER.map((axis) => (
            <AxisCard key={axis} axis={axis} score={record.scores[axis]} />
          ))}
        </div>
      </section>

      {record.wireframe ? <WireframeSketch wireframe={record.wireframe} /> : null}

      <ComparablesList comparables={record.comparables} />

      <NextSteps steps={record.nextSteps} />

      <ShareBar />
    </div>
  );
}
