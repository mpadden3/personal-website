"use client";

import { useEffect, useRef, useState } from "react";
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
  onEdit,
  onDragStart,
  onDragEnd,
  isCustom,
}: {
  item: Item;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (label: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isCustom: boolean;
}) {
  const [burstId, setBurstId] = useState(0);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (editing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editing]);

  // Keep editValue in sync if the item's label changes externally
  // (e.g. another tab made an edit).
  useEffect(() => {
    if (!editing) setEditValue(item.label);
  }, [item.label, editing]);

  function handleClick() {
    if (!checked) {
      setPieces(randomConfetti());
      setBurstId((n) => n + 1);
    }
    onToggle();
  }

  function startEdit() {
    setEditValue(item.label);
    setEditing(true);
    setMenuOpen(false);
  }

  function commitEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === item.label) {
      setEditing(false);
      setEditValue(item.label);
      return;
    }
    onEdit(trimmed);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
    setEditValue(item.label);
  }

  return (
    <li
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      className={`group/item relative grid grid-cols-[auto_auto_1fr_auto] items-start gap-2 py-2 ${
        editing ? "cursor-default" : "cursor-move"
      }`}
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
        {editing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            maxLength={200}
            className="w-full rounded-md border border-forest/40 bg-cream px-2 py-1 text-[15px] text-ink focus:border-forest focus:outline-none"
          />
        ) : (
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
        )}
        {isCustom ? (
          <div className="mt-1">
            <span className="rounded-sm bg-peach/40 px-1.5 py-[1px] font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              You added this
            </span>
          </div>
        ) : null}
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={`Actions for ${item.label}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="mt-0.5 cursor-pointer rounded-md px-1.5 py-0.5 font-mono text-[16px] leading-none text-ink-soft/60 opacity-60 transition hover:bg-ink/5 hover:text-ink hover:opacity-100 group-hover/item:opacity-100"
        >
          ⋯
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 grid w-32 overflow-hidden rounded-md border border-ink/15 bg-cream py-1 shadow-lg shadow-ink/15"
          >
            <button
              type="button"
              role="menuitem"
              onClick={startEdit}
              className="cursor-pointer px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition hover:bg-forest/10 hover:text-ink"
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onRemove();
              }}
              className="cursor-pointer px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-rust transition hover:bg-rust/10"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
