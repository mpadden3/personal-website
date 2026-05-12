"use client";

import { useState } from "react";
import type { ChecklistItem as Item } from "@/data/weddingChecklistSeed";

type ConfettiPiece = { dx: number; dy: number; color: string; rot: number; size: number };

const CONFETTI_COLORS = [
  "var(--forest)",
  "var(--peach)",
  "var(--sky)",
  "var(--rust)",
  "var(--sage)",
];

function randomConfetti(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
    const dist = 22 + Math.random() * 18;
    pieces.push({
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * 360,
      size: 4 + Math.random() * 3,
    });
  }
  return pieces;
}

export function ChecklistItemRow({
  item,
  checked,
  onToggle,
  onRemove,
  onDragStart,
  onDragEnd,
  isCustom,
}: {
  item: Item;
  checked: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isCustom: boolean;
}) {
  const [burstId, setBurstId] = useState(0);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  function handleClick() {
    if (!checked) {
      setPieces(randomConfetti());
      setBurstId((n) => n + 1);
    }
    onToggle();
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      className="group/item relative grid cursor-move grid-cols-[auto_auto_1fr_auto] items-start gap-2 py-2"
    >
      <span
        aria-hidden
        className="mt-[5px] select-none font-mono text-[11px] leading-none text-ink-soft/50 transition group-hover/item:text-ink-soft"
      >
        ⋮⋮
      </span>

      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={checked ? `Uncheck: ${item.label}` : `Check: ${item.label}`}
        onClick={handleClick}
        className={`relative mt-[3px] grid h-[22px] w-[22px] cursor-pointer place-items-center rounded-full border-2 transition-colors duration-200 ${
          checked
            ? "wedding-check-on border-forest bg-forest"
            : "border-ink/30 bg-cream hover:border-forest/60"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            className="wedding-check-path"
            d="M2.5 7.5 L6 11 L11.5 3.5"
            fill="none"
            stroke={checked ? "var(--cream)" : "transparent"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {pieces.length > 0 ? (
          <span
            key={burstId}
            aria-hidden
            className="pointer-events-none absolute inset-0"
          >
            {pieces.map((p, idx) => (
              <span
                key={idx}
                className="wedding-confetti-piece absolute left-1/2 top-1/2 block rounded-[1px]"
                style={
                  {
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    background: p.color,
                    transform: `rotate(${p.rot}deg)`,
                    "--cx": `${p.dx}px`,
                    "--cy": `${p.dy}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
      </button>

      <div className="min-w-0">
        <div className="relative inline-block max-w-full">
          <span
            className={`block text-[15px] leading-snug transition-colors duration-300 ${
              checked ? "text-ink-soft" : "text-ink"
            }`}
          >
            {item.label}
          </span>
          <span
            aria-hidden
            className={`pointer-events-none absolute left-0 top-1/2 h-[1.5px] w-full bg-ink-soft/70 ${
              checked ? "wedding-strike-on" : "wedding-strike"
            }`}
          />
        </div>
        {isCustom ? (
          <div className="mt-1">
            <span className="rounded-sm bg-peach/40 px-1.5 py-[1px] font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              You added this
            </span>
          </div>
        ) : null}
      </div>

      {isCustom && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.label}`}
          className="mt-1 cursor-pointer px-1 font-mono text-[14px] leading-none text-ink-soft opacity-0 transition hover:text-rust group-hover/item:opacity-100"
        >
          ×
        </button>
      ) : (
        <span aria-hidden />
      )}
    </li>
  );
}
