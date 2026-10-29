import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  submitted: "bg-warning/15 text-foreground border-warning/40",
  approved: "bg-success/15 text-foreground border-success/40",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  open: "bg-lime text-lime-foreground border-transparent",
  draft: "bg-muted text-muted-foreground border-border",
  paused: "bg-warning/15 text-foreground border-warning/40",
  closed: "bg-secondary text-muted-foreground border-border",
};

const labels: Record<string, string> = { submitted: "In review" };

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status],
      )}
    >
      {status === "open" && <span className="size-1.5 rounded-full bg-lime-foreground rec-dot" />}
      {labels[status] ?? status}
    </span>
  );
}

export function RewardNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Views and proposed rewards are manual review records, not platform-verified analytics. Rewards are noncash in-app records.
    </p>
  );
}
