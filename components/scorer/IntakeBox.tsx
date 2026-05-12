"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Stage =
  | { kind: "idle" }
  | { kind: "intake" } // sending description, waiting on intake parse
  | { kind: "clarifying"; questions: string[]; answers: string[] }
  | { kind: "scoring"; phaseIndex: number }
  | { kind: "error"; message: string };

const SCORING_PHASES = [
  "Reading the idea…",
  "Looking for existing solutions on the web…",
  "Scoring helpfulness, novelty, value, and feasibility…",
  "Sketching what it might look like…",
  "Wrapping up…",
];

export function IntakeBox() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const phaseTimer = useRef<number | null>(null);

  // Cycle through the loading phases on a timer so the wait feels intentional.
  useEffect(() => {
    if (stage.kind !== "scoring") {
      if (phaseTimer.current) {
        window.clearTimeout(phaseTimer.current);
        phaseTimer.current = null;
      }
      return;
    }
    if (stage.phaseIndex >= SCORING_PHASES.length - 1) return;
    phaseTimer.current = window.setTimeout(() => {
      setStage((s) =>
        s.kind === "scoring"
          ? { kind: "scoring", phaseIndex: Math.min(s.phaseIndex + 1, SCORING_PHASES.length - 1) }
          : s,
      );
    }, 3500);
    return () => {
      if (phaseTimer.current) {
        window.clearTimeout(phaseTimer.current);
        phaseTimer.current = null;
      }
    };
  }, [stage]);

  async function startIntake(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (trimmed.length < 10) return;
    setStage({ kind: "intake" });
    try {
      const res = await fetch("/api/use-case-scorer/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        ready?: boolean;
        questions?: string[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setStage({
          kind: "error",
          message: json.error ?? "We couldn't read that input. Try again.",
        });
        return;
      }
      if (json.ready === false && json.questions && json.questions.length > 0) {
        setStage({
          kind: "clarifying",
          questions: json.questions,
          answers: json.questions.map(() => ""),
        });
        return;
      }
      // Ready — go straight to scoring.
      runScoring([]);
    } catch (err) {
      setStage({ kind: "error", message: (err as Error).message });
    }
  }

  async function runScoring(answers: { question: string; answer: string }[]) {
    setStage({ kind: "scoring", phaseIndex: 0 });
    try {
      const res = await fetch("/api/use-case-scorer/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), answers }),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; error?: string };
      if (!res.ok || !json.ok || !json.id) {
        setStage({
          kind: "error",
          message: json.error ?? "Scoring failed. Try again in a minute.",
        });
        return;
      }
      router.push(`/tools/ai-use-case-scorer/${json.id}`);
    } catch (err) {
      setStage({ kind: "error", message: (err as Error).message });
    }
  }

  function submitClarifications(e: React.FormEvent) {
    e.preventDefault();
    if (stage.kind !== "clarifying") return;
    const answered = stage.questions.map((question, i) => ({
      question,
      answer: stage.answers[i].trim(),
    }));
    if (answered.some((a) => a.answer.length === 0)) return;
    runScoring(answered);
  }

  function resetToIdle() {
    setStage({ kind: "idle" });
  }

  const busy = stage.kind === "intake" || stage.kind === "scoring";

  return (
    <div className="grid gap-4">
      <form onSubmit={startIntake} className="grid gap-3">
        <label
          htmlFor="usecase-description"
          className="label-eyebrow"
        >
          Describe the use case
        </label>
        <textarea
          id="usecase-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A Slack bot that summarizes yesterday's standup transcripts and DMs the manager at 8am…"
          rows={4}
          maxLength={4000}
          disabled={busy || stage.kind === "clarifying"}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/70 focus:border-forest focus:outline-none disabled:opacity-60"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="marginalia text-[12.5px]">
            One paragraph is plenty. The AI will ask for more if it needs it.
          </p>
          <button
            type="submit"
            disabled={busy || description.trim().length < 10 || stage.kind === "clarifying"}
            className="cursor-pointer rounded-md bg-forest px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep disabled:opacity-40"
          >
            {stage.kind === "intake" ? "Reading…" : "Score it"}
          </button>
        </div>
      </form>

      {stage.kind === "clarifying" ? (
        <form
          onSubmit={submitClarifications}
          className="grid gap-4 rounded-2xl border border-forest/30 bg-cream-deep/40 p-5"
        >
          <header>
            <span className="label-eyebrow">A couple quick questions</span>
            <p className="marginalia mt-1 text-[13px]">
              These help the score be more honest. Short answers are fine.
            </p>
          </header>
          {stage.questions.map((q, i) => (
            <div key={i} className="grid gap-1.5">
              <label
                htmlFor={`clarify-${i}`}
                className="text-[14px] font-medium text-ink"
              >
                {q}
              </label>
              <textarea
                id={`clarify-${i}`}
                value={stage.answers[i]}
                onChange={(e) => {
                  const v = e.target.value;
                  setStage((s) => {
                    if (s.kind !== "clarifying") return s;
                    const next = [...s.answers];
                    next[i] = v;
                    return { ...s, answers: next };
                  });
                }}
                rows={2}
                maxLength={1000}
                className="w-full rounded-md border border-ink/15 bg-cream px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/70 focus:border-forest focus:outline-none"
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={stage.answers.some((a) => a.trim().length === 0)}
              className="cursor-pointer rounded-md bg-forest px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </form>
      ) : null}

      {stage.kind === "scoring" ? (
        <div className="rounded-2xl border border-ink/10 bg-cream-deep/40 p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-forest"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              {SCORING_PHASES[stage.phaseIndex]}
            </span>
          </div>
          <div
            aria-hidden
            className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-ink/[0.06]"
          >
            <div
              className="h-full rounded-full bg-forest transition-[width] duration-700"
              style={{
                width: `${
                  ((stage.phaseIndex + 1) / SCORING_PHASES.length) * 100
                }%`,
              }}
            />
          </div>
          <p className="marginalia mt-3 text-[12.5px]">
            This step calls the model, searches the web for similar tools, and
            generates a wireframe sketch. Usually 15–25 seconds.
          </p>
        </div>
      ) : null}

      {stage.kind === "error" ? (
        <div className="grid gap-2 rounded-md border border-rust/30 bg-rust/[0.05] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-rust">
            Something went wrong
          </p>
          <p className="text-[14px] text-ink/85">{stage.message}</p>
          <button
            type="button"
            onClick={resetToIdle}
            className="self-start cursor-pointer text-[12.5px] font-mono uppercase tracking-[0.16em] text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
