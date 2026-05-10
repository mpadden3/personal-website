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
- `/tools/mariners-pulse` — Coming soon
- `/tools/wedding-countdown` — Coming soon
- `/tools/ai-use-case-scorer` — Coming soon

## Phases

This repo is **Phase 1** (site shell). Phases 2–4 add the live AI tools:

- Phase 2 — Mariners Pulse (MLB data + AI recap)
- Phase 3 — Wedding Countdown
- Phase 4 — AI Use Case Scorer

See `SPEC.md` (Website_spec.md elsewhere) for the full plan.
