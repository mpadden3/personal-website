import type { AxisScore, Comparable } from "./useCaseScorer";
import { SAFETY_RULES } from "./moderation";

// ---- Intake parse ----------------------------------------------------------

export type IntakeParseResult = {
  ready: boolean;
  questions: string[];
};

export function buildIntakeParseSystem(): string {
  return [
    "You are the intake step for an AI use-case scorer.",
    "",
    SAFETY_RULES,
    "",
    "If the user's description falls under those safety rules, set ready=true and questions=[] so the next step can handle the refusal — do not respond conversationally here.",
    "",
    "Decide whether a one-paragraph use-case description has enough context to score honestly.",
    "If it does, set ready=true and questions=[]. If it doesn't, set ready=false and ask 1–3 short, specific follow-up questions.",
    "Only ask for critical missing context: who would use it, what they do today, and what success would look like.",
    "Do NOT ask for budget, deadlines, technical stack, or company-specific details.",
    "Each question is a single sentence, plain English, no numbering or bullets.",
    'Respond ONLY as JSON with this shape: { "ready": boolean, "questions": string[] }',
  ].join("\n");
}

export function buildIntakeParseUser(description: string): string {
  return `Use-case description:\n${description.trim()}`;
}

export function validateIntakeParse(parsed: unknown): IntakeParseResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.ready !== "boolean") return null;
  const qs = Array.isArray(o.questions) ? o.questions : [];
  const questions: string[] = [];
  for (const q of qs) {
    if (typeof q === "string" && q.trim().length > 0 && q.length < 240) {
      questions.push(q.trim());
    }
  }
  return { ready: o.ready, questions: questions.slice(0, 3) };
}

// ---- Scoring ---------------------------------------------------------------

export type ScoringResult = {
  scores: {
    helpfulness: AxisScore;
    novelty: AxisScore;
    value: AxisScore;
    feasibility: AxisScore;
  };
  verdictTagline: string;
  summary: string;
  comparables: Comparable[];
  nextSteps: string[];
  appOneLiner: string;
};

export function buildScoringSystem(): string {
  return [
    "You are an opinionated AI delivery lead scoring whether a proposed AI use case is worth building.",
    "",
    SAFETY_RULES,
    "",
    "If the user's use case falls under those safety rules, score every axis at 0 with rationale 'Out of scope — this tool doesn't score ideas that could enable harm.', set verdictTagline to 'Out of scope.', set summary to a one-sentence redirect to legitimate workflow ideas, set appOneLiner to 'A blank placeholder screen.', set nextSteps to ['Try a different, constructive use case.'], and set comparables to [].",
    "",
    "Otherwise, score four axes from 0 to 10. Higher is always better. Be calibrated — most ideas should land in 3–7.",
    "",
    "Axes:",
    "- helpfulness: Does this solve a real, painful problem people care about? (10 = clearly painful and widely felt)",
    "- novelty: Is this NOT already available cheaply off the shelf? (10 = no good existing solution; 0 = a free SaaS already does it)",
    "- value: Realistic ROI — time saved, money, decision quality, throughput? (10 = transformational)",
    "- feasibility: How buildable is a useful v1 with available tools, data, and skills? (10 = a weekend hackathon could do it)",
    "",
    "Use the provided comparable tools (from real web search) to ground the novelty score and the comparables list.",
    "If multiple comparables exist, novelty should be low. If the comparables are tangential, novelty can be higher.",
    "",
    "Other fields:",
    "- verdictTagline: 6–10 word punchy one-liner reflecting your overall take.",
    "- summary: 1–2 sentence plain-English overview of the verdict.",
    "- nextSteps: 3–5 short imperatives the user should do next, in order. Each ≤ 12 words.",
    "- appOneLiner: ONE sentence describing what the application would visually be — no people, no brand names, no sensitive topics. This feeds a wireframe sketch generator.",
    "- comparables: 0–5 of the provided web results that are actually relevant. Each gets a 1-sentence note explaining why it's relevant.",
    "",
    "Respond ONLY as a JSON object. Each axis is `{ value: 0–10 integer, rationale: 1–2 sentences }`.",
    'Shape: { "scores": { "helpfulness": {...}, "novelty": {...}, "value": {...}, "feasibility": {...} },',
    '  "verdictTagline": string, "summary": string, "comparables": [{ "title": string, "url": string, "note": string }],',
    '  "nextSteps": string[], "appOneLiner": string }',
  ].join("\n");
}

