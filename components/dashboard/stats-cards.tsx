import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { Beaker, FileText, GitBranch, Lightbulb, Target, Users } from "lucide-react";

const statConfig: {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "documentsCollectedThisWeek", label: "Documents", icon: FileText },
  { key: "ideasGenerated", label: "Ideas", icon: Lightbulb },
  { key: "pocsCreated", label: "PoCs", icon: Beaker },
  { key: "validatedSignals", label: "Validated", icon: Target },
  { key: "productionCandidates", label: "Production", icon: GitBranch },
  { key: "customerRequestsCovered", label: "Customers", icon: Users },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-7 w-10" />
        </div>
      ))}
    </div>
  );
}
