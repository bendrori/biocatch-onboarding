"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Code, Eye } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { Poc, SignalIdea, ValidationRun } from "@/lib/types";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

export default function ValidationLabContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "pocs" ? "pocs" : "results";
  const [viewPoc, setViewPoc] = useState<Poc | null>(null);

  const { data: validations, loading: valLoading, error, refresh } =
    useRefreshableData<ValidationRun[]>(async () => {
      const res = await fetch("/api/validation");
      if (!res.ok) throw new Error("Failed to load validations");
      return res.json();
    });

  const { data: pocs, loading: pocLoading } = useRefreshableData<Poc[]>(async () => {
    const res = await fetch("/api/pocs");
    if (!res.ok) throw new Error("Failed to load PoCs");
    return res.json();
  });

  const { data: ideas } = useRefreshableData<SignalIdea[]>(async () => {
    const res = await fetch("/api/ideas");
    if (!res.ok) throw new Error("Failed to load ideas");
    return res.json();
  });

  const getIdeaTitle = (ideaId: string) =>
    ideas?.find((i) => i.id === ideaId)?.title ?? ideaId;

  if (error) {
    return (
      <PageContent>
        <ErrorState message={error} onRetry={refresh} />
      </PageContent>
    );
  }

  const loading = valLoading || pocLoading;

  return (
    <PageContent>
      <PageHeader
        title="Validation"
        description="PoC results and Playwright vs browser session metrics."
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="results">Results ({validations?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="pocs">PoCs ({pocs?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-3">
          {loading ? (
            <Skeleton className="h-36 w-full" />
          ) : !validations?.length ? (
            <EmptyState
              title="No validation runs"
              description="Approve a signal, generate a PoC, then run validation."
            />
          ) : (
            validations.map((v) => (
              <Card key={v.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-medium">{getIdeaTitle(v.ideaId)}</CardTitle>
                    <StatusBadge status={v.recommendation} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Metric label="Accuracy" value={`${(v.accuracy * 100).toFixed(1)}%`} />
                    <Metric label="FPR" value={`${(v.falsePositiveRate * 100).toFixed(1)}%`} />
                    <Metric label="FNR" value={`${(v.falseNegativeRate * 100).toFixed(1)}%`} />
                    <Metric label="Latency" value={`${v.latencyMs}ms`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pocs" className="space-y-3">
          {loading ? (
            <Skeleton className="h-28 w-full" />
          ) : !pocs?.length ? (
            <EmptyState title="No PoCs" description="Generate a PoC from an approved signal idea." />
          ) : (
            pocs.map((poc) => (
              <Card key={poc.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    {getIdeaTitle(poc.ideaId)}
                  </CardTitle>
                  <CardDescription>{poc.files.length} files · {poc.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {poc.files.map((f) => (
                      <Badge key={f.path} variant="outline" className="font-mono text-[10px]">
                        {f.path}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setViewPoc(poc)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View code
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewPoc} onOpenChange={() => setViewPoc(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>PoC Code</DialogTitle>
            <DialogDescription>Sandbox-generated signal code</DialogDescription>
          </DialogHeader>
          {viewPoc && (
            <Tabs defaultValue={viewPoc.files[0]?.path}>
              <TabsList className="h-auto flex-wrap">
                {viewPoc.files.map((f) => (
                  <TabsTrigger key={f.path} value={f.path} className="text-xs">
                    {f.path}
                  </TabsTrigger>
                ))}
              </TabsList>
              {viewPoc.files.map((f) => (
                <TabsContent key={f.path} value={f.path}>
                  <ScrollArea className="h-[360px] rounded-md border border-border bg-muted/30">
                    <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {f.content}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </PageContent>
  );
}
