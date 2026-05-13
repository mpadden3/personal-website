import { put } from "@vercel/blob";
import { checkContent } from "./moderation";

const ENDPOINT = "https://api.openai.com/v1/images/generations";

// Visual-style directions picked at random per generation so two scored
// ideas don't look like they came off the same assembly line. Each one
// nudges color, typography, and overall aesthetic to a distinct place.
type VisualStyle = { name: string; description: string };

export const VISUAL_STYLES: VisualStyle[] = [
  {
    name: "editorial",
    description:
      "Editorial publication aesthetic — confident serif display headlines, generous whitespace, magazine-style grid with crisp horizontal rules. Warm paper tones (cream, ink, deep forest, terracotta accents). Mix of high-quality serif and humanist sans-serif. Reminiscent of a refined Substack or The Browser.",
  },
  {
    name: "dense-terminal",
    description:
      "Dense data-terminal aesthetic. Compact rows, monospace numerals, color-coded values (green up, red down). Either a dark slate background with phosphor-green accents OR an off-white background with deep ink and cyan accents. Bloomberg-meets-Linear. Information-dense, technical, no marketing softness.",
  },
  {
    name: "soft-glass",
    description:
      "Soft glassmorphic aesthetic — translucent panels with subtle backdrop blur, layered depth, gentle gradients. Cool palette: lavender, mint, peach, sky. Rounded corners. Humanist geometric sans-serif. Apple-Vision-Pro-meets-Notion.",
  },
  {
    name: "brutalist-mono",
    description:
      "Brutalist monochrome aesthetic. Black, off-white, and exactly ONE bold accent (electric blue OR hot pink OR sulfur yellow OR cadmium orange). 0-radius corners, oversized display typography (use a heavy grotesque or anti-design serif), no shadows. Reminiscent of Vercel's docs, Linear's marketing, or a Berlin design studio.",
  },
  {
    name: "playful-pastel",
    description:
      "Playful pastel aesthetic. Generous rounded corners, soft pastel palette (lavender, butter, sky, blush, sage), friendly humanist sans-serif, illustrated icon hints. Approachable like Things 3, Cron, or a thoughtful consumer app. Cheerful but never childish.",
  },
  {
    name: "neon-dark",
    description:
      "Neon dark-mode aesthetic. Deep charcoal background (#0a0a0c-ish), vibrant electric cyan and magenta accents, subtle glow on focused elements, modern geometric sans-serif. Crisp and futuristic. Reminiscent of Vercel dashboards or Cursor.",
  },
  {
    name: "warm-print",
    description:
      "Warm print-inspired aesthetic. Cream/paper background, terracotta and deep-forest accents, mix of editorial serif (headings) and clean sans (body), hand-drawn icon hints, ink-on-paper feel. Reminiscent of a quality New Yorker app or a thoughtful indie publication.",
  },
  {
    name: "muted-archive",
    description:
      "Muted archive aesthetic. Off-white parchment background, sepia and deep navy accents, generous use of small caps and ligatures, monospace metadata. Reads like a well-designed research tool — Are.na, JSTOR-modern, or an early Stripe Press product. Calm, scholarly, confident.",
  },
];

function pickStyle(styleIndex?: number): VisualStyle {
  if (typeof styleIndex === "number" && styleIndex >= 0 && styleIndex < VISUAL_STYLES.length) {
    return VISUAL_STYLES[styleIndex];
  }
  return VISUAL_STYLES[Math.floor(Math.random() * VISUAL_STYLES.length)];
}

export function buildWireframePrompt(
  appOneLiner: string,
  styleIndex?: number,
): { prompt: string; styleName: string } {
  const style = pickStyle(styleIndex);
  const prompt = [
    "Create a high-fidelity, polished product UI mockup of a hypothetical application.",
    "Treat this like the hero screenshot for a launch — confident, opinionated, presentation-grade.",
    `The application does the following: ${appOneLiner}.`,
    "",
    `Visual style — commit to this aesthetic, don't water it down: ${style.description}`,
    "",
    "Layout direction:",
    "- Pick the layout that best fits the domain. Could be a sidebar dashboard, a content reader, a chat interface, a table view, a Kanban board, a feed, a single-task focus, a split inspector, or something else — whatever serves the use case.",
    "- Show the primary working screen of the app, not a marketing landing page.",
    "- Invent a plausible fictional product name and a small wordmark or monogram in the corner.",
    "",
    "Design rules:",
    "- Make creative, concrete assumptions about features and product surface — invent a real-feeling v1.",
    "- Include plausible sample content: realistic numbers, chart titles, headings, short labels. Never lorem ipsum. Never the literal words 'Title' or 'Button'.",
    "- Render any data viz as clean charts (line, bar, area, sparkline, table, kanban, etc.) with believable values, in a style consistent with the chosen aesthetic.",
    "- Use color, typography, spacing, and depth deliberately — match the visual style above.",
    "",
    "Mandatory constraints (do not violate):",
    "- No real human figures, no faces, no hands, no body parts. Avatar circles with abstract letter initials are fine.",
    "- No real brand names, no real logos, no real trademarks. The fictional product name should not match any existing company.",
    "- No text that names specific real people, real places, or sensitive topics.",
    "- No imagery related to weapons, violence, drugs, or anything explicit.",
    "- No NSFW content of any kind.",
    "",
    "Landscape composition. Render as a clean app window or full-bleed product screenshot.",
  ].join("\n");
  return { prompt, styleName: style.name };
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

  const { prompt, styleName } = buildWireframePrompt(appOneLiner);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[imageGen] using style: ${styleName}`);
  }

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
