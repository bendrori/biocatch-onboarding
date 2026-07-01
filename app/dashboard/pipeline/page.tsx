"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { ScoreBadge, StatusBadge } from "@/components/dashboard/status-badge";
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

const STAGES: PipelineStage[] = [
  "collected", "insight", "topic", "idea", "poc", "validation", "rfc", "jira", "shipped",
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
      <PageContent>
        <ErrorState message={error} onRetry={refresh} />
      </PageContent>
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
    <PageContent>
      <PageHeader
        title="RFCs"
        description="Production pipeline and generated artifacts."
      />

      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : items.length === 0 ? (
        <EmptyState title="Pipeline empty" description="Run the pipeline to populate ideas." />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {STAGES.map((stage) => (
              <div key={stage} className="w-52 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {stage.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {byStage[stage].length}
                  </span>
                </div>
                <div className="min-h-[180px] space-y-2 rounded-md border border-border bg-muted/20 p-2">
                  {byStage[stage].map((item) => (
                    <div key={item.id} className="rounded-md border border-border bg-card p-2.5">
                      <p className="text-xs font-medium leading-snug line-clamp-2">{item.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {item.score !== undefined && <ScoreBadge score={item.score} />}
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium">Artifacts</h3>
          <p className="text-xs text-muted-foreground">RFCs, Jira epics, implementation plans</p>
        </div>
        <div className="p-4 space-y-2">
          {!artifacts?.length ? (
            <p className="text-sm text-muted-foreground">No artifacts yet.</p>
          ) : (
            artifacts.map((artifact) => (
              <button
                key={artifact.id}
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
                onClick={() => setViewArtifact(artifact)}
              >
                <div>
                  <p className="text-sm font-medium">{artifact.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {artifact.artifactType.replace(/_/g, " ")}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!viewArtifact} onOpenChange={() => setViewArtifact(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewArtifact?.title}</DialogTitle>
            <DialogDescription>Pending approval</DialogDescription>
          </DialogHeader>
          {viewArtifact && (
            <ScrollArea className="h-[420px] rounded-md border border-border bg-muted/30">
              <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {viewArtifact.content}
              </pre>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </PageContent>
  );
}
