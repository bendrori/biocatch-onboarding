"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageHeader, PageShell } from "@/components/dashboard/page-header";
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
import { Code, Eye, FlaskConical } from "lucide-react";
import { useState } from "react";

export default function ValidationLabPage() {
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
      <PageShell>
        <ErrorState message={error} onRetry={refresh} />
      </PageShell>
    );
  }

  const loading = valLoading || pocLoading;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Validation Agent"
        icon={FlaskConical}
        title="Validation Lab"
        description="PoC results and Playwright vs browser session validation metrics."
      />

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results ({validations?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="pocs">PoCs ({pocs?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))
          ) : !validations?.length ? (
            <EmptyState
              title="No validation runs yet"
              description="Approve a signal idea, generate a PoC, then run validation to compare Playwright vs normal browser sessions."
            />
          ) : (
            validations.map((v) => (
              <Card key={v.id} className="glass-card-hover border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{getIdeaTitle(v.ideaId)}</CardTitle>
                      <CardDescription className="font-mono text-[11px]">{v.id}</CardDescription>
                    </div>
                    <StatusBadge status={v.recommendation} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric label="Accuracy" value={`${(v.accuracy * 100).toFixed(1)}%`} good />
                    <Metric label="False Positive" value={`${(v.falsePositiveRate * 100).toFixed(1)}%`} />
                    <Metric label="False Negative" value={`${(v.falseNegativeRate * 100).toFixed(1)}%`} />
                    <Metric label="Latency" value={`${v.latencyMs}ms`} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span>{v.sessionCounts.realBrowser} browser</span>
                    <span>{v.sessionCounts.playwright} Playwright</span>
                    <span>{v.sessionCounts.puppeteer} Puppeteer</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pocs" className="space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : !pocs?.length ? (
            <EmptyState
              title="No PoCs generated"
              description="Approve a signal idea, then generate a JavaScript PoC from the Signal Ideas page."
            />
          ) : (
            pocs.map((poc) => (
              <Card key={poc.id} className="glass-card-hover border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Code className="h-4 w-4 text-brand" />
                        {getIdeaTitle(poc.ideaId)}
                      </CardTitle>
                      <CardDescription>
                        {poc.type} · {poc.files.length} files
                      </CardDescription>
                    </div>
                    <StatusBadge status={poc.status === "ready" ? "active" : "pending_review"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{poc.instructions}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {poc.files.map((f) => (
                      <Badge key={f.path} variant="outline" className="font-mono text-[10px]">
                        {f.path}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setViewPoc(poc)}>
                    <Eye className="mr-2 h-4 w-4" /> View Code
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewPoc} onOpenChange={() => setViewPoc(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl border-white/[0.08] bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>PoC Code</DialogTitle>
            <DialogDescription>Sandbox-generated JavaScript signal</DialogDescription>
          </DialogHeader>
          {viewPoc && (
            <Tabs defaultValue={viewPoc.files[0]?.path}>
              <TabsList className="flex-wrap h-auto">
                {viewPoc.files.map((f) => (
                  <TabsTrigger key={f.path} value={f.path} className="text-xs">
                    {f.path}
                  </TabsTrigger>
                ))}
              </TabsList>
              {viewPoc.files.map((f) => (
                <TabsContent key={f.path} value={f.path}>
                  <ScrollArea className="h-[400px] rounded-xl border border-white/[0.06] bg-black/40">
                    <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">{f.content}</pre>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${good ? "text-emerald-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
