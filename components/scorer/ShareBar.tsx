"use client";

import Link from "next/link";
import { useState } from "react";

export function ShareBar() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — older browsers without clipboard write
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
      <p className="marginalia max-w-md text-[13px]">
        This score has a permanent URL. Send it to a teammate to debate the
        verdict.
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/tools/ai-use-case-scorer"
          className="rounded-md border border-ink/15 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft transition hover:border-ink/30 hover:text-ink"
        >
          Score another
        </Link>
        <button
          type="button"
          onClick={copyLink}
          className="cursor-pointer rounded-md bg-forest px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
