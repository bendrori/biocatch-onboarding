"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { ResearchTopic } from "@/lib/types";
import { Building2, FileText, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePipelineStore } from "@/store/pipeline-store";

export default function ResearchTopicsPage() {
  const { runPipeline } = usePipelineStore();

  const { data, loading, error, refresh } = useRefreshableData<{
    topics: ResearchTopic[];
  }>(async () => {
    const res = await fetch("/api/topics");
    if (!res.ok) throw new Error("Failed to load topics");
    return res.json();
  });

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  const topics = data?.topics ?? [];

  return (
    <div className="space-y-6 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Research Topics</h1>
        <p className="text-muted-foreground">
          Correlated findings grouped into actionable research opportunities
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          title="No research topics yet"
          description="The Correlation Engine groups related documents into topics when enough evidence converges."
          actionLabel="Run Pipeline"
          onAction={runPipeline}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id} className="rounded-xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">{topic.title}</CardTitle>
                  <PriorityBadge priority={topic.priority} />
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {topic.relatedDocuments} documents
                  </span>
                  <StatusBadge status={topic.status} />
                </div>

                {topic.relatedCompanies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Related Companies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {topic.relatedCompanies.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {topic.relatedCustomers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Customer Requests
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {topic.relatedCustomers.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
