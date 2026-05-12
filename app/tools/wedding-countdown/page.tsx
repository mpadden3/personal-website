import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownHero } from "@/components/wedding/CountdownHero";
import { ChecklistPanel } from "@/components/wedding/ChecklistPanel";
import { WeddingChat } from "@/components/wedding/WeddingChat";
import { getWeddingState } from "@/lib/weddingBlob";

export const dynamic = "force-dynamic";

const tool = tools.find((t) => t.slug === "wedding-countdown")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

export default async function WeddingCountdownPage() {
  const state = await getWeddingState();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
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

      <CountdownHero />
      <ChecklistPanel initialState={state} />
      <WeddingChat />

      <div className="mt-14 border-t border-ink/10 pt-6">
        <p className="marginalia">
          Checklist persists in Vercel Blob · planning assistant uses
          claude-sonnet-4.6 via OpenRouter with EXA web search · budget and
          headcount details stay private.
        </p>
      </div>
    </div>
  );
}
