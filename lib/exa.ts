const ENDPOINT = "https://api.exa.ai/search";

export type ExaResult = {
  title: string;
  url: string;
  snippet: string;
};

type RawExaItem = {
  title?: string | null;
  url?: string | null;
  text?: string | null;
  highlights?: string[] | null;
};

export async function exaSearch(query: string, numResults = 5): Promise<ExaResult[]> {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[exa] EXA_API_KEY not set — skipping web search");
    }
    return [];
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        numResults,
        type: "neural",
        useAutoprompt: true,
        contents: { text: { maxCharacters: 600 }, highlights: { numSentences: 2 } },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[exa] non-2xx: ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { results?: RawExaItem[] };
    const items = json.results ?? [];
    return items
      .map((r): ExaResult | null => {
        if (!r.url || !r.title) return null;
        const snippet =
          (r.highlights && r.highlights.join(" ")) ||
          (r.text ? r.text.slice(0, 240) : "");
        return { title: r.title, url: r.url, snippet };
      })
      .filter((x): x is ExaResult => x !== null);
  } catch (err) {
    console.warn("[exa] fetch failed:", (err as Error).message);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
