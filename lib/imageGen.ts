import { put } from "@vercel/blob";
import { checkContent } from "./moderation";

const ENDPOINT = "https://api.openai.com/v1/images/generations";

export function buildWireframePrompt(appOneLiner: string): string {
  return [
    "Create a high-fidelity, polished product UI mockup of a hypothetical SaaS application.",
    "Treat this like the hero screenshot for a Product Hunt launch — confident, modern, presentation-grade.",
    `The application does the following: ${appOneLiner}.`,
    "",
    "Design direction:",
    "- Make creative, concrete assumptions about layout, features, and product surface — invent a real-feeling v1 rather than a generic sketch.",
    "- Modern SaaS aesthetic: thoughtful typography, generous whitespace, refined color, gentle depth (subtle shadows, soft gradients, glassy panels where it makes sense).",
    "- Include plausible sample content: realistic-looking numbers, chart titles, headings, and short labels — never lorem ipsum and never placeholder text like 'Title' or 'Button'.",
    "- If data visualizations make sense, render them as clean modern charts (line, bar, area, sparkline, kanban, table, etc.) with believable values.",
    "- Pick a tasteful color palette that fits the application's domain. Use color with intent — not flat gray boxes.",
    "- Show the primary working screen of the app, not a marketing landing page.",
    "- Aim for the visual quality of Linear, Vercel, Notion, Stripe, Granola, or Arc — the screenshot should make someone curious to try the product.",
    "",
    "Mandatory constraints (do not violate):",
    "- No real human figures, no faces, no hands, no body parts. Avatar circles with abstract letter initials are fine.",
    "- No real brand names, no real logos, no real trademarks. Invent a plausible fictional product name if a logo is needed.",
    "- No text that names specific real people, real places, or sensitive topics.",
    "- No imagery related to weapons, violence, drugs, or anything explicit.",
    "- No NSFW content of any kind.",
    "",
    "Landscape composition. Render as a clean app window or full-bleed product screenshot.",
  ].join("\n");
}

export type WireframeResult = { url: string; prompt: string };

// Generates a wireframe sketch via OpenAI's image API and uploads to Vercel Blob.
// Returns null on any failure — moderation block, provider refusal, network error.
// Callers must treat the wireframe as optional.
export async function generateWireframe(
  appOneLiner: string,
  recordId: string,
): Promise<WireframeResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[imageGen] OPENAI_API_KEY not set — skipping wireframe");
    }
    return null;
  }

  // Safety layer: even though appOneLiner is model-generated from a
  // pre-moderated input, run it through the moderation API one more time
  // before handing it to the image model. Belt and suspenders.
  const safe = await checkContent(appOneLiner);
  if (safe === false) {
    console.warn("[imageGen] appOneLiner flagged by moderation — skipping image");
    return null;
  }

  const prompt = buildWireframePrompt(appOneLiner);

  // High-fidelity mockups take longer than sketches — give the call a
  // generous timeout. gpt-image-1 at high quality is typically 20–45s.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  let base64: string | null = null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1536x1024", // landscape — closer to a real product screenshot
        quality: "high",
        // The provider rejects this generation if it trips the safety filter.
        // We don't override moderation here — strict default is correct.
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[imageGen] non-2xx: ${res.status} ${errText.slice(0, 240)}`);
      return null;
    }
    const json = (await res.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    base64 = json.data?.[0]?.b64_json ?? null;
  } catch (err) {
    console.warn("[imageGen] fetch failed:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }

  if (!base64) return null;

  try {
    const buffer = Buffer.from(base64, "base64");
    const blob = await put(`use-case-scores/wireframes/${recordId}.png`, buffer, {
      access: "public",
      allowOverwrite: false,
      addRandomSuffix: false,
      contentType: "image/png",
    });
    return { url: blob.url, prompt };
  } catch (err) {
    console.warn("[imageGen] blob upload failed:", (err as Error).message);
    return null;
  }
}
