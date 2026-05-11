import { cn } from "@/lib/utils";
import type { GameSummary } from "@/lib/mlb";

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

export function GameRow({ game }: { game: GameSummary }) {
  const isW = game.result === "W";
  return (
    <div
      className={cn(
        "relative grid gap-3 overflow-hidden rounded-xl bg-cream-deep/60 p-4 ring-1",
        isW ? "ring-sage/40" : "ring-rust/30",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          isW ? "bg-sage" : "bg-rust",
        )}
      />
      <div className="flex items-baseline justify-between gap-2 pl-1">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase tabular text-ink-soft">
          {formatShortDate(game.date)}
        </span>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full font-mono text-[14px] font-bold tabular ring-2",
            isW
              ? "bg-sage text-cream ring-sage/40"
              : "bg-rust text-cream ring-rust/40",
          )}
          aria-label={isW ? "Win" : "Loss"}
        >
          {game.result}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 pl-1 text-ink-soft">
        <span className="font-mono text-[11px] tabular">
          {game.homeAway === "home" ? "vs" : "@"}
        </span>
        <span className="font-mono text-[13px] font-semibold tracking-[0.04em] tabular text-ink">
          {game.opponentAbbrev}
        </span>
      </div>
      <div className="h-display pl-1 text-2xl text-ink tabular">
        {game.marinersScore}
        <span className="px-1 text-ink-soft">–</span>
        {game.opponentScore}
      </div>
    </div>
  );
}
