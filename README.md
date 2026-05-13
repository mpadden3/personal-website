# personal-website

Mike Padden's personal AI lab site — a small collection of practical AI tools (Ashley's AI Assistant, Mariners Pulse, Wedding Countdown, AI Use Case Scorer) plus a resume and about page.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui primitives (Button, Card, Badge)
- Fonts: Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (accents)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` — Home (hero, featured tools, professional bridge)
- `/lab` — AI Lab index of all tools
- `/resume` — Resume / dossier
- `/about` — About
- `/tools/mariners-pulse` — Live: last-5-games tracker, AI recap, rolling xwOBA
- `/tools/wedding-countdown` — Live: countdown, checklist (Vercel Blob), planner chat
- `/tools/ai-use-case-scorer` — Live: 4-axis scoring, EXA search, generated wireframes

Ashley's AI Assistant lives as its own deployed app — linked from `/` and `/lab`.

## Env

See `.env.local.example` for the full list. Required for the AI tools:
`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `EXA_API_KEY`, `BLOB_READ_WRITE_TOKEN`,
`CRON_SECRET`, `SAVANT_BLOB_URL`, `NEXT_PUBLIC_SITE_URL`.
