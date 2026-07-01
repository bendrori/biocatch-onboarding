"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { Document, Insight } from "@/lib/types";
import { ExternalLink, Search } from "lucide-react";
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
      <div className="p-8">
        <ErrorState message={docsError} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Research Feed</h1>
        <p className="text-muted-foreground">
          Newly collected documents and extracted detection insights
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents and insights..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search research feed"
        />
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">
            Documents ({filteredDocs.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights ({filteredInsights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 mt-6">
          {docsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : filteredDocs.length === 0 ? (
            <EmptyState
              title="No documents collected"
              description="Run the daily pipeline to collect documents from GitHub, arXiv, Chrome Status, Playwright, and more."
              actionLabel="Run Pipeline"
              onAction={runPipeline}
            />
          ) : (
            filteredDocs.map((doc) => (
              <Card key={doc.id} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base leading-snug">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {doc.source} · {format(new Date(doc.publishedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <StatusBadge status={doc.sourceType === "external" ? "active" : "medium"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{doc.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
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
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-6">
          {insightsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : filteredInsights.length === 0 ? (
            <EmptyState
              title="No insights extracted"
              description="Insights are generated when the Research Understanding Agent analyzes collected documents."
              actionLabel="Run Pipeline"
              onAction={runPipeline}
            />
          ) : (
            filteredInsights.map((insight) => (
              <Card key={insight.id} className="rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <span className="font-mono text-sm text-muted-foreground">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <CardDescription className="capitalize">
                    {insight.type.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={insight.businessImpact} />
                    <StatusBadge status={insight.engineeringDifficulty} />
                    {insight.possibleSignals.map((s) => (
                      <Badge key={s} variant="outline" className="font-mono text-xs">
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
    </div>
  );
}
