import Image from "next/image";
import type { Wireframe } from "@/lib/useCaseScorer";

export function WireframeSketch({ wireframe }: { wireframe: Wireframe }) {
  return (
    <section className="grid gap-3">
      <span className="label-eyebrow">Imagined v1</span>
      <div className="overflow-hidden rounded-2xl border border-ink/15 bg-cream shadow-xl shadow-ink/15">
        <Image
          src={wireframe.url}
          alt="AI-generated mockup of the proposed application"
          width={1536}
          height={1024}
          className="block h-auto w-full"
          unoptimized
        />
      </div>
      <p className="marginalia">
        AI&apos;s take on what a v1 of this could look like — generated from a
        sanitized one-sentence summary. Not a real product. Not a design
        recommendation.
      </p>
    </section>
  );
}
