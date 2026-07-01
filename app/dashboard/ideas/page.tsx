"use client";

import { useState } from "react";
import { IdeasTable } from "@/components/data-table/ideas-table";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { SignalIdea } from "@/lib/types";
import { Check } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline-store";

export default function SignalIdeasPage() {
  const { runPipeline } = usePipelineStore();
  const [selectedIdea, setSelectedIdea] = useState<SignalIdea | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: ideas, loading, error, refresh } = useRefreshableData<SignalIdea[]>(async () => {
    const res = await fetch("/api/ideas");
    if (!res.ok) throw new Error("Failed to load ideas");
    return res.json();
  });

  const handleApprove = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "researcher@biocatch.com" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Approved", description: `"${idea.title}" ready for PoC.` });
      refresh();
      window.dispatchEvent(new CustomEvent("biocatch-sdk-foundry:refresh"));
    } catch {
      toast({ title: "Approval failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast({ title: "Rejected" });
      refresh();
    } catch {
      toast({ title: "Rejection failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePoc = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch("/api/pocs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "PoC generated" });
      refresh();
      window.dispatchEvent(new CustomEvent("biocatch-sdk-foundry:refresh"));
    } catch {
      toast({ title: "PoC generation failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunValidation = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Validation complete" });
      refresh();
      window.dispatchEvent(new CustomEvent("biocatch-sdk-foundry:refresh"));
    } catch {
      toast({ title: "Validation failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateRfc = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "RFC generated" });
      refresh();
      window.dispatchEvent(new CustomEvent("biocatch-sdk-foundry:refresh"));
    } catch {
      toast({ title: "RFC generation failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <PageContent>
        <ErrorState message={error} onRetry={refresh} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Signals"
        description="Ranked detection ideas. Approve before PoC generation."
      />

      {loading ? (
        <Skeleton className="h-80 w-full" />
      ) : !ideas?.length ? (
        <EmptyState
          title="No signal ideas"
          description="Run the pipeline to generate ideas from research."
          actionLabel="Run Pipeline"
          onAction={runPipeline}
        />
      ) : (
        <IdeasTable
          ideas={ideas}
          actionLoading={actionLoading}
          onSelect={setSelectedIdea}
          onApprove={handleApprove}
          onReject={handleReject}
          onGeneratePoc={handleGeneratePoc}
          onRunValidation={handleRunValidation}
          onGenerateRfc={handleGenerateRfc}
        />
      )}

      <Sheet open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedIdea && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{selectedIdea.title}</SheetTitle>
                <SheetDescription>{selectedIdea.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selectedIdea.status} />
                  <StatusBadge status={selectedIdea.expectedValue} />
                  <Badge variant="outline">Score {selectedIdea.score}</Badge>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Required data</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedIdea.requiredData.map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px] font-normal">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedIdea.status === "pending_review" && (
                  <Button size="sm" className="w-full" onClick={() => handleApprove(selectedIdea)}>
                    <Check className="mr-2 h-4 w-4" /> Approve for PoC
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageContent>
  );
}
