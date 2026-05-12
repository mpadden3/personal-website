"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

type Source = { title: string; url: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

// --- Tiny markdown renderer ---------------------------------------
// Covers what our chat model actually emits: ### headings, **bold**, *italic*,
// `code`, [text](url), - / 1. lists, --- horizontal rules. Soft line breaks
// inside a paragraph collapse to spaces (CommonMark). Not a full spec — just
// enough to make the assistant's structured replies readable.

type Block =
  | { type: "h"; level: 1 | 2 | 3; content: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; lines: string[] }
  | { type: "hr" };

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    if (/^-{3,}$|^\*{3,}$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      blocks.push({
        type: "h",
        level: heading[1].length as 1 | 2 | 3,
        content: heading[2],
      });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (!current || current.type !== "ul") {
        flush();
        current = { type: "ul", items: [] };
      }
      current.items.push(bullet[1]);
      continue;
    }
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (!current || current.type !== "ol") {
        flush();
        current = { type: "ol", items: [] };
      }
      current.items.push(ordered[1]);
      continue;
    }
    if (!current || current.type !== "p") {
      flush();
      current = { type: "p", lines: [] };
    }
    current.lines.push(line);
  }
  flush();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  // Order matters — **bold** before *italic* so we don't half-consume **.
  const re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\))/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={i++} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*")) {
      out.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("`")) {
      out.push(
        <code
          key={i++}
          className="rounded bg-ink/10 px-1 py-0.5 font-mono text-[0.92em]"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("[")) {
      const linkM = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkM) {
        out.push(
          <a
            key={i++}
            href={linkM[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest underline-offset-2 hover:underline"
          >
            {linkM[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MarkdownContent({ text }: { text: string }) {
  const blocks = parseMarkdown(text);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "hr") {
          return <hr key={i} className="my-2 border-ink/15" />;
        }
        if (b.type === "h") {
          const size =
            b.level === 1
              ? "text-[15px]"
              : b.level === 2
                ? "text-[14px]"
                : "text-[13.5px]";
          return (
            <p
              key={i}
              className={`mt-2.5 font-semibold text-ink first:mt-0 ${size}`}
            >
              {renderInline(b.content)}
            </p>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="my-1 grid list-disc gap-0.5 pl-5">
              {b.items.map((c, j) => (
                <li key={j}>{renderInline(c)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i} className="my-1 grid list-decimal gap-0.5 pl-5">
              {b.items.map((c, j) => (
                <li key={j}>{renderInline(c)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="my-1 first:mt-0 last:mb-0">
            {b.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 ? " " : null}
                {renderInline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

const SUGGESTIONS = [
  "What vendors do we still need to book?",
  "What's due this month?",
  "What are good greenery-heavy floral ideas for June in Washington?",
  "What questions should we ask the photographer?",
];

export function WeddingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/wedding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as {
        ok: boolean;
        reply?: string;
        sources?: Source[];
      };
      if (!json.ok || !json.reply) throw new Error("no reply");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: json.reply!, sources: json.sources ?? [] },
      ]);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="Planning assistant chat"
          className="flex h-[min(620px,calc(100vh-2.5rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-2xl shadow-ink/20"
        >
          <header className="flex items-start justify-between gap-3 border-b border-ink/10 bg-cream-deep/40 px-4 py-3">
            <div className="min-w-0">
              <span className="label-eyebrow">Planning Assistant</span>
              <h2 className="h-display mt-0.5 truncate text-[18px] leading-tight text-ink">
                Ask the planning assistant.
              </h2>
            </div>
            <div className="-mr-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                  setInput("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                disabled={messages.length === 0 && !input && !error}
                aria-label="Clear conversation"
                className="cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition hover:bg-ink/5 hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="cursor-pointer rounded-md px-2 py-1 font-mono text-[14px] leading-none text-ink-soft transition hover:bg-ink/5 hover:text-ink"
              >
                ×
              </button>
            </div>
          </header>

          {messages.length === 0 ? (
            <div className="border-b border-ink/10 px-4 pb-3 pt-3">
              <p className="marginalia mb-2 text-[13px]">
                Knows the checklist above and can pull from the web for ideas and
                vendor questions. Budget and headcount stay private.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={busy}
                    className="cursor-pointer rounded-full border border-ink/10 bg-cream-deep/50 px-2.5 py-1 text-[11.5px] leading-tight text-ink-soft transition hover:border-forest/40 hover:bg-cream hover:text-ink disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div ref={listRef} className="flex-1 overflow-y-auto bg-cream/60 px-3 py-3">
            {messages.length === 0 ? (
              <p className="marginalia px-2 py-8 text-center">
                Pick a question above, or ask your own.
              </p>
            ) : (
              <div className="grid gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-forest text-cream"
                        : "mr-auto bg-cream-deep/70 text-ink"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="grid">
                        <MarkdownContent text={m.content} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                    {m.sources && m.sources.length > 0 ? (
                      <div className="mt-2 grid gap-1 border-t border-ink/10 pt-2">
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-soft">
                          Sources
                        </span>
                        <ul className="grid gap-0.5">
                          {m.sources.map((s, idx) => (
                            <li key={idx} className="text-[11.5px]">
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-forest underline-offset-2 hover:underline"
                              >
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
                {busy ? (
                  <div className="mr-auto max-w-[92%] rounded-2xl bg-cream-deep/70 px-3.5 py-2.5 text-[13.5px] text-ink-soft">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-forest" />
                      Thinking…
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {error ? (
            <p className="border-t border-ink/10 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-rust">
              Couldn&apos;t reach the assistant: {error}
            </p>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-ink/10 bg-cream-deep/30 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything wedding-planning…"
              maxLength={500}
              disabled={busy}
              className="flex-1 rounded-md border border-ink/10 bg-cream px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-soft/70 focus:border-forest focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="cursor-pointer rounded-md bg-forest px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open planning assistant chat"
          className="group flex h-14 items-center gap-2 rounded-full bg-forest px-4 text-cream shadow-lg shadow-ink/25 transition hover:bg-forest-deep hover:shadow-ink/40"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] sm:inline">
            Ask the planner
          </span>
        </button>
      )}
    </div>
  );
}
