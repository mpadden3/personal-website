import type { Metadata } from "next";
import { tools } from "@/data/tools";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "AI Lab",
  description:
    "A small, ongoing collection of practical AI tools — research, sports, weddings, and AI use case discovery.",
};

const liveCount = tools.filter((t) => t.status === "live").length;
const inProgressCount = tools.filter((t) => t.status === "in-progress").length;
const plannedCount = tools.filter((t) => t.status === "planned").length;

export default function LabPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.5fr_1fr] lg:px-10 lg:py-24">
          <div>
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="font-mono text-[11px] tracking-[0.2em] tabular">
                № 02
              </span>
              <span className="h-px w-8 bg-ink/30" aria-hidden />
              <span className="label-eyebrow">The Workshop</span>
            </div>
            <h1 className="h-display mt-7 text-[clamp(2.5rem,6vw,4.5rem)] text-ink">
              The{" "}
              <span className="display-italic text-forest">AI Lab.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/85">
              A collection of practical, personal, and sometimes ridiculous AI
              tools I&apos;m building to explore how AI can make everyday
              workflows more useful.
            </p>
          </div>

          {/* Lab metadata card */}
          <div className="grid gap-3 self-end rounded-xl border border-ink/15 bg-cream-deep/60 p-6">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <span className="label-eyebrow">Lab status</span>
              <span className="font-mono text-[11px] text-ink-soft tabular">
                {tools.length.toString().padStart(2, "0")} entries
              </span>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-ink/10">
              <div className="px-2 first:pl-0">
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-soft uppercase">
                  Live
                </dt>
                <dd className="display-italic mt-1 text-2xl text-sage tabular">
                  {liveCount}
                </dd>
              </div>
              <div className="px-2">
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-soft uppercase">
                  In prog.
                </dt>
                <dd className="display-italic mt-1 text-2xl text-amber-status tabular">
                  {inProgressCount}
                </dd>
              </div>
              <div className="px-2">
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-soft uppercase">
                  Planned
                </dt>
                <dd className="display-italic mt-1 text-2xl text-ink-soft tabular">
                  {plannedCount}
                </dd>
              </div>
            </dl>
            <p className="marginalia mt-2">
              Updated as the workshop produces. Subjects to no quarterly OKRs.
            </p>
          </div>
        </div>
      </section>

      {/* TOOL LISTING */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-0">
          {tools.map((t) => (
            <ToolCard key={t.slug} tool={t} variant="row" />
          ))}
        </div>
      </section>

      {/* INVITE / ADJUNCT NOTE */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-6 rounded-2xl border border-dashed border-ink/25 bg-cream/60 p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="font-mono text-[11px] tracking-[0.22em] text-rust uppercase tabular">
            Outside this site
          </span>
          <p className="text-[15px] leading-relaxed text-ink/85">
            Ashley&apos;s AI Assistant lives as its own deployed app — linked
            from here, but kept independent so it can change without dragging
            the lab with it.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 self-start rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-cream hover:bg-forest-deep sm:self-auto"
          >
            Open the assistant
            <span aria-hidden>↗</span>
          </a>
        </div>
      </section>
    </div>
  );
}
