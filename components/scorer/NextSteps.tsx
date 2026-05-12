export function NextSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="grid gap-4 rounded-2xl border border-dashed border-ink/25 bg-cream-deep/40 p-7 sm:p-8">
      <header className="flex items-center justify-between border-b border-ink/10 pb-3">
        <span className="label-eyebrow">If you pursue this</span>
        <span className="font-mono text-[11px] text-ink-soft tabular">
          {steps.length} step{steps.length === 1 ? "" : "s"}
        </span>
      </header>
      <ol className="grid gap-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-4 text-[15px]">
            <span className="mt-0.5 font-mono text-[11px] tracking-[0.18em] text-rust uppercase tabular">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-relaxed text-ink/85">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
