"use client";

import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "wedding-checklist-approved";

function isApproved(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markApproved() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore
  }
}

export function useMutationGate() {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestMutation = useCallback((action: () => void) => {
    if (isApproved()) {
      action();
      return;
    }
    setPendingAction(() => action);
  }, []);

  const close = useCallback(() => setPendingAction(null), []);

  const confirm = useCallback(
    (rememberForSession: boolean) => {
      if (rememberForSession) markApproved();
      const action = pendingAction;
      setPendingAction(null);
      action?.();
    },
    [pendingAction],
  );

  return { requestMutation, pendingAction, close, confirm };
}

export function MutationGateDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (rememberForSession: boolean) => void;
}) {
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mutation-gate-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-cream px-7 py-7 shadow-xl">
        <span className="label-eyebrow">Quick check</span>
        <h2
          id="mutation-gate-title"
          className="h-display mt-2 text-[26px] leading-tight text-ink"
        >
          Are you Mike or Ashley?
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/85">
          This is the live planning checklist for our wedding, so we&apos;d rather
          not have the internet rearranging it. If one of us asked you to make a
          change, go ahead. Otherwise, no hard feelings — just close this and
          have a look around.
        </p>

        <label className="mt-5 flex items-center gap-2 text-[13px] text-ink-soft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 accent-forest"
          />
          Don&apos;t ask me again this session
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-ink/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft transition hover:border-ink/30 hover:text-ink"
          >
            Nope, just browsing
          </button>
          <button
            type="button"
            onClick={() => onConfirm(remember)}
            className="rounded-md bg-forest px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-forest-deep"
          >
            Yes — I&apos;m good
          </button>
        </div>
      </div>
    </div>
  );
}
