import Link from "next/link";
import { tools } from "@/data/tools";
import { ToolCard } from "@/components/ToolCard";
import { SectionHeader } from "@/components/SectionHeader";

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 pt-14 pb-20 lg:grid-cols-[1.6fr_1fr] lg:gap-12 lg:px-10 lg:pt-24 lg:pb-28">
          {/* Left column — headline */}
          <div className="relative">
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="label-eyebrow">Issue №01</span>
              <span className="h-px w-8 bg-ink/30" aria-hidden />
              <span className="label-eyebrow">Seattle, WA</span>
            </div>

            <h1 className="h-display mt-8 text-[clamp(2.6rem,7vw,5.5rem)] text-ink">
              Practical{" "}
              <span className="display-italic text-cobalt">AI tools,</span>
              <br />
              built for real life.
            </h1>

            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/85">
              I&apos;m Mike — an AI operator and builder in Seattle, creating
              small tools that make everyday workflows easier, from research
              and company briefs to Mariners recaps, wedding planning, and AI
              use case discovery.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/lab"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-cobalt-deep"
              >
                Explore the AI Lab
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-medium text-ink ring-1 ring-ink/30 transition-colors hover:ring-ink"
              >
                <span className="ink-underline">View Resume</span>
              </Link>
            </div>

            {/* Decorative annotation underneath */}
            <div className="mt-12 flex max-w-md items-start gap-3 border-l-2 border-rust/60 pl-4">
              <span className="font-mono text-[11px] tracking-[0.2em] text-rust uppercase tabular">
                Note ↩
              </span>
              <p className="marginalia">
                These are honest, narrow tools — built because I needed them.
                No platforms, no vague chatbots, no roadmap theater.
              </p>
            </div>
          </div>

          {/* Right column — index card */}
          <aside className="relative lg:pl-6">
            <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-ink/15 bg-cream p-6 lg:p-7">
              <header className="flex items-center justify-between border-b border-ink/10 pb-4">
                <span className="label-eyebrow">Index</span>
                <span className="font-mono text-[11px] text-ink-soft tabular">
                  04 entries
                </span>
              </header>
              <ol className="grid gap-4">
                {tools.map((t) => (
                  <li key={t.slug} className="grid gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="display-italic text-[17px] text-ink">
                        {t.name}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase tabular">
                        № {t.index}
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-snug text-ink-soft">
                      {t.kicker}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="border-t border-ink/10 pt-4">
                <Link
                  href="/lab"
                  className="group inline-flex items-center justify-between gap-2 text-[12.5px] font-medium text-cobalt"
                >
                  <span className="ink-underline">Read the full lab</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Decorative ruler tick */}
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="rule" />
        </div>
      </section>

      {/* FEATURED EXPERIMENTS */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeader
          index="01"
          eyebrow="Featured experiments"
          title={
            <>
              Four small tools, in various{" "}
              <span className="display-italic text-cobalt">states of done</span>.
            </>
          }
          description="A live deep research assistant, a Mariners tracker still being shaped, and two more in the workshop."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {tools.map((t) => (
            <ToolCard key={t.slug} tool={t} variant="feature" />
          ))}
        </div>
      </section>

      {/* PROFESSIONAL BRIDGE */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-10 rounded-3xl bg-ink p-8 text-cream sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
          <div className="grid gap-5">
            <span className="label-eyebrow text-cream/60">
              Professionally
            </span>
            <p className="pull-quote text-[clamp(1.6rem,3.5vw,2.6rem)]">
              I work at the intersection of{" "}
              <span className="display-italic text-rust">AI delivery</span>,
              business workflows, and adoption — helping teams move from AI
              ideas to usable products and{" "}
              <span className="display-italic">measurable outcomes</span>.
            </p>
          </div>
          <div className="grid content-end gap-4">
            <div className="grid grid-cols-2 gap-3 text-[12px] tracking-wide text-cream/70">
              {[
                "AI delivery",
                "Adoption",
                "Agentic workflows",
                "Stakeholder alignment",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-cream/15 px-3 py-2 font-mono uppercase"
                >
                  <span
                    className="size-1.5 rounded-full bg-rust"
                    aria-hidden
                  />
                  {label}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-cream/90"
              >
                Read the resume
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-cream ring-1 ring-cream/30 hover:ring-cream"
              >
                <span className="ink-underline">About me</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
