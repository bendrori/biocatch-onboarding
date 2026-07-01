"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { ScoreBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { PipelineStage, ProductionArtifact, SignalIdea } from "@/lib/types";
import { Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STAGES: PipelineStage[] = [
  "collected",
  "insight",
  "topic",
  "idea",
  "poc",
  "validation",
  "rfc",
  "jira",
  "shipped",
];

export default function ProductionPipelinePage() {
  const [viewArtifact, setViewArtifact] = useState<ProductionArtifact | null>(null);

  const { data, loading, error, refresh } = useRefreshableData<{
    pipelineItems: (SignalIdea & { updatedAt: string })[];
  }>(async () => {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Failed to load pipeline");
    return res.json();
  });

  const { data: artifacts } = useRefreshableData<ProductionArtifact[]>(async () => {
    const res = await fetch("/api/artifacts");
    if (!res.ok) throw new Error("Failed to load artifacts");
    return res.json();
  });

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  const items = data?.pipelineItems ?? [];

  const byStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = items.filter((i) => i.pipelineStage === stage);
      return acc;
    },
    {} as Record<PipelineStage, typeof items>
  );

  return (
    <div className="space-y-6 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Production Pipeline</h1>
        <p className="text-muted-foreground">
          Ideas moving from research to production readiness
        </p>
      </header>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Pipeline is empty"
          description="Run the daily pipeline to collect research and generate signal ideas."
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <div key={stage} className="w-64 shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium capitalize">
                    {stage.replace(/_/g, " ")}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {byStage[stage].length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[200px] rounded-xl border border-border bg-card/50 p-3">
                  {byStage[stage].map((item) => (
                    <Card key={item.id} className="rounded-lg shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-medium leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between">
                          {item.score !== undefined && (
                            <ScoreBadge score={item.score} />
                          )}
                          <StatusBadge status={item.status} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Production Artifacts</CardTitle>
          <CardDescription>RFCs, Jira epics, and implementation plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!artifacts?.length ? (
            <p className="text-sm text-muted-foreground">
              No artifacts yet. Generate an RFC after validation passes.
            </p>
          ) : (
            artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border border-border p-4",
                  "hover:bg-accent/50 cursor-pointer transition-colors"
                )}
                onClick={() => setViewArtifact(artifact)}
              >
                <div>
                  <p className="font-medium text-sm">{artifact.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {artifact.artifactType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={artifact.status} />
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewArtifact} onOpenChange={() => setViewArtifact(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{viewArtifact?.title}</DialogTitle>
            <DialogDescription>
              {viewArtifact?.artifactType.replace(/_/g, " ")} · Pending human approval
            </DialogDescription>
          </DialogHeader>
          {viewArtifact && (
            <ScrollArea className="h-[500px] rounded-lg border border-border">
              <pre className="p-4 text-xs whitespace-pre-wrap font-mono">
                {viewArtifact.content}
              </pre>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
