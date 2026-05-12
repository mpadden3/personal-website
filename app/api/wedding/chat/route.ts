import { chatRaw, type ChatMessage, type ChatTool } from "@/lib/openrouter";
import { getWeddingState } from "@/lib/weddingBlob";
import {
  buildSystemPrompt,
  FORBIDDEN_REFUSAL,
  SAFETY_REFUSAL,
  leaksForbidden,
} from "@/lib/weddingChatPrompt";
import { exaSearch, type ExaResult } from "@/lib/exa";
import { checkContent } from "@/lib/moderation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "anthropic/claude-sonnet-4.6";

const WEB_SEARCH_TOOL: ChatTool = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web for current or location-specific information (vendor questions, seasonal florals, local recommendations, etc.). Use once with a focused query.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Focused search query, 3–10 words." },
      },
      required: ["query"],
    },
  },
};

type IncomingMessage = { role: "user" | "assistant"; content: string };

function parseIncoming(body: unknown): IncomingMessage[] | null {
  if (!body || typeof body !== "object") return null;
  const m = (body as { messages?: unknown }).messages;
  if (!Array.isArray(m)) return null;
  const out: IncomingMessage[] = [];
  for (const msg of m) {
    if (!msg || typeof msg !== "object") return null;
    const mm = msg as Record<string, unknown>;
    if ((mm.role === "user" || mm.role === "assistant") && typeof mm.content === "string") {
      if (mm.content.length > 4000) return null;
      out.push({ role: mm.role, content: mm.content });
    } else {
      return null;
    }
  }
  if (out.length === 0 || out.length > 30) return null;
  if (out[out.length - 1].role !== "user") return null;
  return out;
}

function userInputLooksForbidden(text: string): boolean {
  return /\b(budget|cost|price|spend|spending|guest\s*count|head\s*count|how\s+many\s+(?:people|guests))\b/i.test(
    text,
  );
}

function formatSearchResultsForModel(results: ExaResult[]): string {
  if (results.length === 0) return "No results found.";
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet ? `Snippet: ${r.snippet}` : ""}`.trim(),
    )
    .join("\n\n");
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const incoming = parseIncoming(body);
  if (!incoming) {
    return Response.json({ ok: false, error: "invalid messages" }, { status: 400 });
  }

  const latestUser = incoming[incoming.length - 1].content;

  // Content safety layer 1 — moderate the latest user message before
  // anything else. If flagged, refuse with the canned safety redirect.
  // checkContent returns null if OPENAI_API_KEY isn't configured; in that
  // case we proceed (graceful degradation).
  const inputSafe = await checkContent(latestUser);
  if (inputSafe === false) {
    return Response.json({ ok: true, reply: SAFETY_REFUSAL, sources: [] });
  }

  if (userInputLooksForbidden(latestUser)) {
    return Response.json({ ok: true, reply: FORBIDDEN_REFUSAL, sources: [] });
  }

  const state = await getWeddingState();
  const system = buildSystemPrompt(state, new Date());

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...incoming.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
  ];

  // Round 1: allow the model to call web_search.
  const first = await chatRaw({
    model: MODEL,
    messages,
    tools: [WEB_SEARCH_TOOL],
    toolChoice: "auto",
    title: "Wedding Countdown Assistant",
  });
  if (!first) {
    return Response.json(
      { ok: false, error: "assistant unavailable" },
      { status: 503 },
    );
  }

  const collectedSources: ExaResult[] = [];

  if (first.toolCalls.length > 0) {
    // Append the assistant's tool_calls message exactly.
    messages.push({
      role: "assistant",
      content: first.content ?? "",
      tool_calls: first.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    // Resolve each tool call. Cap at 2 to keep latency bounded.
    for (const tc of first.toolCalls.slice(0, 2)) {
      let query = "";
      try {
        const args = JSON.parse(tc.arguments) as { query?: unknown };
        if (typeof args.query === "string") query = args.query;
      } catch {
        // ignore
      }
      const results = query ? await exaSearch(query, 5) : [];
      collectedSources.push(...results);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: formatSearchResultsForModel(results),
      });
    }

    // Round 2: no more tool calls — force a final answer.
    const second = await chatRaw({
      model: MODEL,
      messages,
      toolChoice: "none",
      title: "Wedding Countdown Assistant",
    });
    if (!second || !second.content) {
      return Response.json(
        { ok: false, error: "assistant returned no content" },
        { status: 503 },
      );
    }
    const safeReply = await finalizeReply(second.content);
    const sources = safeReply === SAFETY_REFUSAL ? [] : dedupeSources(collectedSources);
    return Response.json({ ok: true, reply: safeReply, sources });
  }

  // No tool call — direct answer.
  if (!first.content) {
    return Response.json(
      { ok: false, error: "assistant returned no content" },
      { status: 503 },
    );
  }
  const safeReply = await finalizeReply(first.content);
  return Response.json({ ok: true, reply: safeReply, sources: [] });
}

// Final defense-in-depth on the model's output: topic guardrail first
// (budget/headcount leak), then content moderation. Either trip swaps the
// reply with a canned redirect so nothing unsafe ever reaches the client.
async function finalizeReply(raw: string): Promise<string> {
  if (leaksForbidden(raw)) return FORBIDDEN_REFUSAL;
  const safe = await checkContent(raw);
  if (safe === false) return SAFETY_REFUSAL;
  return raw;
}

function dedupeSources(sources: ExaResult[]): { title: string; url: string }[] {
  const seen = new Set<string>();
  const out: { title: string; url: string }[] = [];
  for (const s of sources) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    out.push({ title: s.title, url: s.url });
  }
  return out.slice(0, 6);
}
