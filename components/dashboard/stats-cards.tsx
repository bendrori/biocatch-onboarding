import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/types";
import {
  Beaker,
  FileText,
  GitBranch,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statConfig = [
  {
    key: "documentsCollectedThisWeek" as const,
    label: "Documents This Week",
    icon: FileText,
  },
  {
    key: "ideasGenerated" as const,
    label: "Ideas Generated",
    icon: Lightbulb,
  },
  { key: "pocsCreated" as const, label: "PoCs Created", icon: Beaker },
  {
    key: "validatedSignals" as const,
    label: "Validated Signals",
    icon: Target,
  },
  {
    key: "productionCandidates" as const,
    label: "Production Candidates",
    icon: GitBranch,
  },
  {
    key: "customerRequestsCovered" as const,
    label: "Customer Requests",
    icon: Users,
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <Card key={key} className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
