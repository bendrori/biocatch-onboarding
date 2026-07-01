"use client";

import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { PipelineFlow } from "@/components/dashboard/pipeline-flow";
import { StatsCards, StatsCardsSkeleton } from "@/components/dashboard/stats-cards";
import { ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { AgentRun, DashboardStats } from "@/lib/types";
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
      <PageContent>
        <ErrorState message={error} onRetry={refresh} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Overview"
        description="Autonomous detection innovation pipeline — from research collection to production-ready signals."
      />

      {loading || !data ? <StatsCardsSkeleton /> : <StatsCards stats={data.stats} />}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>Research to production flow</CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineFlow />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>Items awaiting human review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <span className="text-sm">Pending approval</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="pending_review" />
                    <span className="font-mono text-sm font-medium">{data.stats.pendingApprovals}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <span className="text-sm">Active topics</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="active" />
                    <span className="font-mono text-sm font-medium">{data.stats.activeTopics}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Pipeline executions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading || !data ? (
              <Skeleton className="h-20 w-full" />
            ) : data.recentAgentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet. Use Run Pipeline in the sidebar.</p>
            ) : (
              data.recentAgentRuns.slice(0, 4).map((run) => (
                <div key={run.id} className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{run.agent}</span>
                    <StatusBadge status={run.status === "completed" ? "active" : "pending_review"} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{run.summary}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>System actions and approval gates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="divide-y divide-border rounded-md border border-border">
              {data.auditLogs.map((log, i) => (
                <div key={i} className="flex flex-col gap-1 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-md">{log.details}</span>
                  <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
