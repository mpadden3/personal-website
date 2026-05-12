"use client";

import { useMemo, useState } from "react";
import {
  phases,
  weddingChecklistSeed,
  type ChecklistItem,
  type PhaseKey,
} from "@/data/weddingChecklistSeed";
import type { WeddingChecklistState } from "@/lib/weddingBlob";
import { ChecklistItemRow } from "./ChecklistItem";
import { MutationGateDialog, useMutationGate } from "./MutationGate";

type ChecklistAction =
  | { type: "toggle"; id: string }
  | { type: "add"; label: string; phase: PhaseKey }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; toPhase: PhaseKey }
  | { type: "edit"; id: string; label: string };

function applyOptimistic(
  state: WeddingChecklistState,
  action: ChecklistAction,
  seedIds: Set<string>,
): WeddingChecklistState {
  if (action.type === "toggle") {
    const checked = { ...state.checked };
    if (checked[action.id]) delete checked[action.id];
    else checked[action.id] = true;
    return { ...state, checked };
  }
  if (action.type === "add") {
    const tempId = `pending-${Math.random().toString(36).slice(2, 10)}`;
    return {
      ...state,
      custom: [...state.custom, { id: tempId, label: action.label, phase: action.phase }],
    };
  }
  if (action.type === "remove") {
    const checked = { ...state.checked };
    delete checked[action.id];
    const phaseOverrides = { ...state.phaseOverrides };
    delete phaseOverrides[action.id];
    const labelOverrides = { ...state.labelOverrides };
    delete labelOverrides[action.id];
    if (seedIds.has(action.id)) {
      const deletedSeedIds = state.deletedSeedIds.includes(action.id)
        ? state.deletedSeedIds
        : [...state.deletedSeedIds, action.id];
      return { ...state, checked, phaseOverrides, labelOverrides, deletedSeedIds };
    }
    return {
      ...state,
      custom: state.custom.filter((c) => c.id !== action.id),
      checked,
      phaseOverrides,
      labelOverrides,
    };
  }
  if (action.type === "move") {
    const phaseOverrides = { ...state.phaseOverrides };
    const seed = weddingChecklistSeed.find((s) => s.id === action.id);
    if (seed && seed.phase === action.toPhase) {
      delete phaseOverrides[action.id];
    } else {
      phaseOverrides[action.id] = action.toPhase;
    }
    const custom = state.custom.map((c) =>
      c.id === action.id ? { ...c, phase: action.toPhase } : c,
    );
    return { ...state, phaseOverrides, custom };
  }
  if (action.type === "edit") {
    const labelOverrides = { ...state.labelOverrides };
    let custom = state.custom;
    if (seedIds.has(action.id)) {
      const seed = weddingChecklistSeed.find((s) => s.id === action.id);
      if (seed && seed.label === action.label) {
        delete labelOverrides[action.id];
      } else {
        labelOverrides[action.id] = action.label;
      }
    } else {
      custom = state.custom.map((c) =>
        c.id === action.id ? { ...c, label: action.label } : c,
      );
    }
    return { ...state, labelOverrides, custom };
  }
  return state;
}

function resolvePhase(item: ChecklistItem, overrides: Record<string, PhaseKey>): PhaseKey {
  return overrides[item.id] ?? item.phase;
}

