"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { SearchBar } from "@/components/dashboard/search-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { Document, Insight } from "@/lib/types";
import { ExternalLink, Rss } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
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

  const { data: insights, loading: insightsLoading } = useRefreshableData<Insight[]>(
    async () => {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    }
  );

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
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
    );
  }, [insights, search]);

  if (docsError) {
    return (
      <PageShell>
        <ErrorState message={docsError} onRetry={refresh} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Knowledge Collector"
        icon={Rss}
        title="Research Feed"
        description="Newly collected documents and extracted detection insights from external and internal sources."
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents and insights..."
      />

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({filteredInsights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {docsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))
          ) : filteredDocs.length === 0 ? (
            <EmptyState
              title="No documents collected"
              description="Run the daily pipeline to collect from GitHub, arXiv, Chrome Status, Playwright, and more."
              actionLabel="Run Pipeline"
              onAction={runPipeline}
            />
          ) : (
            filteredDocs.map((doc, i) => (
              <Card
                key={doc.id}
                className="glass-card-hover group border-0 bg-transparent shadow-none animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-base font-semibold leading-snug group-hover:text-foreground">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-foreground/70">{doc.source}</span>
                        <span className="text-muted-foreground/50">·</span>
                        {format(new Date(doc.publishedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <StatusBadge status={doc.sourceType === "external" ? "active" : "medium"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{doc.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {doc.url.startsWith("http") && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand/80 transition-colors hover:text-brand"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insightsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))
          ) : filteredInsights.length === 0 ? (
            <EmptyState
              title="No insights extracted"
              description="The Research Agent analyzes collected documents for detection opportunities."
              actionLabel="Run Pipeline"
              onAction={runPipeline}
            />
          ) : (
            filteredInsights.map((insight) => (
              <Card key={insight.id} className="glass-card-hover border-0 bg-transparent shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-brand/10 px-2 font-mono text-xs font-semibold text-brand">
                      {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <CardDescription className="capitalize">
                    {insight.type.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={insight.businessImpact} />
                    <StatusBadge status={insight.engineeringDifficulty} />
                    {insight.possibleSignals.map((s) => (
                      <Badge key={s} variant="outline" className="font-mono text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
