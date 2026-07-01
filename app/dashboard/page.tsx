"use client";

import { StatsCards, StatsCardsSkeleton } from "@/components/dashboard/stats-cards";
import { ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { AgentRun, DashboardStats } from "@/lib/types";
import { Activity, ArrowRight, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PipelineResponse {
  stats: DashboardStats;
  recentAgentRuns: AgentRun[];
  auditLogs: { action: string; details: string; createdAt: string; actor: string }[];
}

export default function ExecutiveDashboard() {
  const { data, loading, error, refresh } = useRefreshableData<PipelineResponse>(
    async () => {
      const res = await fetch("/api/pipeline");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    }
  );

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Internal R&D Platform
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Executive View</h1>
        <p className="text-muted-foreground max-w-2xl">
          Autonomous detection innovation pipeline — from research collection to
          production-ready signals.
        </p>
      </header>

      {loading || !data ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards stats={data.stats} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pipeline Status
            </CardTitle>
            <CardDescription>
              Ideas moving through the innovation pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <span className="text-sm">Pending human approval</span>
                  <StatusBadge status="pending_review" />
                  <span className="font-mono font-semibold">
                    {data.stats.pendingApprovals}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <span className="text-sm">Active research topics</span>
                  <StatusBadge status="active" />
                  <span className="font-mono font-semibold">
                    {data.stats.activeTopics}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  Collected → Insight → Topic → Idea → PoC → Validation → RFC →
                  Shipped
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Recent Agent Activity</CardTitle>
            <CardDescription>Autonomous agent pipeline runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : data.recentAgentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pipeline runs yet. Click &quot;Run Daily Pipeline&quot; to start.
              </p>
            ) : (
              data.recentAgentRuns.map((run) => (
                <div
                  key={run.id}
                  className="rounded-lg border border-border p-4 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{run.agent}</span>
                    <StatusBadge status={run.status === "completed" ? "active" : "pending_review"} />
                  </div>
                  <p className="text-xs text-muted-foreground">{run.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Human approval gates and system actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-2">
              {data.auditLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent/50"
                >
                  <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground truncate max-w-md">{log.details}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
