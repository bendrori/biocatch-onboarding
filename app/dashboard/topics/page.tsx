"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { ResearchTopic } from "@/lib/types";
import { Building2, FileText, Network, Users } from "lucide-react";
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
      <PageShell>
        <ErrorState message={error} onRetry={refresh} />
      </PageShell>
    );
  }

  const topics = data?.topics ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Correlation Engine"
        icon={Network}
        title="Research Topics"
        description="Correlated findings grouped into actionable research opportunities with priority scoring."
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          title="No research topics yet"
          description="The Correlation Engine groups related documents when enough evidence converges."
          actionLabel="Run Pipeline"
          onAction={runPipeline}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic, i) => (
            <Card
              key={topic.id}
              className="glass-card-hover group border-0 bg-transparent shadow-none animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">{topic.title}</CardTitle>
                  <PriorityBadge priority={topic.priority} />
                </div>
                <CardDescription className="leading-relaxed">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {topic.relatedDocuments} docs
                  </span>
                  <StatusBadge status={topic.status} />
                </div>

                {topic.relatedCompanies.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Building2 className="h-3 w-3" /> Companies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.relatedCompanies.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[11px] font-normal">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {topic.relatedCustomers.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Users className="h-3 w-3" /> Customers
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.relatedCustomers.map((c) => (
                        <Badge key={c} variant="outline" className="text-[11px] font-normal">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground/70">
                  Updated {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
