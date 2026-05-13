import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mike Padden — Seattle-based AI delivery lead, Mariners fan, getting married June 19, 2027.",
};

const details = [
  { label: "Lives", value: "Seattle, Washington" },
  { label: "Watches", value: "Seattle Mariners (loyally)" },
  {
    label: "Marrying",
    value: "Ashley · June 19, 2027",
  },
  {
    label: "Curious about",
    value:
      "AI agents, research workflows, adoption, practical automation",
  },
];

const currently = [
  {
    label: "Building",
    value: "Mariners Pulse — five-game recap with player of the week",
  },
  {
    label: "Reading",
    value: "Anything on adoption — getting AI used, not just shipped",
  },
  {
    label: "Avoiding",
    value: "Anything that calls itself an AI platform",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="flex items-center gap-3 text-ink-soft">
            <span className="font-mono text-[11px] tracking-[0.2em] tabular">
              № 04
            </span>
            <span className="h-px w-8 bg-ink/30" aria-hidden />
            <span className="label-eyebrow">About</span>
          </div>
          <h1 className="h-display mt-7 max-w-4xl text-[clamp(2.6rem,6.5vw,5rem)] text-ink">
            A small workshop,{" "}
            <span className="display-italic text-forest">
              built one tool at a time
            </span>
            .
          </h1>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-16 lg:grid-cols-[1.6fr_1fr] lg:px-10 lg:py-24">
        {/* Left: prose */}
        <div className="grid gap-7">
          <p className="text-[18px] leading-relaxed text-ink/90">
            I&apos;m a Seattle-based AI delivery lead who likes building
            practical AI tools for the workflows around me — whether
            that&apos;s helping Ashley research companies, tracking the
            Mariners, planning a wedding, or helping teams turn messy business
            processes into usable AI products.
          </p>
          <p className="text-[18px] leading-relaxed text-ink/90">
            This site is where I&apos;m collecting the things I&apos;m
            building, testing, and learning.
          </p>

          <div className="mt-2 grid gap-2 border-l-2 border-rust/60 pl-5">
            <span className="font-mono text-[11px] tracking-[0.22em] text-rust uppercase tabular">
              Working principles
            </span>
            <p className="marginalia">
              Honest scope. No platforms. The smallest tool that could
              possibly work, then sharpened. Demos that hold up at a kitchen
              table.
            </p>
          </div>

          <h2 className="h-display mt-6 text-[clamp(1.8rem,3.4vw,2.4rem)] text-ink">
            Currently
          </h2>
          <dl className="grid gap-0 divide-y divide-ink/10">
            {currently.map((c) => (
              <div
                key={c.label}
                className="grid grid-cols-[120px_1fr] items-baseline gap-6 py-4"
              >
                <dt className="font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase tabular">
                  {c.label}
                </dt>
                <dd className="display-italic text-[18px] text-ink">
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: details card */}
        <aside>
          <div className="sticky top-24 grid gap-6 rounded-2xl border border-ink/15 bg-cream-deep/70 p-7">
            <header className="flex items-center justify-between border-b border-ink/10 pb-4">
              <span className="label-eyebrow">Details</span>
              <span className="font-mono text-[11px] text-ink-soft tabular">
                A few facts
              </span>
            </header>
            <dl className="grid gap-5">
              {details.map((d) => (
                <div key={d.label} className="grid gap-1">
                  <dt className="font-mono text-[10.5px] tracking-[0.2em] text-ink-soft uppercase tabular">
                    {d.label}
                  </dt>
                  <dd className="display-italic text-[19px] text-ink leading-snug">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="rule" />
            <div className="grid gap-2">
              <span className="label-eyebrow">Best way to reach me</span>
              <a
                href="mailto:mpadden33@gmail.com"
                className="font-mono text-[13.5px] text-forest hover:text-forest-deep"
              >
                <span className="ink-underline">mpadden33@gmail.com</span>
              </a>
            </div>
          </div>
        </aside>
      </section>

      {/* QUOTE / CLOSING */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="rounded-3xl bg-ink px-8 py-14 text-cream sm:px-12 sm:py-16">
          <span className="label-eyebrow text-cream/60">In short</span>
          <p className="mt-5 pull-quote text-[clamp(1.6rem,4vw,3rem)]">
            Small tools,{" "}
            <span className="display-italic text-rust">honest scope</span>,
            built for the workflows I actually live in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-cream/90"
            >
              See what&apos;s in the lab
              <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:mpadden33@gmail.com"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-cream ring-1 ring-cream/30 hover:ring-cream"
            >
              <span className="ink-underline">Say hello</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
