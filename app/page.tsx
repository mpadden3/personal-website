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

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Soft accent circle — keeps the warm corner glow above the image */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-32 size-[420px] rounded-full bg-peach/35 blur-[1px]"
        />

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
            src="/hero-backdrop.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-8 pb-12 lg:grid-cols-[1.55fr_1fr] lg:gap-12 lg:px-10 lg:pt-10 lg:pb-16">
          {/* Left column — headline */}
          <div className="relative">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-ink-soft">
              Seattle <span className="text-forest mx-1">·</span> WA
            </span>

            <h1
              className="mt-6 text-[clamp(2rem,3.4vw,3rem)] leading-[1.06] text-ink"
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

            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/85">
              I&apos;m Mike — a Seattle-based Technical Program Manager and AI
              operator who builds simple, useful tools that save time, spark
              ideas, and solve everyday problems at work and in life.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
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

          {/* Right column — Featured Projects card */}
          <aside>
            <div className="rounded-2xl border border-forest/35 bg-cream/95 p-5 shadow-[0_24px_60px_-32px_oklch(0.36_0.06_185/0.35)] lg:p-6">
              {/* Card header */}
              <header className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-forest/[0.1] text-forest">
                    <TerminalSquare className="size-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h2 className="h-display text-[22px] leading-tight text-ink">
                      Featured Projects
                    </h2>
                    <p className="mt-1 text-[13px] text-ink-soft">
                      What I&apos;m building
                    </p>
                  </div>
                </div>
                <Link
                  href="/lab"
                  className="hidden items-center gap-1.5 text-[13px] font-medium text-forest hover:text-forest-deep sm:inline-flex"
                >
                  View all projects
                  <ArrowRight className="size-3.5" />
                </Link>
              </header>

              {/* Project rows */}
              <ol className="mt-5 grid divide-y divide-forest/15">
                {tools.map((t) => (
                  <li key={t.slug} className="grid grid-cols-[28px_1fr_auto] items-center gap-4 py-3 first:pt-1.5">
                    <span className="font-medium text-[13px] tabular text-forest tracking-wide">
                      {t.index}
                    </span>
                    <div className="min-w-0">
                      <p className="h-display text-[18px] leading-snug text-ink">
                        {t.name}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">
                        {t.tagline}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ol>

              {/* Mobile-only "view all" footer link */}
              <div className="mt-2 border-t border-forest/15 pt-4 sm:hidden">
                <Link
                  href="/lab"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest"
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
                  <FacetDecoration id={f.id} />
                  <header className="relative flex items-center gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest/[0.1] text-forest">
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="h-display text-[20px] leading-tight text-ink">
                      {f.label}
                    </h3>
                  </header>
                  <p className="relative mt-4 max-w-[20ch] text-[14px] leading-relaxed text-ink/80">
                    {f.body}
                  </p>
                  {/* Tiny accent rule, like the wireframe */}
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

/* ---------------------------------------------------------------
 * FacetDecoration — tiny hand-drawn-feel inline SVG anchored to the
 * bottom-right of each facet card. Single forest color at low opacity,
 * matches the PNW backdrop vocabulary.
 * --------------------------------------------------------------- */
function FacetDecoration({ id }: { id: FacetId }) {
  const common = (
    <span
      aria-hidden
      className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-32 text-forest opacity-[0.22]"
    >
      <svg
        viewBox="0 0 140 120"
        className="h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {id === "operator" && (
          // Laptop with a tiny bar chart
          <>
            <path d="M 25 80 L 115 80 L 110 50 L 30 50 Z" />
            <path d="M 18 88 L 122 88 L 118 80 L 22 80 Z" />
            <g strokeWidth="1.2">
              <path d="M 45 70 L 45 60" />
              <path d="M 60 70 L 60 55" />
              <path d="M 75 70 L 75 50" />
              <path d="M 90 70 L 90 58" />
            </g>
            <path d="M 40 70 L 100 70" strokeWidth="1.1" opacity="0.5" />
          </>
        )}
        {id === "tpm" && (
          // Connected nodes — workflow / network graph
          <>
            <circle cx="35" cy="40" r="5" />
            <circle cx="95" cy="35" r="5" />
            <circle cx="65" cy="75" r="5" />
            <circle cx="115" cy="80" r="5" />
            <path d="M 40 42 L 90 36" />
            <path d="M 38 45 L 62 72" />
            <path d="M 70 75 L 110 80" />
            <path d="M 95 40 L 70 70" />
          </>
        )}
        {id === "seattle" && (
          // Mini Seattle skyline + space needle
          <>
            <rect x="20" y="60" width="14" height="32" />
            <rect x="38" y="50" width="18" height="42" />
            <rect x="60" y="65" width="12" height="27" />
            <rect x="76" y="45" width="20" height="47" />
            <rect x="100" y="58" width="14" height="34" />
            {/* mini space needle */}
            <path d="M 122 92 L 125 60" />
            <path d="M 132 92 L 129 60" />
            <path d="M 121 60 Q 127 54 133 60 Q 127 64 121 60 Z" />
            <path d="M 127 54 L 127 42" />
          </>
        )}
        {id === "sports" && (
          // Mountain ridge + baseball
          <>
            <path d="M 10 95 L 35 60 L 55 80 L 75 50 L 95 75 L 130 95 Z" fill="currentColor" fillOpacity="0.08" />
            <circle cx="115" cy="40" r="11" />
            <path d="M 107 35 Q 115 42 123 35" strokeWidth="1.1" opacity="0.7" />
            <path d="M 107 45 Q 115 38 123 45" strokeWidth="1.1" opacity="0.7" />
          </>
        )}
      </svg>
    </span>
  );
  return common;
}