export function buildScoringUser(
  description: string,
  clarifications: { question: string; answer: string }[],
  webResults: { title: string; url: string; snippet: string }[],
): string {
  const sections: string[] = [];
  sections.push(`USE CASE DESCRIPTION:\n${description.trim()}`);
  if (clarifications.length > 0) {
    const c = clarifications
      .map((q, i) => `Q${i + 1}. ${q.question}\nA${i + 1}. ${q.answer}`)
      .join("\n\n");
    sections.push(`CLARIFICATIONS:\n${c}`);
  }
  if (webResults.length > 0) {
    const w = webResults
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet.slice(0, 280)}`,
      )
      .join("\n");
    sections.push(`WEB SEARCH RESULTS (potential existing solutions):\n${w}`);
  } else {
    sections.push(
      "WEB SEARCH RESULTS: (none returned — use your own knowledge of what already exists)",
    );
  }
  return sections.join("\n\n");
}

function isValidAxis(o: unknown): o is AxisScore {
  if (!o || typeof o !== "object") return false;
  const a = o as Record<string, unknown>;
  if (typeof a.value !== "number") return false;
  if (typeof a.rationale !== "string") return false;
  return a.value >= 0 && a.value <= 10;
}

export function validateScoring(parsed: unknown): ScoringResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const s = o.scores;
  if (!s || typeof s !== "object") return null;
  const so = s as Record<string, unknown>;
  if (!isValidAxis(so.helpfulness) || !isValidAxis(so.novelty)) return null;
  if (!isValidAxis(so.value) || !isValidAxis(so.feasibility)) return null;

  if (typeof o.verdictTagline !== "string" || o.verdictTagline.length === 0) return null;
  if (typeof o.summary !== "string" || o.summary.length === 0) return null;
  if (typeof o.appOneLiner !== "string" || o.appOneLiner.length === 0) return null;

  const nextSteps: string[] = [];
  if (Array.isArray(o.nextSteps)) {
    for (const step of o.nextSteps) {
      if (typeof step === "string" && step.trim().length > 0 && step.length < 200) {
        nextSteps.push(step.trim());
      }
    }
  }
  if (nextSteps.length === 0) return null;

  const comparables: Comparable[] = [];
  if (Array.isArray(o.comparables)) {
    for (const c of o.comparables) {
      if (!c || typeof c !== "object") continue;
      const co = c as Record<string, unknown>;
      if (typeof co.title !== "string" || typeof co.url !== "string") continue;
      if (typeof co.note !== "string") continue;
      try {
        new URL(co.url);
      } catch {
        continue;
      }
      comparables.push({
        title: co.title.slice(0, 200),
        url: co.url,
        note: co.note.slice(0, 280),
      });
    }
  }

  const helpfulness = so.helpfulness as AxisScore;
  const novelty = so.novelty as AxisScore;
  const value = so.value as AxisScore;
  const feasibility = so.feasibility as AxisScore;

  return {
    scores: {
      helpfulness: { value: Math.round(helpfulness.value), rationale: helpfulness.rationale },
      novelty: { value: Math.round(novelty.value), rationale: novelty.rationale },
      value: { value: Math.round(value.value), rationale: value.rationale },
      feasibility: {
        value: Math.round(feasibility.value),
        rationale: feasibility.rationale,
      },
    },
    verdictTagline: o.verdictTagline.slice(0, 140),
    summary: o.summary.slice(0, 480),
    comparables: comparables.slice(0, 5),
    nextSteps: nextSteps.slice(0, 5),
    appOneLiner: o.appOneLiner.slice(0, 280),
  };
}
