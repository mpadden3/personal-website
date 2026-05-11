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
