"use client";

import { formatDistanceToNow } from "date-fns";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { ResearchTopic } from "@/lib/types";
import { usePipelineStore } from "@/store/pipeline-store";

export default function ResearchTopicsPage() {
  const { runPipeline } = usePipelineStore();
  const { data, loading, error, refresh } = useRefreshableData<{ topics: ResearchTopic[] }>(
    async () => {
      const res = await fetch("/api/topics");
      if (!res.ok) throw new Error("Failed to load topics");
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

  const topics = data?.topics ?? [];

  return (
    <PageContent>
      <PageHeader
        title="Knowledge Graph"
        description="Correlated findings grouped into actionable research topics."
      />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          title="No topics"
          description="Topics form when the correlation engine finds converging evidence."
          actionLabel="Run Pipeline"
          onAction={runPipeline}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-medium leading-snug">{topic.title}</CardTitle>
                  <PriorityBadge priority={topic.priority} />
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{topic.relatedDocuments} documents</span>
                  <StatusBadge status={topic.status} />
                </div>
                {topic.relatedCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {topic.relatedCompanies.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px] font-normal">
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContent>
  );
}
