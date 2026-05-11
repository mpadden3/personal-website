import type { GameSummary } from "@/lib/mlb";
import { GameRow } from "./GameRow";

export function GameStrip({ games }: { games: GameSummary[] }) {
  if (games.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {games.map((g) => (
        <GameRow key={g.gamePk} game={g} />
      ))}
    </div>
  );
}
