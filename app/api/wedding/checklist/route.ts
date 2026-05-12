import {
  phases,
  weddingChecklistSeed,
  type ChecklistItem,
  type PhaseKey,
} from "@/data/weddingChecklistSeed";
import {
  getWeddingState,
  mutateWeddingState,
  type WeddingChecklistState,
} from "@/lib/weddingBlob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GetResponse = {
  ok: true;
  items: ChecklistItem[];
  state: WeddingChecklistState;
};

function mergeItems(state: WeddingChecklistState): ChecklistItem[] {
  return [...weddingChecklistSeed, ...state.custom].map((it) => {
    const override = state.phaseOverrides[it.id];
    return override ? { ...it, phase: override } : it;
  });
}

export async function GET(): Promise<Response> {
  const state = await getWeddingState();
  const body: GetResponse = { ok: true, items: mergeItems(state), state };
  return Response.json(body);
}

type ToggleAction = { type: "toggle"; id: string };
type AddAction = { type: "add"; label: string; phase: PhaseKey };
type RemoveAction = { type: "remove"; id: string };
type MoveAction = { type: "move"; id: string; toPhase: PhaseKey };
type Action = ToggleAction | AddAction | RemoveAction | MoveAction;

const PHASE_SET = new Set(phases.map((p) => p.key));

function parseAction(body: unknown): Action | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.type === "toggle" && typeof b.id === "string" && b.id.length < 200) {
    return { type: "toggle", id: b.id };
  }
  if (
    b.type === "add" &&
    typeof b.label === "string" &&
    b.label.trim().length > 0 &&
    b.label.length <= 200 &&
    typeof b.phase === "string" &&
    PHASE_SET.has(b.phase as PhaseKey)
  ) {
    return { type: "add", label: b.label.trim(), phase: b.phase as PhaseKey };
  }
  if (b.type === "remove" && typeof b.id === "string" && b.id.length < 200) {
    return { type: "remove", id: b.id };
  }
  if (
    b.type === "move" &&
    typeof b.id === "string" &&
    b.id.length < 200 &&
    typeof b.toPhase === "string" &&
    PHASE_SET.has(b.toPhase as PhaseKey)
  ) {
    return { type: "move", id: b.id, toPhase: b.toPhase as PhaseKey };
  }
  return null;
}

function customId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `custom-${ts}-${rand}`;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const action = parseAction(body);
  if (!action) {
    return Response.json({ ok: false, error: "invalid action" }, { status: 400 });
  }

  const seedIds = new Set(weddingChecklistSeed.map((s) => s.id));

  const next = await mutateWeddingState((current) => {
    if (action.type === "toggle") {
      const customIds = new Set(current.custom.map((c) => c.id));
      if (!seedIds.has(action.id) && !customIds.has(action.id)) {
        return current; // unknown id, no-op
      }
      const checked = { ...current.checked };
      if (checked[action.id]) {
        delete checked[action.id];
      } else {
        checked[action.id] = true;
      }
      return { ...current, checked };
    }
    if (action.type === "add") {
      const id = customId();
      const item: ChecklistItem = { id, label: action.label, phase: action.phase };
      return { ...current, custom: [...current.custom, item] };
    }
    if (action.type === "remove") {
      // Only custom items can be removed.
      if (seedIds.has(action.id)) return current;
      const custom = current.custom.filter((c) => c.id !== action.id);
      const checked = { ...current.checked };
      delete checked[action.id];
      const phaseOverrides = { ...current.phaseOverrides };
      delete phaseOverrides[action.id];
      return { ...current, custom, checked, phaseOverrides };
    }
    if (action.type === "move") {
      const customIds = new Set(current.custom.map((c) => c.id));
      if (!seedIds.has(action.id) && !customIds.has(action.id)) return current;
      const phaseOverrides = { ...current.phaseOverrides };
      // For custom items, also update their stored phase so removal of the
      // override later still leaves them in the right place.
      let custom = current.custom;
      if (customIds.has(action.id)) {
        custom = current.custom.map((c) =>
          c.id === action.id ? { ...c, phase: action.toPhase } : c,
        );
      }
      // Find the original seed phase to decide whether to clear the override.
      const seed = weddingChecklistSeed.find((s) => s.id === action.id);
      if (seed && seed.phase === action.toPhase) {
        delete phaseOverrides[action.id];
      } else {
        phaseOverrides[action.id] = action.toPhase;
      }
      return { ...current, custom, phaseOverrides };
    }
    return current;
  });

  return Response.json({ ok: true, items: mergeItems(next), state: next });
}
