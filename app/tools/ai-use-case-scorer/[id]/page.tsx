import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreResult } from "@/components/scorer/ScoreResult";
import { getScore } from "@/lib/useCaseScorer";
import { demoScoresById } from "@/data/useCaseScorerDemos";

export const dynamic = "force-dynamic";

const tool = tools.find((t) => t.slug === "ai-use-case-scorer")!;

async function loadRecord(id: string) {
  const demo = demoScoresById.get(id);
  if (demo) return demo;
  return getScore(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await loadRecord(id);
  if (!record) {
    return { title: "Score not found · AI Use Case Scorer" };
  }
  return {
    title: `${record.composite}/100 — ${record.verdictTagline}`,
    description: record.summary,
  };
}

export default async function ScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await loadRecord(id);
  if (!record) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
      <div className="grid gap-3 text-ink-soft">
        <Link
          href="/tools/ai-use-case-scorer"
          className="group inline-flex w-fit items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase tabular hover:text-ink"
        >
          <span aria-hidden>←</span>
          <span className="ink-underline">Score another use case</span>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] tabular">
            № {tool.index}
          </span>
          <span className="h-px w-8 bg-ink/30" aria-hidden />
          <StatusBadge status={tool.status} />
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft">
            Scored {new Date(record.createdAt).toISOString().slice(0, 10)}
          </span>
        </div>
      </div>

      <h1 className="h-display mt-7 text-[clamp(1.8rem,3.5vw,2.5rem)] leading-tight text-ink">
        {tool.name}
      </h1>

      <div className="mt-10">
        <ScoreResult record={record} />
      </div>
    </div>
  );
}
