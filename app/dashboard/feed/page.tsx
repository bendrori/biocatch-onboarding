"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { SearchBar } from "@/components/dashboard/search-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { Document, Insight } from "@/lib/types";
import { usePipelineStore } from "@/store/pipeline-store";

export default function ResearchFeedPage() {
  const [search, setSearch] = useState("");
  const { runPipeline } = usePipelineStore();

  const { data: documents, loading: docsLoading, error: docsError, refresh } =
    useRefreshableData<Document[]>(async () => {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json();
    });

  const { data: insights, loading: insightsLoading } = useRefreshableData<Insight[]>(async () => {
    const res = await fetch("/api/insights");
    if (!res.ok) throw new Error("Failed to load insights");
    return res.json();
  });

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    const q = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q))
    );
  }, [documents, search]);

  const filteredInsights = useMemo(() => {
    if (!insights) return [];
    const q = search.toLowerCase();
    return insights.filter(
      (i) => i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    );
  }, [insights, search]);

  if (docsError) {
    return (
      <PageContent>
        <ErrorState message={docsError} onRetry={refresh} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Research"
        description="Collected documents and extracted detection insights."
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search research..." />

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({filteredInsights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-3">
          {docsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          ) : filteredDocs.length === 0 ? (
            <EmptyState
              title="No documents"
              description="Run the daily pipeline to collect from external sources."
              actionLabel="Run Pipeline"
              onAction={runPipeline}
            />
          ) : (
            filteredDocs.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-medium leading-snug">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {doc.source} · {format(new Date(doc.publishedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <StatusBadge status={doc.sourceType === "external" ? "active" : "medium"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{doc.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {doc.url.startsWith("http") && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-3">
          {insightsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : filteredInsights.length === 0 ? (
            <EmptyState title="No insights" description="Insights appear after the research agent processes documents." />
          ) : (
            filteredInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-medium">{insight.title}</CardTitle>
                    <span className="font-mono text-xs text-muted-foreground">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <CardDescription className="capitalize">{insight.type.replace(/_/g, " ")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={insight.businessImpact} />
                    <StatusBadge status={insight.engineeringDifficulty} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageContent>
  );
}
