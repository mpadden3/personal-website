"use client";

import { useEffect, useState } from "react";

const TARGET_ISO = "2027-06-19T16:00:00-07:00";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function computeParts(targetMs: number, nowMs: number): Parts {
  const ms = Math.max(0, targetMs - nowMs);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0");
}

export function CountdownHero() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const targetMs = new Date(TARGET_ISO).getTime();
    const tick = () => setParts(computeParts(targetMs, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells: Array<{ label: string; value: string }> = [
    { label: "Days", value: parts ? pad(parts.days, 3) : "—" },
    { label: "Hours", value: parts ? pad(parts.hours) : "—" },
    { label: "Minutes", value: parts ? pad(parts.minutes) : "—" },
    { label: "Seconds", value: parts ? pad(parts.seconds) : "—" },
  ];

  return (
    <section
      aria-label="Countdown to wedding"
      className="mt-10 rounded-2xl border border-ink/10 bg-cream-deep/60 px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="label-eyebrow">Until the wedding</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft tabular">
          June 19, 2027 · Pacific Time
        </span>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-6">
        {cells.map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center rounded-xl bg-cream/80 px-2 py-4 sm:px-3 sm:py-6"
          >
            <span
              className="h-display tabular text-[clamp(2rem,7vw,4.25rem)] leading-none text-forest"
              suppressHydrationWarning
            >
              {c.value}
            </span>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11px]">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
