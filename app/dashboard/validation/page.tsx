"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
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
import { Code, Eye } from "lucide-react";
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
      <div className="p-8">
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  const loading = valLoading || pocLoading;

  return (
    <div className="space-y-6 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Validation Lab</h1>
        <p className="text-muted-foreground">
          PoC results and Playwright vs browser session validation metrics
        </p>
      </header>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">
            Validation Results ({validations?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="pocs">
            Generated PoCs ({pocs?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4 mt-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          ) : !validations?.length ? (
            <EmptyState
              title="No validation runs yet"
              description="Approve a signal idea, generate a PoC, then run validation to compare Playwright vs normal browser sessions."
            />
          ) : (
            validations.map((v) => (
              <Card key={v.id} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">
                        {getIdeaTitle(v.ideaId)}
                      </CardTitle>
                      <CardDescription>Validation run · {v.id}</CardDescription>
                    </div>
                    <StatusBadge status={v.recommendation} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric label="Accuracy" value={`${(v.accuracy * 100).toFixed(1)}%`} />
                    <Metric label="False Positive Rate" value={`${(v.falsePositiveRate * 100).toFixed(1)}%`} />
                    <Metric label="False Negative Rate" value={`${(v.falseNegativeRate * 100).toFixed(1)}%`} />
                    <Metric label="Latency" value={`${v.latencyMs}ms`} />
                    <Metric label="Memory" value={`${v.memoryKb}KB`} />
                    <Metric label="CPU Impact" value={v.cpuImpact} />
                    <Metric label="Privacy Risk" value={v.privacyRisk} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{v.sessionCounts.realBrowser} real browser sessions</span>
                    <span>{v.sessionCounts.playwright} Playwright sessions</span>
                    <span>{v.sessionCounts.puppeteer} Puppeteer sessions</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pocs" className="space-y-4 mt-6">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : !pocs?.length ? (
            <EmptyState
              title="No PoCs generated"
              description="Approve a signal idea from the Signal Ideas page, then generate a JavaScript PoC."
            />
          ) : (
            pocs.map((poc) => (
              <Card key={poc.id} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code className="h-4 w-4" />
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
                  <div className="flex flex-wrap gap-2">
                    {poc.files.map((f) => (
                      <Badge key={f.path} variant="outline" className="font-mono text-xs">
                        {f.path}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setViewPoc(poc)}>
                    <Eye className="mr-2 h-4 w-4" /> View Code
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewPoc} onOpenChange={() => setViewPoc(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>PoC Code</DialogTitle>
            <DialogDescription>
              Sandbox-generated JavaScript signal code
            </DialogDescription>
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
                  <ScrollArea className="h-[400px] rounded-lg border border-border">
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                      {f.content}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold capitalize tabular-nums">{value}</p>
    </div>
  );
}
