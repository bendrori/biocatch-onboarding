import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending_review: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  rejected: "bg-red-500/10 text-red-300 ring-red-500/20",
  poc_in_progress: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  validating: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
  validated: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  production_ready: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/20",
  shipped: "bg-white/10 text-foreground ring-white/20",
  draft: "bg-white/5 text-muted-foreground ring-white/10",
  open: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  resolved: "bg-white/5 text-muted-foreground ring-white/10",
  critical: "bg-red-500/10 text-red-300 ring-red-500/20",
  high: "bg-orange-500/10 text-orange-300 ring-orange-500/20",
  medium: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  low: "bg-white/5 text-muted-foreground ring-white/10",
  production_candidate: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  poc_passed: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  ready_for_sdk: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/20",
  needs_more_data: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
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
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset",
        statusStyles[status] ?? "bg-white/5 text-muted-foreground ring-white/10",
        className
      )}
    >
      {label}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 85
      ? { ring: "ring-emerald-500/30", bg: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-300" }
      : score >= 70
        ? { ring: "ring-green-500/30", bg: "from-green-500/20 to-green-500/5", text: "text-green-300" }
        : score >= 50
          ? { ring: "ring-amber-500/30", bg: "from-amber-500/20 to-amber-500/5", text: "text-amber-300" }
          : { ring: "ring-white/10", bg: "from-white/10 to-white/5", text: "text-muted-foreground" };

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-mono text-sm font-semibold ring-1",
        tier.ring,
        tier.bg,
        tier.text
      )}
    >
      {score}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge status={priority} />;
}
