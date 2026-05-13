import Image from "next/image";

/**
 * Shared PNW watercolor backdrop used as the header decoration on every
 * top-level page (/, /lab, /resume, /about). One source of truth so the
 * Space Needle + Rainier + skyline + pines render at identical size and
 * opacity wherever the visitor lands.
 *
 * Drop inside a `<section className="relative">` (NO overflow-hidden — the
 * backdrop intentionally bleeds 40 below the section to fade into the page
 * paper). Set the content inside the section to `relative` so it paints
 * above the artwork.
 *
 * The backdrop anchors to the section's bottom edge, so on pages with
 * taller header sections the artwork sits lower. Pass `liftPx` to raise
 * it by N pixels and visually align with shorter pages (e.g. resume's
 * PDF-preview card makes that section ~140 taller than /lab).
 */
export function HeaderBackdrop({
  priority = false,
  liftPx = 0,
}: {
  priority?: boolean;
  liftPx?: number;
}) {
  const DEFAULT_TRANSLATE_PX = 160;
  const translateY = DEFAULT_TRANSLATE_PX - liftPx;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] overflow-hidden"
      style={{
        transform: `translateY(${translateY}px)`,
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 55%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 55%, transparent 100%)",
      }}
    >
      <Image
        src="/hero-backdrop2.png"
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-bottom"
      />
    </div>
  );
}
