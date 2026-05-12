import { chatJSON } from "@/lib/openrouter";
import { checkContent } from "@/lib/moderation";
import {
  buildIntakeParseSystem,
  buildIntakeParseUser,
  validateIntakeParse,
} from "@/lib/useCaseScorerPrompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "anthropic/claude-sonnet-4.6";
const REFUSAL =
  "We can't score that input. Try rephrasing your idea around the workflow it improves.";

type Body = { description?: unknown };

function validateBody(body: unknown): { description: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Body;
  if (typeof b.description !== "string") return null;
  const trimmed = b.description.trim();
  if (trimmed.length < 10 || trimmed.length > 4000) return null;
  return { description: trimmed };
}

export async function POST(request: Request): Promise<Response> {
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

  // Layer 1 of the safety pipeline: moderation pre-check on the user input.
  // checkContent returns null when the OpenAI key isn't configured — in that
  // case we proceed (scoring still works without the wireframe pipeline).
  const safe = await checkContent(parsed.description);
  if (safe === false) {
    return Response.json({ ok: false, error: REFUSAL }, { status: 400 });
  }

  const result = await chatJSON({
    model: MODEL,
    system: buildIntakeParseSystem(),
    user: buildIntakeParseUser(parsed.description),
    validate: validateIntakeParse,
    maxTokens: 400,
    temperature: 0.3,
  });

  if (!result) {
    return Response.json({ ok: false, error: "intake unavailable" }, { status: 503 });
  }

  return Response.json({ ok: true, ...result });
}
