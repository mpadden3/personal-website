import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { IntakeBox } from "@/components/scorer/IntakeBox";
import { DemoCard } from "@/components/scorer/DemoCard";
import { demoScores } from "@/data/useCaseScorerDemos";

const tool = tools.find((t) => t.slug === "ai-use-case-scorer")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

const AXES = [
  {
    label: "Helpfulness",
    blurb: "Real, painful problem people care about?",
  },
  {
    label: "Novelty",
    blurb: "Not already available off the shelf?",
  },
  {
    label: "Value",
    blurb: "Realistic ROI — time, money, decisions?",
  },
  {
    label: "Feasibility",
    blurb: "Buildable v1 with available tools and data?",
  },
];

export default function AIUseCaseScorerPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
      <div className="grid gap-3 text-ink-soft">
        <Link
          href="/lab"
          className="group inline-flex w-fit items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase tabular hover:text-ink"
        >
          <span aria-hidden>←</span>
          <span className="ink-underline">Back to AI Lab</span>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] tabular">
            № {tool.index}
          </span>
          <span className="h-px w-8 bg-ink/30" aria-hidden />
          <StatusBadge status={tool.status} />
        </div>
      </div>

      <h1 className="h-display mt-7 text-[clamp(2.2rem,5.5vw,4rem)] text-ink">
        {tool.name}
      </h1>
      {tool.kicker ? (
        <p className="display-italic mt-2 text-[18px] text-ink-soft">
          {tool.kicker}
        </p>
      ) : null}

      <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-ink/85">
        Describe an AI use case. The scorer asks a clarifying question or two
        if it needs to, searches the web for tools that already exist,
        produces a four-axis score, and sketches a quick wireframe of what
        the app might look like.
      </p>

      <section className="mt-12">
        <IntakeBox />
      </section>

      <section className="mt-14 grid gap-4">
        <header className="border-b border-ink/10 pb-3">
          <span className="label-eyebrow">What it measures</span>
          <h2 className="h-display mt-1 text-[24px] leading-tight text-ink">
            Four axes, one verdict.
          </h2>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AXES.map((a) => (
            <div
              key={a.label}
              className="grid gap-1 rounded-xl border border-ink/10 bg-cream-deep/30 p-4"
            >
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-forest">
                {a.label}
              </span>
              <p className="text-[13.5px] leading-relaxed text-ink/85">
                {a.blurb}
              </p>
            </div>
          ))}
        </div>
        <p className="marginalia">
          Weighted 30 / 10 / 30 / 30. Composite is 0–100. Higher is always
          better. The model returns the four axis scores; the server enforces
          the math so the verdict can't be jailbroken into a higher number.
        </p>
      </section>

      <section className="mt-14 grid gap-4">
        <header className="border-b border-ink/10 pb-3">
          <span className="label-eyebrow">A few scored ideas</span>
          <h2 className="h-display mt-1 text-[24px] leading-tight text-ink">
            See the tool in action.
          </h2>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoScores.map((d) => (
            <DemoCard key={d.id} record={d} />
          ))}
        </div>
      </section>

      <div className="mt-14 border-t border-ink/10 pt-6">
        <p className="marginalia">
          Scoring uses claude-sonnet-4.6 via OpenRouter, EXA for the web
          search, and OpenAI for the wireframe sketch and content moderation.
          Scored ideas persist via Vercel Blob at unguessable URLs.
        </p>
      </div>
    </div>
  );
}
