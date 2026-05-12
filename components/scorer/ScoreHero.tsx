"use client";

import { useEffect, useState } from "react";
import { computeVerdict, type ScoreRecord } from "@/lib/useCaseScorer";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function ScoreHero({ record }: { record: ScoreRecord }) {
  const verdict = computeVerdict(record.composite);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(record.composite);
      return;
    }
    const start = performance.now();
    const duration = 950;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      setDisplay(Math.round(record.composite * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [record.composite]);

  return (
    <header className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-start">
        <span
          className="h-display tabular text-[clamp(4.5rem,12vw,7rem)] leading-none text-ink"
          style={{ color: verdict.colorVar }}
        >
          {display}
        </span>
        <span className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-soft">
          out of 100
        </span>
      </div>

      <div>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{
            backgroundColor: verdict.colorVar,
            color: "var(--cream)",
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-cream"
          />
          {verdict.label}
        </span>
        <p className="display-italic mt-3 text-[clamp(1.5rem,3.2vw,2rem)] leading-tight text-ink">
          {record.verdictTagline}
        </p>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink/85">
          {record.summary}
        </p>
      </div>
    </header>
  );
}
