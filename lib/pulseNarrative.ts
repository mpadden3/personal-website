import { chatJSON } from "./openrouter";
import type { GameSummary, NextSeries } from "./mlb";

export type SavantSignal = {
  name: string;
  rollingXwoba30PA: number;
  rollingWoba30PA: number;
  trend: "hot" | "cold" | "steady";
};

export type Narrative = {
  recap: string;
  playerOfTheWeekBlurb: string;
  oneThingToWatch: string;
  statcastNote?: string;
};

export type PotwForPrompt = {
  name: string;
  position: string;
  totals: Record<string, number | string>;
};

const SYSTEM = `You write three short blurbs about the Seattle Mariners using ONLY the JSON data provided. Voice: a thoughtful Mariners fan — honest about the team's stretch, celebratory about individual standouts.

Strict rules:
- Do not invent player names, stats, scores, dates, opponents, or context.
- If a value isn't in the data, do not reference it.

Tone rules by field:

- \`recap\`: Match the tone to the actual five-game performance. Read the games yourself.
  • Good stretch (4-1 or 5-0, or any 3+ game winning streak): write with confidence and momentum.
  • Average stretch (3-2): even-keeled, look at the texture — quality of opponents, scoring margins.
  • Tough stretch (2-3 or worse, especially with back-to-back losses): be honest. You can use words like "rough," "stumbled," "couldn't sustain," "dropped a winnable series" — call the stretch what it was. Don't force optimism.
  • Quality-of-opponent overrides record: a 2-3 stretch that includes a win over a contender or division rival can still be framed positively around that win, even if the overall record was below .500. Conversely, a 3-2 stretch where the wins came against bottom-tier opponents shouldn't be oversold.
  • Always factual; never sugar-coat losses or invent moral victories.

- Series-level context: \`recentContextGames\` (if present) contains additional recent games beyond the five-game window, listed in reverse chronological order (most recent first), for context only. Use them like this:
  • When the same opponent appears in both \`games\` and \`recentContextGames\` on consecutive dates, they're part of one series. Compute the FULL series record (e.g., "won 2 of 3 against Atlanta") instead of just the within-window record (e.g., "split with Atlanta").
  • You MAY reference complete-series outcomes (win/loss of the series, series record like "2 of 3") in the recap when they add useful context.
  • Do NOT cite specific scores, individual game results, or stats from \`recentContextGames\` directly — those are not shown to the reader. Only series-level summaries are allowed.

- \`playerOfTheWeekBlurb\`: ALWAYS positive and celebratory. This player was picked because they performed well in the stretch — write about them like you'd write about a hometown standout. 1-2 sentences.

- \`oneThingToWatch\`: Forward-looking. Anticipatory tone; can lightly acknowledge if the team needs a bounce-back, but the focus is the next series, not regret about the last one. 1 sentence.

- \`statcastNote\`: ALWAYS positive at the player level. Rules:
  • If ANY hitter in \`savantSignals.topHitters\` has trend='hot', write \`statcastNote\` about that hot hitter. Name them. If multiple are hot, pick the one with the highest rollingXwoba30PA.
  • If no hitter is 'hot' but at least one is 'steady', write \`statcastNote\` about the steady hitter in supportive terms (e.g., "[Name] continues to deliver consistent at-bats over his last 30 plate appearances.").
  • If every hitter is 'cold', OMIT the \`statcastNote\` field entirely. Do NOT name a struggling hitter in any narrative field.

Statcast citation rules:
- When citing rolling xwOBA or wOBA values from \`savantSignals.topHitters\`, you MUST qualify the citation as "over his last 30 plate appearances" (or a paraphrased equivalent). Prefer the \`trend\` token ('hot', 'cold', 'steady') over the raw number in prose.
- The \`trend\` token reflects current performance vs. MLB league-average wOBA (~.315): 'hot' = at least 15 points above league avg, 'cold' = at least 15 points below, 'steady' = within ±15 points. 'Cold' means "currently below league average," not "trending down."
- Never compare numbers between players unless both are present in \`savantSignals.topHitters\`.
- If \`savantSignals\` is absent or empty, do not reference Statcast metrics at all.

Output strict JSON with keys: \`recap\` (2-3 sentences), \`playerOfTheWeekBlurb\` (1-2 sentences), \`oneThingToWatch\` (1 sentence), and optionally \`statcastNote\` (1 sentence per the rules above). No markdown. No preamble. JSON only.`;

function validate(parsed: unknown): Narrative | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.recap !== "string" || !o.recap.trim()) return null;
  if (typeof o.playerOfTheWeekBlurb !== "string" || !o.playerOfTheWeekBlurb.trim()) return null;
  if (typeof o.oneThingToWatch !== "string" || !o.oneThingToWatch.trim()) return null;
  const out: Narrative = {
    recap: o.recap.trim(),
    playerOfTheWeekBlurb: o.playerOfTheWeekBlurb.trim(),
    oneThingToWatch: o.oneThingToWatch.trim(),
  };
  if (typeof o.statcastNote === "string" && o.statcastNote.trim()) {
    out.statcastNote = o.statcastNote.trim();
  }
  return out;
}

export async function generateNarrative(input: {
  games: GameSummary[];
  recentContextGames?: GameSummary[];
  potw: PotwForPrompt | null;
  nextSeries: NextSeries | null;
  savantSignals?: { topHitters: SavantSignal[] };
}): Promise<Narrative | null> {
  return chatJSON<Narrative>({
    model: "anthropic/claude-sonnet-4.6",
    system: SYSTEM,
    user: JSON.stringify(input),
    validate,
    maxTokens: 500,
    temperature: 0.4,
  });
}
