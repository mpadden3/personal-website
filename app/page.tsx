import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  Workflow,
  MapPin,
  Trophy,
  TerminalSquare,
  ArrowRight,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { tools } from "@/data/tools";
import { facets, type FacetId } from "@/data/facets";
import { StatusBadge } from "@/components/StatusBadge";

const facetIcons: Record<FacetId, ComponentType<SVGProps<SVGSVGElement>>> = {
  operator: Brain,
  tpm: Workflow,
  seattle: MapPin,
  sports: Trophy,
};

const featuredTools = tools.slice(0, 3);

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* PNW watercolor backdrop, anchored to the bottom of the hero.
            Mask gradient at the top edge fades the image into the cream paper. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[440px] overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 22%, black 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 22%, black 100%)",
          }}
        >
          <Image
            src="/hero-backdrop2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-8 px-6 pt-6 pb-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12 lg:px-10 lg:pt-8 lg:pb-10">
          {/* Left column — headline */}
          <div className="relative">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-ink-soft">
              Seattle <span className="text-forest mx-1">·</span> WA
            </span>

            <h1
              className="mt-4 text-[clamp(2rem,3.4vw,3rem)] leading-[1.06] text-ink"
              style={{
                fontFamily: "var(--font-display), ui-serif, serif",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 60',
              }}
            >
              Technical Program Manager,
              <br />
              <span
                className="text-forest"
                style={{
                  fontStyle: "italic",
                  fontVariationSettings: '"SOFT" 80, "WONK" 1, "opsz" 60',
                }}
              >
                AI Operator.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/85">
              I&apos;m Mike — a Seattle-based Technical Program Manager and AI
              operator who builds simple, useful tools that save time, spark
              ideas, and solve everyday problems at work and in life.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/lab"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
              >
                Explore the AI Lab
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[14px] font-medium text-ink ring-1 ring-forest/40 transition-colors hover:ring-forest"
              >
                View Resume
              </Link>
            </div>
          </div>

          {/* Right column — Featured Projects card (top 3) */}
          <aside>
            <div className="rounded-2xl border border-forest/35 bg-cream/95 p-5 shadow-[0_24px_60px_-32px_oklch(0.36_0.06_185/0.35)] lg:p-5">
              {/* Card header */}
              <header className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-forest/[0.1] text-forest">
                    <TerminalSquare className="size-4.5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h2 className="h-display text-[19px] leading-tight text-ink">
                      Featured Projects
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-ink-soft">
                      What I&apos;m building
                    </p>
                  </div>
                </div>
                <Link
                  href="/lab"
                  className="hidden items-center gap-1.5 text-[12.5px] font-medium text-forest hover:text-forest-deep sm:inline-flex"
                >
                  View all
                  <ArrowRight className="size-3.5" />
                </Link>
              </header>

              {/* Project rows — top 3 only */}
              <ol className="mt-4 grid divide-y divide-forest/15">
                {featuredTools.map((t) => (
                  <li
                    key={t.slug}
                    className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 first:pt-1.5"
                  >
                    <span className="font-medium text-[12.5px] tabular text-forest tracking-wide">
                      {t.index}
                    </span>
                    <div className="min-w-0">
                      <p className="h-display text-[16.5px] leading-snug text-ink">
                        {t.name}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
                        {t.tagline}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ol>

              {/* Mobile-only "view all" footer link */}
              <div className="mt-2 border-t border-forest/15 pt-3 sm:hidden">
                <Link
                  href="/lab"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-forest"
                >
                  View all projects
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* FACETS — four cards: AI Operator / TPM / Seattle / Sports */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-10 lg:pb-20">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {facets.map((f) => {
              const Icon = facetIcons[f.id];
              return (
                <li
                  key={f.id}
                  className="group relative overflow-hidden rounded-2xl border border-forest/30 bg-cream/95 p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_oklch(0.36_0.06_185/0.40)]"
                >
                  <header className="relative flex items-center gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest/[0.1] text-forest">
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="h-display text-[20px] leading-tight text-ink">
                      {f.label}
                    </h3>
                  </header>
                  <p className="relative mt-4 text-[14px] leading-relaxed text-ink/80">
                    {f.body}
                  </p>
                  <span
                    aria-hidden
                    className="relative mt-5 block h-[1.5px] w-10 rounded-full bg-forest/60"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
