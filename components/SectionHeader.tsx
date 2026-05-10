import { cn } from "@/lib/utils";

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid gap-5",
        align === "center" && "place-items-center text-center",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-ink-soft">
        {index ? (
          <span className="font-mono text-[11px] tracking-[0.2em] tabular">
            № {index}
          </span>
        ) : null}
        <span className="h-px w-8 bg-ink/30" aria-hidden />
        <span className="label-eyebrow">{eyebrow}</span>
      </div>

      <h2 className="h-display text-[clamp(2rem,4.6vw,3.5rem)] text-ink">
        {title}
      </h2>

      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </header>
  );
}
