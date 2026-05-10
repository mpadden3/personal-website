import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "AI delivery, business workflows, stakeholder alignment, and turning AI ideas into measurable outcomes.",
};

const highlights = [
  {
    index: "I",
    title: "AI delivery & adoption",
    body: "Shipping production AI features and getting teams to actually use them — pilots, rollouts, change management, and the unglamorous middle.",
  },
  {
    index: "II",
    title: "Agentic workflow automation",
    body: "Designing multi-step agent workflows that touch real business systems — research, drafting, classification, hand-offs to humans.",
  },
  {
    index: "III",
    title: "Cross-functional program leadership",
    body: "Aligning engineering, design, ops, and stakeholders around scoped AI initiatives with measurable outcomes, not vibes.",
  },
  {
    index: "IV",
    title: "Business reqs → AI-enabled solutions",
    body: "Translating messy business problems into focused AI products — defining the wedge, the data, and what good looks like.",
  },
];

export default function ResumePage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr] lg:px-10 lg:py-24">
          <div>
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="font-mono text-[11px] tracking-[0.2em] tabular">
                № 03
              </span>
              <span className="h-px w-8 bg-ink/30" aria-hidden />
              <span className="label-eyebrow">Dossier</span>
            </div>
            <h1 className="h-display mt-7 text-[clamp(2.5rem,6vw,4.5rem)] text-ink">
              Mike Padden,{" "}
              <span className="display-italic text-cobalt">on the record.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/85">
              My professional background is focused on AI delivery, business
              workflows, stakeholder alignment, and helping teams move from AI
              ideas to usable products and measurable outcomes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13.5px] font-medium text-cream transition-colors hover:bg-cobalt-deep"
              >
                <span aria-hidden>↓</span>
                Download Resume PDF
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-[13.5px] font-medium text-ink ring-1 ring-ink/30 transition-colors hover:ring-ink"
              >
                <span className="ink-underline">LinkedIn</span>
                <span aria-hidden>↗</span>
              </a>
              <a
                href="mailto:mpadden33@gmail.com"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-[13.5px] font-medium text-ink ring-1 ring-ink/30 transition-colors hover:ring-ink"
              >
                <span className="ink-underline">Email</span>
              </a>
            </div>
          </div>

          {/* PDF preview placeholder */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm rotate-[-1.5deg] rounded-md border border-ink/20 bg-cream-deep/80 p-6 shadow-[0_18px_48px_-24px_oklch(0.205_0.045_250/0.45)]">
              <div className="absolute -top-2 left-6 h-1 w-12 rounded-sm bg-rust/80" aria-hidden />
              <div className="flex items-center justify-between border-b border-ink/15 pb-3">
                <span className="label-eyebrow">PDF · 1 page</span>
                <span className="font-mono text-[11px] text-ink-soft tabular">
                  resume.pdf
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="display-italic text-2xl text-ink leading-tight">
                  Mike Padden
                </div>
                <div className="font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
                  AI Delivery · Seattle
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="h-2 w-11/12 rounded-sm bg-ink/15" />
                  <div className="h-2 w-10/12 rounded-sm bg-ink/15" />
                  <div className="h-2 w-9/12 rounded-sm bg-ink/15" />
                  <div className="h-2 w-7/12 rounded-sm bg-ink/15" />
                </div>
                <div className="mt-5 space-y-1.5">
                  <div className="h-1.5 w-full rounded-sm bg-ink/10" />
                  <div className="h-1.5 w-11/12 rounded-sm bg-ink/10" />
                  <div className="h-1.5 w-10/12 rounded-sm bg-ink/10" />
                </div>
              </div>
              <p className="mt-6 border-t border-ink/10 pt-3 text-[10.5px] text-ink-soft font-mono tracking-wide">
                Placeholder. Real PDF will be dropped in shortly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <header className="grid gap-4">
          <div className="flex items-center gap-3 text-ink-soft">
            <span className="label-eyebrow">Highlights</span>
            <span className="h-px w-8 bg-ink/30" aria-hidden />
            <span className="font-mono text-[11px] text-ink-soft tabular">
              Four areas of focus
            </span>
          </div>
          <h2 className="h-display text-[clamp(1.8rem,3.6vw,2.6rem)]">
            Where I&apos;ve been{" "}
            <span className="display-italic text-cobalt">most useful</span>.
          </h2>
        </header>

        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {highlights.map((h) => (
            <li
              key={h.title}
              className="grid gap-3 rounded-xl bg-cream-deep/60 p-6 ring-1 ring-ink/10 transition-shadow hover:ring-ink/25"
            >
              <header className="flex items-baseline justify-between gap-3">
                <span className="display-italic text-base text-rust">
                  {h.index}.
                </span>
                <span className="label-eyebrow">Area of focus</span>
              </header>
              <h3 className="h-display text-2xl text-ink">{h.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-ink/85">
                {h.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* CONTACT FOOTER STRIP */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-4 rounded-2xl bg-ink p-8 text-cream sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <span className="label-eyebrow text-cream/60">Get in touch</span>
            <p className="mt-3 pull-quote text-[clamp(1.4rem,3vw,2rem)]">
              The fastest path is{" "}
              <a
                href="mailto:mpadden33@gmail.com"
                className="display-italic text-rust ink-underline"
              >
                a short email
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-cream/90"
            >
              About me
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-cream ring-1 ring-cream/30 hover:ring-cream"
            >
              <span className="ink-underline">See the lab</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
