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
    <header className="relative z-30 border-b border-ink/10 bg-cream/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span
            className="display-italic flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream"
            aria-hidden
          >
            <span className="text-base leading-none">m</span>
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-mono text-[10px] tracking-[0.22em] text-ink-soft uppercase">
              Mike Padden
            </span>
            <span className="display-italic mt-0.5 text-base text-ink">
              ai · lab · seattle
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-md px-3 py-2 text-[13px] font-medium tracking-wide transition-colors",
                  active
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                <span className="ink-underline">{item.label}</span>
                {active ? (
                  <span
                    className="absolute -bottom-[6px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rust"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
          <Link
            href="/lab"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-cream transition-colors hover:bg-cobalt-deep"
          >
            Visit the Lab
            <span aria-hidden>→</span>
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-ink/15 text-ink"
        >
          <span className="sr-only">Menu</span>
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
          className="md:hidden border-t border-ink/10 bg-cream"
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
                      ? "bg-ink/[0.06] text-ink"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  <span className="display-italic">{item.label}</span>
                  <span className="font-mono text-xs text-ink-soft">↗</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
