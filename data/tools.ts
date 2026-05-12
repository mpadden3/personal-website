export type ToolStatus = "live" | "in-progress" | "planned";

export type Tool = {
  slug: string;
  index: string; // editorial number, e.g. "01"
  name: string;
  status: ToolStatus;
  /** Ultra-short one-line summary used on the home Featured Projects card */
  tagline: string;
  shortDescription: string;
  description: string;
  tags: string[];
  href: string;
  cta: "Launch" | "View" | "Coming Soon";
  external: boolean;
  /** Optional: tools can carry a small atmospheric subtitle for the lab listing */
  kicker?: string;
};

export const tools: Tool[] = [
  {
    slug: "ashleys-ai-assistant",
    index: "01",
    name: "Ashley's AI Assistant",
    status: "live",
    kicker: "Deep research, with manners.",
    tagline: "Personal assistant for everyday life",
    shortDescription:
      "A research assistant that asks before it answers, then returns structured briefs.",
    description:
      "A deep research assistant built for Ashley. It asks follow-up questions before researching, creates structured outputs, and includes a company brief feature.",
    tags: [
      "Deep research",
      "Company briefs",
      "Follow-up questions",
      "OpenRouter",
      "Exa",
      "Vercel",
    ],
    href: "https://ashleys-assistant.vercel.app",
    cta: "Launch",
    external: true,
  },
  {
    slug: "mariners-pulse",
    index: "02",
    name: "Mariners Pulse",
    status: "live",
    kicker: "Five games, one read on the season.",
    tagline: "Real-time game & roster insights",
    shortDescription:
      "Last five Mariners games, recapped — plus Mike's Player of the Week.",
    description:
      "A live Mariners tracker that pulls the last five completed games, summarizes recent performance, highlights trends, and picks Mike's Player of the Week.",
    tags: ["Mariners", "MLB data", "AI summaries", "Sports analytics"],
    href: "/tools/mariners-pulse",
    cta: "View",
    external: false,
  },
  {
    slug: "wedding-countdown",
    index: "03",
    name: "Wedding Countdown Assistant",
    status: "live",
    kicker: "T-minus the rest of our lives.",
    tagline: "Planning, checklists, and timelines",
    shortDescription:
      "Countdown, an interactive checklist, and a planning assistant for June 19, 2027.",
    description:
      "A wedding countdown and lightweight planning assistant for Mike and Ashley's June 19, 2027 wedding. Live countdown, interactive checklist with persistent state, and a chat assistant that pulls from the web for current planning questions.",
    tags: ["Wedding planning", "Countdown", "Checklist", "Chat assistant", "EXA search"],
    href: "/tools/wedding-countdown",
    cta: "View",
    external: false,
  },
  {
    slug: "ai-use-case-scorer",
    index: "04",
    name: "AI Use Case Scorer",
    status: "live",
    kicker: "Is this actually a job for AI?",
    tagline: "Score and prioritize AI opportunities",
    shortDescription:
      "Score an AI use case on helpfulness, novelty, value, and feasibility — with a generated wireframe.",
    description:
      "Describe a use case and the scorer asks a clarifying question or two, searches the web for tools that already exist, returns a four-axis score with a verdict, and sketches a quick wireframe of what the application could look like.",
    tags: ["AI evaluation", "EXA web search", "Image generation", "Decision support"],
    href: "/tools/ai-use-case-scorer",
    cta: "View",
    external: false,
  },
];

export const statusLabel: Record<ToolStatus, string> = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};
