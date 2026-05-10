import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { Tool } from "@/data/tools";

export function ComingSoon({
  tool,
  whatToExpect,
}: {
  tool: Tool;
  whatToExpect: string[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-28">
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

      <p className="mt-7 max-w-2xl text-[16.5px] leading-relaxed text-ink/85">
        {tool.description}
      </p>

      <div className="mt-12 grid gap-6 rounded-2xl border border-dashed border-ink/25 bg-cream-deep/50 p-7 sm:p-8">
        <header className="flex items-center justify-between border-b border-ink/10 pb-4">
          <span className="label-eyebrow">What to expect</span>
          <span className="font-mono text-[11px] text-ink-soft tabular">
            v1 sketch
          </span>
        </header>
        <ul className="grid gap-3">
          {whatToExpect.map((line, i) => (
            <li key={i} className="flex items-start gap-4 text-[15.5px]">
              <span className="mt-1 font-mono text-[11px] tracking-[0.18em] text-rust uppercase tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed text-ink/85">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 grid gap-3">
        <span className="label-eyebrow">Tags</span>
        <ul className="-m-1 flex flex-wrap">
          {tool.tags.map((tag) => (
            <li
              key={tag}
              className="m-1 rounded-sm bg-ink/[0.05] px-2 py-1 font-mono text-[11px] tracking-wide text-ink-soft"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 border-t border-ink/10 pt-6">
        <p className="marginalia">
          This page is a placeholder. The tool is being built — expect it to
          show up here when it does something useful.
        </p>
      </div>
    </div>
  );
}
