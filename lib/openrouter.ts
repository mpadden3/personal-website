const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

function stripJsonFences(s: string): string {
  const trimmed = s.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

type ChatJSONOpts<T> = {
  model: string;
  system: string;
  user: string;
  validate: (parsed: unknown) => T | null;
  maxTokens?: number;
  temperature?: number;
};

export type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "tool"; content: string; tool_call_id: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };

export type ChatTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type AssistantReply = {
  content: string | null;
  toolCalls: Array<{ id: string; name: string; arguments: string }>;
};

type ChatRawOpts = {
  model: string;
  messages: ChatMessage[];
  tools?: ChatTool[];
  toolChoice?: "auto" | "none";
  maxTokens?: number;
  temperature?: number;
  title?: string;
};

export async function chatRaw(opts: ChatRawOpts): Promise<AssistantReply | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[openrouter] OPENROUTER_API_KEY not set — skipping AI call");
    }
    return null;
  }
  const referer = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const body: Record<string, unknown> = {
    model: opts.model,
    temperature: opts.temperature ?? 0.5,
    max_tokens: opts.maxTokens ?? 900,
    messages: opts.messages,
  };
  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = opts.toolChoice ?? "auto";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": opts.title ?? "Wedding Countdown",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[openrouter] non-2xx: ${res.status}`);
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            id: string;
            type: "function";
            function: { name: string; arguments: string };
          }>;
        };
      }>;
    };
    const msg = json.choices?.[0]?.message;
    if (!msg) return null;
    const toolCalls = (msg.tool_calls ?? []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
    return { content: msg.content ?? null, toolCalls };
  } catch (err) {
    console.warn("[openrouter] fetch failed:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function chatJSON<T>(opts: ChatJSONOpts<T>): Promise<T | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[openrouter] OPENROUTER_API_KEY not set — skipping AI call");
    }
    return null;
  }

  const referer = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const body = {
    model: opts.model,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 400,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system" as const, content: opts.system },
      { role: "user" as const, content: opts.user },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Mariners Pulse",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[openrouter] non-2xx: ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    const stripped = stripJsonFences(content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      console.warn("[openrouter] non-JSON response");
      return null;
    }
    return opts.validate(parsed);
  } catch (err) {
    console.warn("[openrouter] fetch failed:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
