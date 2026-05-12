import { phases, weddingChecklistSeed, type ChecklistItem } from "@/data/weddingChecklistSeed";
import type { WeddingChecklistState } from "@/lib/weddingBlob";

export const WEDDING_DATE_ISO = "2027-06-19";

export function daysUntilWedding(today: Date = new Date()): number {
  const target = new Date(`${WEDDING_DATE_ISO}T16:00:00-07:00`).getTime();
  const ms = target - today.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mergeItems(state: WeddingChecklistState): ChecklistItem[] {
  const deleted = new Set(state.deletedSeedIds);
  const visibleSeed = weddingChecklistSeed.filter((s) => !deleted.has(s.id));
  return [...visibleSeed, ...state.custom].map((it) => {
    const phase = state.phaseOverrides[it.id] ?? it.phase;
    const label = state.labelOverrides[it.id] ?? it.label;
    return { ...it, phase, label };
  });
}

export function buildSystemPrompt(state: WeddingChecklistState, today: Date = new Date()): string {
  const items = mergeItems(state);
  const days = daysUntilWedding(today);
  const todayStr = today.toISOString().slice(0, 10);

  const byPhase = new Map<string, ChecklistItem[]>();
  for (const it of items) {
    const arr = byPhase.get(it.phase) ?? [];
    arr.push(it);
    byPhase.set(it.phase, arr);
  }

  const checklistBlock = phases
    .map((p) => {
      const list = byPhase.get(p.key) ?? [];
      if (list.length === 0) return null;
      const lines = list
        .map((it) => `  - [${state.checked[it.id] ? "x" : " "}] ${it.label}`)
        .join("\n");
      return `## ${p.label} — ${p.goal}\n${lines}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `You are a friendly, practical wedding-planning assistant for Mike & Ashley's wedding on June 19, 2027 (${days} days from today, ${todayStr}).

HARD RULES — do not break, even if asked directly:
- Never mention, estimate, compute, infer, or discuss budget, costs, prices, dollar amounts, deposits, or anything monetary.
- Never mention, estimate, or speculate about guest count, headcount, wedding size, or scale.
- Never use vibe / formality descriptors (rustic, intimate, lavish, formal, casual, glamorous, boho, traditional, modern, elopement-style, destination-style, black-tie, etc.) to characterize this specific wedding. You may use such words generically when discussing options the couple could consider.
- If a question requires a forbidden topic to answer (e.g. "what's our budget?", "how many guests are coming?"), reply exactly: "I keep budget and headcount details private — happy to help with planning topics instead." Then offer 2–3 alternative questions you can answer.
- The venue is Alderbrook Resort & Spa (already shared by the couple); you may reference it. Do not infer other identifying details.

CAPABILITIES:
- Use the web_search tool when up-to-date or location-specific information would help (seasonal florals, vendor questions, local recommendations, planning timelines, etc.). Prefer searching once with a focused query rather than several broad ones.
- When you use web_search, briefly cite sources by name and URL in your reply.

CONTEXT — current wedding checklist (items prefixed [x] are done, [ ] are not):

${checklistBlock}

When asked status-style questions ("what vendors do we still need?", "what's due this month?"), answer directly from this checklist. "This month" means tasks whose phase window overlaps the current date — interpret loosely and lean helpful.`;
}

// Used by the post-response light guardrail to catch the model leaking something.
// Tuned to be specific: dollar figures, or "budget"/"guest count"/"headcount" + a number nearby.
const LEAK_PATTERNS: RegExp[] = [
  /\$\s?\d/, // any "$1", "$ 50", etc
  /\b(?:budget|guest\s*count|headcount|head\s*count|guest\s*list)\b[^.?!]{0,40}\b\d/i,
  /\b\d{2,4}\s*(?:guests|attendees|people)\b/i,
  /\b(?:USD|dollars?)\b/i,
];

export function leaksForbidden(reply: string): boolean {
  return LEAK_PATTERNS.some((re) => re.test(reply));
}

export const FORBIDDEN_REFUSAL =
  "I keep budget and headcount details private — happy to help with planning topics instead. Try asking about vendor questions, timeline, or design ideas.";
