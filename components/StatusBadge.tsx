import { cn } from "@/lib/utils";
import type { ToolStatus } from "@/data/tools";
import { statusLabel } from "@/data/tools";

const styles: Record<
  ToolStatus,
  { dot: string; text: string; bg: string; ring: string }
> = {
  live: {
    dot: "bg-sage",
    text: "text-sage",
    bg: "bg-sage/[0.10]",
    ring: "ring-sage/30",
  },
  "in-progress": {
    dot: "bg-amber-status",
    text: "text-amber-status",
    bg: "bg-amber-status/[0.12]",
    ring: "ring-amber-status/30",
  },
  planned: {
    dot: "bg-slate-status",
    text: "text-slate-status",
    bg: "bg-slate-status/[0.12]",
    ring: "ring-slate-status/25",
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
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase ring-1 ring-inset",
        s.bg,
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
