import { chatJSON } from "@/lib/openrouter";
import { exaSearch } from "@/lib/exa";
import { checkContent } from "@/lib/moderation";
import { generateWireframe } from "@/lib/imageGen";
import {
  computeComposite,
  computeVerdict,
  generateScoreId,
  saveScore,
  type ScoreRecord,
} from "@/lib/useCaseScorer";
import {
  buildScoringSystem,
  buildScoringUser,
  validateScoring,
} from "@/lib/useCaseScorerPrompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "anthropic/claude-sonnet-4.6";
const REFUSAL =
  "We can't score that input. Try rephrasing your idea around the workflow it improves.";

// In-memory rate limit. Per-process — resets on cold start. Best-effort.
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) return true;
  existing.count += 1;
  return false;
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

type Body = {
  description?: unknown;
  answers?: unknown;
};

type ParsedBody = {
  description: string;
  clarifications: { question: string; answer: string }[];
};

function validateBody(body: unknown): ParsedBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Body;
  if (typeof b.description !== "string") return null;
  const description = b.description.trim();
  if (description.length < 10 || description.length > 4000) return null;

  const clarifications: { question: string; answer: string }[] = [];
  if (Array.isArray(b.answers)) {
    for (const entry of b.answers) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      if (typeof e.question !== "string" || typeof e.answer !== "string") continue;
      const q = e.question.trim();
      const a = e.answer.trim();
      if (q.length === 0 || a.length === 0) continue;
      if (q.length > 280 || a.length > 1000) continue;
      clarifications.push({ question: q, answer: a });
      if (clarifications.length >= 3) break;
    }
  }
  return { description, clarifications };
}

function buildSearchQuery(description: string): string {
  // First sentence (or first 140 chars) + "tool OR product OR SaaS" hint.
  const firstSentence =
    description.match(/^[^.!?\n]{10,180}[.!?]?/)?.[0] ?? description.slice(0, 140);
  return `${firstSentence.trim()} tool OR product OR SaaS`;
}

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  if (rateLimited(ip)) {
    return Response.json(
      { ok: false, error: "Too many scores from this IP. Try again tomorrow." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const parsed = validateBody(body);
  if (!parsed) {
    return Response.json(
      { ok: false, error: "description must be 10–4000 chars" },
      { status: 400 },
    );
  }

  // Layer 1: moderation pre-check on the full combined input.
  const combinedForCheck = [
    parsed.description,
    ...parsed.clarifications.map((c) => `${c.question} ${c.answer}`),
  ].join("\n");
  const safe = await checkContent(combinedForCheck);
  if (safe === false) {
    return Response.json({ ok: false, error: REFUSAL }, { status: 400 });
  }

  // EXA + scoring (sequential — scoring needs EXA results to ground novelty).
  const exaQuery = buildSearchQuery(parsed.description);
  const exaResults = await exaSearch(exaQuery, 5);

  const scoring = await chatJSON({
    model: MODEL,
    system: buildScoringSystem(),
    user: buildScoringUser(
      parsed.description,
      parsed.clarifications,
      exaResults.map((r) => ({ title: r.title, url: r.url, snippet: r.snippet })),
    ),
    validate: validateScoring,
    maxTokens: 1600,
    temperature: 0.4,
    timeoutMs: 45000,
  });

  if (!scoring) {
    return Response.json(
      { ok: false, error: "Scoring is temporarily unavailable. Try again in a minute." },
      { status: 503 },
    );
  }

  const id = generateScoreId();

  // Wireframe gen runs after scoring so it can use the sanitized appOneLiner.
  // Failure here does NOT block scoring — the wireframe is optional.
  const wireframe = await generateWireframe(scoring.appOneLiner, id);

  const composite = computeComposite(scoring.scores);
  const { band } = computeVerdict(composite);

  const record: ScoreRecord = {
    id,
    createdAt: new Date().toISOString(),
    input: {
      description: parsed.description,
      clarifications: parsed.clarifications,
    },
    scores: scoring.scores,
    composite,
    band,
    verdictTagline: scoring.verdictTagline,
    summary: scoring.summary,
    comparables: scoring.comparables,
    nextSteps: scoring.nextSteps,
    appOneLiner: scoring.appOneLiner,
    wireframe: wireframe ?? undefined,
  };

  try {
    await saveScore(record);
  } catch (err) {
    console.warn("[score] persist failed:", (err as Error).message);
    return Response.json(
      { ok: false, error: "Couldn't save the score. Try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, id });
}
