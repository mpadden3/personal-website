import Link from "next/link";

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/lab", label: "AI Lab" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "About" },
];

const elsewhereLinks = [
  { href: "https://www.linkedin.com/in/michael-padden-470a0ab0/", label: "LinkedIn" },
  { href: "mailto:mpadden33@gmail.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-ink/10 bg-cream-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-10">
        <div>
          <p className="label-eyebrow">Colophon</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            <span className="display-italic text-ink">
              The AI Lab of Mike Padden
            </span>{" "}
            — a small, ongoing collection of practical AI tools, written in
            Seattle. Set in Fraunces &amp; IBM Plex.
          </p>
          <p className="marginalia mt-6 text-ink-soft">
            Saying no to chatbot bloat. Building the next thing on the bench.
          </p>
        </div>

        <div>
          <p className="label-eyebrow">Pages</p>
          <ul className="mt-4 grid gap-2 text-[15px]">
            {pageLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-ink hover:text-cobalt"
                >
                  <span className="font-mono text-[11px] text-ink-soft tabular">
                    →
                  </span>
                  <span className="ink-underline">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-eyebrow">Elsewhere</p>
          <ul className="mt-4 grid gap-2 text-[15px]">
            {elsewhereLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 text-ink hover:text-cobalt"
                >
                  <span className="font-mono text-[11px] text-ink-soft tabular">
                    ↗
                  </span>
                  <span className="ink-underline">{l.label}</span>
                </a>
              </li>
            ))}
            <li className="mt-2 text-[13px] text-ink-soft">
              <span className="font-mono">mpadden33@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-5 text-[12px] text-ink-soft sm:flex-row sm:items-center lg:px-10">
          <p className="font-mono tracking-wide">
            © {new Date().getFullYear()} Mike Padden · Seattle, WA · 47.6°N
          </p>
          <p className="font-mono tracking-wide">
            Issue №01 — Site shell · v0.1
          </p>
        </div>
      </div>
    </footer>
  );
}
