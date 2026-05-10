import { cn } from "@/lib/utils";
import type { ToolStatus } from "@/data/tools";
import { statusLabel } from "@/data/tools";

const styles: Record<ToolStatus, { dot: string; text: string; ring: string }> = {
  live: {
    dot: "bg-sage",
    text: "text-sage",
    ring: "ring-sage/30",
  },
  "in-progress": {
    dot: "bg-amber-status",
    text: "text-amber-status",
    ring: "ring-amber-status/35",
  },
  planned: {
    dot: "bg-ink-soft/60",
    text: "text-ink-soft",
    ring: "ring-ink/15",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ToolStatus;
  className?: string;
}) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm bg-cream/70 px-2 py-1 font-mono text-[10px] font-medium tracking-[0.16em] uppercase ring-1 ring-inset",
        s.text,
        s.ring,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {statusLabel[status]}
    </span>
  );
}
