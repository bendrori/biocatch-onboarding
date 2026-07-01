"use client";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { PipelineFlow } from "@/components/dashboard/pipeline-flow";
import { StatsCards, StatsCardsSkeleton } from "@/components/dashboard/stats-cards";
import { ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { AgentRun, DashboardStats } from "@/lib/types";
import { Activity, Shield } from "lucide-react";
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
      <PageShell>
        <ErrorState message={error} onRetry={refresh} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Internal R&D Platform"
        icon={Shield}
        title="Executive Overview"
        description="Autonomous detection innovation pipeline — from research collection to production-ready signals."
      />

      {loading || !data ? <StatsCardsSkeleton /> : <StatsCards stats={data.stats} />}

      <div className="glass-card p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Innovation Pipeline
        </p>
        <PipelineFlow />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card-hover border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-brand" />
              Pipeline Status
            </CardTitle>
            <CardDescription>Human-in-the-loop approval queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div>
                    <p className="text-sm font-medium">Pending approval</p>
                    <p className="text-xs text-muted-foreground">Awaiting researcher review</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="pending_review" />
                    <span className="font-mono text-2xl font-semibold tabular-nums">
                      {data.stats.pendingApprovals}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div>
                    <p className="text-sm font-medium">Active topics</p>
                    <p className="text-xs text-muted-foreground">Correlated research clusters</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="active" />
                    <span className="font-mono text-2xl font-semibold tabular-nums">
                      {data.stats.activeTopics}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card-hover border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Recent Agent Activity</CardTitle>
            <CardDescription>Autonomous pipeline executions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : data.recentAgentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pipeline runs yet. Launch the daily pipeline from the sidebar.
              </p>
            ) : (
              data.recentAgentRuns.map((run) => (
                <div
                  key={run.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2 transition-colors hover:border-white/[0.1]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{run.agent}</span>
                    <StatusBadge status={run.status === "completed" ? "active" : "pending_review"} />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{run.summary}</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card-hover border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
          <CardDescription>Approval gates and system actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] overflow-hidden">
              {data.auditLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 px-4 py-3 text-sm transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium capitalize text-foreground/90">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted-foreground truncate max-w-md text-xs">
                    {log.details}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
