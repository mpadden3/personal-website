import Link from "next/link";
import type { Tool } from "@/data/tools";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type Variant = "compact" | "feature" | "row";

export function ToolCard({
  tool,
  variant = "compact",
  className,
}: {
  tool: Tool;
  variant?: Variant;
  className?: string;
}) {
  const isDisabled = tool.cta === "Coming Soon";

  if (variant === "row") {
    return (
      <article
        className={cn(
          "group relative grid gap-6 border-t border-ink/10 py-8 first:border-t-0 sm:grid-cols-[88px_1fr_auto] sm:items-start sm:py-10",
          className,
        )}
      >
        <div className="flex items-baseline gap-3 sm:block">
          <span className="font-mono text-[11px] tracking-[0.2em] text-ink-soft tabular">
            № {tool.index}
          </span>
          <StatusBadge status={tool.status} className="sm:mt-3 sm:flex" />
        </div>

        <div className="grid gap-4">
          <div>
            <h3 className="h-display text-[clamp(1.5rem,3vw,2.25rem)] text-ink">
              {tool.name}
            </h3>
            {tool.kicker ? (
              <p className="display-italic mt-1 text-base text-ink-soft">
                {tool.kicker}
              </p>
            ) : null}
          </div>
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink/85">
            {tool.description}
          </p>
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

        <div className="self-end sm:self-start">
          <ToolCta tool={tool} />
        </div>
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article
        className={cn(
          "group relative flex h-full flex-col justify-between gap-6 rounded-2xl bg-cream-deep/70 p-7 ring-1 ring-ink/10 transition-all",
          !isDisabled && "hover:-translate-y-0.5 hover:ring-ink/25",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-ink-soft tabular">
            № {tool.index}
          </span>
          <StatusBadge status={tool.status} />
        </header>
        <div className="grid gap-2">
          <h3 className="h-display text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
            {tool.name}
          </h3>
          {tool.kicker ? (
            <p className="display-italic text-base text-ink-soft">
              {tool.kicker}
            </p>
          ) : null}
          <p className="text-[14.5px] leading-relaxed text-ink/85">
            {tool.shortDescription}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 pt-4">
          <ul className="flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 2).map((tag) => (
              <li
                key={tag}
                className="rounded-sm bg-ink/[0.05] px-1.5 py-0.5 font-mono text-[10.5px] tracking-wide text-ink-soft"
              >
                {tag}
              </li>
            ))}
          </ul>
          <ToolCta tool={tool} compact />
        </div>
      </article>
    );
  }

  // compact (default)
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-xl bg-cream-deep/60 p-5 ring-1 ring-ink/10 transition-all",
        !isDisabled && "hover:ring-ink/25",
        className,
      )}
    >
      <header className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-ink-soft tabular">
          № {tool.index}
        </span>
        <StatusBadge status={tool.status} />
      </header>
      <div className="grid gap-1">
        <h3 className="h-display text-2xl text-ink">{tool.name}</h3>
        <p className="text-sm leading-relaxed text-ink/80">
          {tool.shortDescription}
        </p>
      </div>
      <div className="mt-auto pt-2">
        <ToolCta tool={tool} compact />
      </div>
    </article>
  );
}

function ToolCta({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const baseClasses = compact
    ? "inline-flex items-center gap-1.5 text-[13px] font-medium"
    : "inline-flex items-center gap-2 text-[14px] font-medium";

  if (tool.cta === "Coming Soon") {
    return (
      <Link
        href={tool.href}
        className={cn(baseClasses, "text-ink-soft hover:text-ink")}
      >
        <span className="ink-underline">Coming soon</span>
        <span aria-hidden>·</span>
      </Link>
    );
  }

  if (tool.external) {
    return (
      <a
        href={tool.href}
        target="_blank"
        rel="noreferrer"
        className={cn(baseClasses, "text-cobalt hover:text-cobalt-deep")}
      >
        <span className="ink-underline">{tool.cta}</span>
        <span aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <Link
      href={tool.href}
      className={cn(baseClasses, "text-cobalt hover:text-cobalt-deep")}
    >
      <span className="ink-underline">{tool.cta}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