export function ChecklistPanel({
  initialState,
}: {
  initialState: WeddingChecklistState;
}) {
  const [state, setState] = useState<WeddingChecklistState>(initialState);
  const [collapsed, setCollapsed] = useState<Record<PhaseKey, boolean>>({} as Record<PhaseKey, boolean>);
  const [addLabel, setAddLabel] = useState("");
  const [addPhase, setAddPhase] = useState<PhaseKey>("y1");
  const [error, setError] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PhaseKey | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { requestMutation, pendingAction, close, confirm } = useMutationGate();

  const seedIds = useMemo(() => new Set(weddingChecklistSeed.map((s) => s.id)), []);

  const items = useMemo<ChecklistItem[]>(() => {
    const deleted = new Set(state.deletedSeedIds);
    const visibleSeed = weddingChecklistSeed.filter((s) => !deleted.has(s.id));
    return [...visibleSeed, ...state.custom].map((it) => ({
      ...it,
      label: state.labelOverrides[it.id] ?? it.label,
    }));
  }, [state.custom, state.deletedSeedIds, state.labelOverrides]);

  const byPhase = useMemo(() => {
    const map = new Map<PhaseKey, ChecklistItem[]>();
    for (const it of items) {
      const phase = resolvePhase(it, state.phaseOverrides);
      const arr = map.get(phase) ?? [];
      arr.push(it);
      map.set(phase, arr);
    }
    return map;
  }, [items, state.phaseOverrides]);

  const totals = useMemo(() => {
    const total = items.length;
    const done = items.filter((it) => state.checked[it.id]).length;
    return { total, done };
  }, [items, state.checked]);

  async function send(action: ChecklistAction) {
    const previous = state;
    const optimistic = applyOptimistic(state, action, seedIds);
    setState(optimistic);
    setError(null);
    try {
      const res = await fetch("/api/wedding/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as { ok: boolean; state?: WeddingChecklistState };
      if (!json.ok || !json.state) throw new Error("server rejected change");
      setState(json.state);
    } catch (err) {
      setState(previous);
      setError((err as Error).message);
    }
  }

  function handleToggle(id: string) {
    requestMutation(() => send({ type: "toggle", id }));
  }
  function handleRemove(id: string) {
    requestMutation(() => send({ type: "remove", id }));
  }
  function handleMove(id: string, toPhase: PhaseKey) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const currentPhase = resolvePhase(item, state.phaseOverrides);
    if (currentPhase === toPhase) return;
    requestMutation(() => send({ type: "move", id, toPhase }));
  }
  function handleEdit(id: string, label: string) {
    requestMutation(() => send({ type: "edit", id, label }));
  }
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const label = addLabel.trim();
    if (!label) return;
    requestMutation(() => {
      send({ type: "add", label, phase: addPhase });
      setAddLabel("");
    });
  }

  return (
    <section className="mt-12">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/10 pb-3">
        <div>
          <span className="label-eyebrow">Checklist</span>
          <h2 className="h-display mt-1 text-[28px] leading-tight text-ink">
            Things to do, things to cross off.
          </h2>
          <p className="marginalia mt-1">
            Drag any item by its handle (⋮⋮) to a different section to move it.
          </p>
        </div>
        <span className="font-mono text-[12px] tabular text-ink-soft">
          {totals.done} of {totals.total} done
        </span>
      </header>

      <form
        onSubmit={handleAdd}
        className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-cream-deep/40 p-3"
      >
        <input
          type="text"
          value={addLabel}
          onChange={(e) => setAddLabel(e.target.value)}
          placeholder="Add a new item…"
          maxLength={200}
          className="flex-1 rounded-md border border-ink/10 bg-cream px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/70 focus:border-forest focus:outline-none"
        />
        <select
          value={addPhase}
          onChange={(e) => setAddPhase(e.target.value as PhaseKey)}
          className="rounded-md border border-ink/10 bg-cream px-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft focus:border-forest focus:outline-none"
        >
          {phases.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!addLabel.trim()}
          className="rounded-md bg-forest px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {error ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-rust">
          Couldn&apos;t save: {error}. Tried again?
        </p>
      ) : null}

      <div className="mt-6 grid gap-7">
        {phases.map((p) => {
          const list = byPhase.get(p.key) ?? [];
          const doneInPhase = list.filter((it) => state.checked[it.id]).length;
          const isCollapsed = collapsed[p.key];
          const isDropTarget = dropTarget === p.key;
          return (
            <div
              key={p.key}
              onDragOver={(e) => {
                if (!draggingId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dropTarget !== p.key) setDropTarget(p.key);
              }}
              onDragLeave={(e) => {
                // Only clear if leaving the section entirely.
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                if (dropTarget === p.key) setDropTarget(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setDropTarget(null);
                if (id) handleMove(id, p.key);
              }}
              className={`grid gap-2 rounded-lg p-2 -m-2 transition-colors ${
                isDropTarget
                  ? "bg-forest/[0.06] outline outline-2 outline-dashed outline-forest/40"
                  : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setCollapsed((s) => ({ ...s, [p.key]: !s[p.key] }))}
                className="group/phase flex items-baseline justify-between gap-3 border-b border-ink/10 pb-1 text-left"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] tabular text-ink-soft group-hover/phase:text-ink">
                    {isCollapsed ? "+" : "−"}
                  </span>
                  <span className="display-italic text-[18px] text-forest">
                    {p.label}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                    {p.goal}
                  </span>
                </div>
                <span className="font-mono text-[11px] tabular text-ink-soft">
                  {doneInPhase}/{list.length}
                </span>
              </button>
              {isCollapsed && list.length > 0 ? null : list.length === 0 ? (
                <p className="px-1 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft/60">
                  Drop items here.
                </p>
              ) : (
                <ul className="grid">
                  {list.map((it) => (
                    <ChecklistItemRow
                      key={it.id}
                      item={it}
                      checked={!!state.checked[it.id]}
                      onToggle={() => handleToggle(it.id)}
                      onRemove={() => handleRemove(it.id)}
                      onEdit={(label) => handleEdit(it.id, label)}
                      onDragStart={(id) => setDraggingId(id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      isCustom={!seedIds.has(it.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <MutationGateDialog
        open={!!pendingAction}
        onCancel={close}
        onConfirm={confirm}
      />
    </section>
  );
}
