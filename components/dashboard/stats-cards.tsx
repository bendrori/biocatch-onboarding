import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Beaker,
  FileText,
  GitBranch,
  Lightbulb,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statConfig: {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  glow: string;
  iconBg: string;
}[] = [
  {
    key: "documentsCollectedThisWeek",
    label: "Documents",
    icon: FileText,
    glow: "bg-violet-500/20",
    iconBg: "from-violet-500/20 to-violet-500/5 text-violet-300",
  },
  {
    key: "ideasGenerated",
    label: "Ideas",
    icon: Lightbulb,
    glow: "bg-amber-500/15",
    iconBg: "from-amber-500/20 to-amber-500/5 text-amber-300",
  },
  {
    key: "pocsCreated",
    label: "PoCs",
    icon: Beaker,
    glow: "bg-cyan-500/15",
    iconBg: "from-cyan-500/20 to-cyan-500/5 text-cyan-300",
  },
  {
    key: "validatedSignals",
    label: "Validated",
    icon: Target,
    glow: "bg-emerald-500/15",
    iconBg: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
  },
  {
    key: "productionCandidates",
    label: "Production",
    icon: GitBranch,
    glow: "bg-fuchsia-500/15",
    iconBg: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300",
  },
  {
    key: "customerRequestsCovered",
    label: "Customers",
    icon: Users,
    glow: "bg-blue-500/15",
    iconBg: "from-blue-500/20 to-blue-500/5 text-blue-300",
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  glow,
  iconBg,
  delay,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  glow: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <div
      className="glass-card-hover group relative overflow-hidden p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      <div className={cn("stat-glow opacity-60 transition-opacity group-hover:opacity-100", glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/[0.06]",
            iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statConfig.map(({ key, label, icon, glow, iconBg }, i) => (
        <StatCard
          key={key}
          label={label}
          value={stats[key]}
          icon={icon}
          glow={glow}
          iconBg={iconBg}
          delay={Math.min(i + 1, 6)}
        />
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-8 w-14" />
        </div>
      ))}
    </div>
  );
}
