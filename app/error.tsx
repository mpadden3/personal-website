"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HeaderBackdrop } from "@/components/HeaderBackdrop";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative border-b border-ink/10">
      <HeaderBackdrop />
      <div className="relative mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex items-center gap-3 text-ink-soft">
          <span className="font-mono text-[11px] tracking-[0.2em] tabular">
            500
          </span>
          <span className="h-px w-8 bg-ink/30" aria-hidden />
          <span className="label-eyebrow">Workshop hiccup</span>
        </div>
        <h1 className="h-display mt-7 text-[clamp(2.4rem,6vw,4.5rem)] leading-tight text-ink">
          Something{" "}
          <span className="display-italic text-rust">went sideways</span>.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/85">
          A tool in the lab threw an error. Try again, or head back home.
          {error.digest ? (
            <>
              {" "}
              <span className="font-mono text-[12.5px] text-ink-soft">
                ref: {error.digest}
              </span>
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => unstable_retry()}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13.5px] font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Try again
            <span aria-hidden>↻</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-[13.5px] font-medium text-ink ring-1 ring-ink/30 transition-colors hover:ring-ink"
          >
            <span className="ink-underline">Back to home</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
