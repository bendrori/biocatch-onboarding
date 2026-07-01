import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  poc_in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  validating: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  validated: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  production_ready: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground",
  open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  resolved: "bg-muted text-muted-foreground",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-muted text-muted-foreground",
  production_candidate: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  poc_passed: "bg-green-500/10 text-green-500 border-green-500/20",
  ready_for_sdk: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  needs_more_data: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 65
        ? "text-green-500"
        : score >= 50
          ? "text-yellow-500"
          : "text-muted-foreground";

  return (
    <span className={cn("font-mono font-semibold tabular-nums", color)}>
      {score}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge status={priority} />;
}
