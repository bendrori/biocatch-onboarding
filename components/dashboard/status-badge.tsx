import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending_review: "bg-warning/10 text-warning ring-warning/20",
  approved: "bg-success/10 text-success ring-success/20",
  rejected: "bg-destructive/10 text-destructive ring-destructive/20",
  poc_in_progress: "bg-info/10 text-info ring-info/20",
  validating: "bg-muted text-muted-foreground ring-border",
  validated: "bg-success/10 text-success ring-success/20",
  production_ready: "bg-success/10 text-success ring-success/20",
  shipped: "bg-muted text-foreground ring-border",
  draft: "bg-muted text-muted-foreground ring-border",
  open: "bg-info/10 text-info ring-info/20",
  active: "bg-success/10 text-success ring-success/20",
  resolved: "bg-muted text-muted-foreground ring-border",
  critical: "bg-destructive/10 text-destructive ring-destructive/20",
  high: "bg-warning/10 text-warning ring-warning/20",
  medium: "bg-muted text-muted-foreground ring-border",
  low: "bg-muted text-muted-foreground ring-border",
  production_candidate: "bg-success/10 text-success ring-success/20",
  poc_passed: "bg-success/10 text-success ring-success/20",
  ready_for_sdk: "bg-success/10 text-success ring-success/20",
  needs_more_data: "bg-warning/10 text-warning ring-warning/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        statusStyles[status] ?? "bg-muted text-muted-foreground ring-border",
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="font-mono text-sm font-medium tabular-nums text-foreground">{score}</span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge status={priority} />;
}
