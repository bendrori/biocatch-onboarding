"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageHeader, PageShell } from "@/components/dashboard/page-header";
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
import { Eye, GitBranch } from "lucide-react";
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
      <PageShell>
        <ErrorState message={error} onRetry={refresh} />
      </PageShell>
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
    <PageShell>
      <PageHeader
        eyebrow="Production Readiness"
        icon={GitBranch}
        title="Production Pipeline"
        description="Ideas moving from research to production readiness with human approval at every gate."
      />

      {loading ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Pipeline is empty"
          description="Run the daily pipeline to collect research and generate signal ideas."
        />
      ) : (
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-3 min-w-max">
            {STAGES.map((stage) => (
              <div key={stage} className="w-60 shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground capitalize">
                    {stage.replace(/_/g, " ")}
                  </h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-white/[0.06] px-1.5 font-mono text-[10px]">
                    {byStage[stage].length}
                  </span>
                </div>
                <div className="min-h-[220px] space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  {byStage[stage].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/[0.06] bg-card/50 p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <p className="text-xs font-medium leading-snug line-clamp-2">{item.title}</p>
                      <div className="mt-2.5 flex items-center justify-between">
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

      <div className="glass-card p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Production Artifacts</h3>
          <p className="text-sm text-muted-foreground">RFCs, Jira epics, and implementation plans</p>
        </div>
        {!artifacts?.length ? (
          <p className="text-sm text-muted-foreground">
            No artifacts yet. Generate an RFC after validation passes.
          </p>
        ) : (
          <div className="space-y-2">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                )}
                onClick={() => setViewArtifact(artifact)}
              >
                <div>
                  <p className="text-sm font-medium">{artifact.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {artifact.artifactType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={artifact.status} />
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!viewArtifact} onOpenChange={() => setViewArtifact(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl border-white/[0.08] bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{viewArtifact?.title}</DialogTitle>
            <DialogDescription>
              {viewArtifact?.artifactType.replace(/_/g, " ")} · Pending approval
            </DialogDescription>
          </DialogHeader>
          {viewArtifact && (
            <ScrollArea className="h-[500px] rounded-xl border border-white/[0.06] bg-black/40">
              <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {viewArtifact.content}
              </pre>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
