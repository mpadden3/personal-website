"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home" },
  { href: "/lab", label: "AI Lab" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-forest/15 bg-cream/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-4"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-cream font-semibold tracking-wider"
            style={{ fontSize: "15px", letterSpacing: "0.06em" }}
          >
            MP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="h-display text-[26px] text-ink leading-none">
              Mike Padden
            </span>
            <span className="mt-1.5 text-[10.5px] tracking-[0.18em] uppercase text-forest font-medium">
              Technical Program Manager{" "}
              <span className="text-forest/50 mx-1">·</span>{" "}
              AI Operator
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-md px-4 py-2 text-[15px] tracking-wide transition-colors",
                  active ? "text-ink font-medium" : "text-ink-soft hover:text-ink",
                )}
              >
                <span>{item.label}</span>
                {active ? (
                  <span
                    className="absolute -bottom-[6px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-forest"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
          <Link
            href="/lab"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Visit the Lab
            <span aria-hidden>→</span>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-forest/20 text-ink"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <path d="M3 3l12 12" />
                <path d="M15 3L3 15" />
              </>
            ) : (
              <>
                <path d="M2 5h14" />
                <path d="M2 13h14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-forest/15 bg-cream"
        >
          <nav className="mx-auto grid max-w-6xl gap-1 px-6 py-4">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-3 text-base",
                    active
                      ? "bg-forest/[0.08] text-ink"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  <span className="h-display text-lg">{item.label}</span>
                  <span className="text-xs text-forest">→</span>
                </Link>
              );
            })}
            <Link
              href="/lab"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-[14px] font-medium text-cream"
            >
              Visit the Lab
              <span aria-hidden>→</span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
