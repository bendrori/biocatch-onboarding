"use client";

import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { ScoreBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useRefreshableData } from "@/hooks/use-refreshable-data";
import type { SignalIdea } from "@/lib/types";
import { Check, Code, FileText, FlaskConical, Lightbulb, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { usePipelineStore } from "@/store/pipeline-store";

export default function SignalIdeasPage() {
  const { runPipeline } = usePipelineStore();
  const [selectedIdea, setSelectedIdea] = useState<SignalIdea | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: ideas, loading, error, refresh } = useRefreshableData<SignalIdea[]>(
    async () => {
      const res = await fetch("/api/ideas");
      if (!res.ok) throw new Error("Failed to load ideas");
      return res.json();
    }
  );

  const handleApprove = async (idea: SignalIdea) => {
    setActionLoading(idea.id);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "researcher@biocatch.com" }),
      });
      if (!res.ok) throw new Error("Approval failed");
      toast({ title: "Idea approved", description: `"${idea.title}" ready for PoC generation.` });
      refresh();
      window.dispatchEvent(new CustomEvent("signalforge:refresh"));
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
      if (!res.ok) throw new Error("Rejection failed");
      toast({ title: "Idea rejected" });
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
      if (!res.ok) throw new Error("PoC generation failed");
      toast({ title: "PoC generated", description: "JavaScript signal code is ready in Validation Lab." });
      refresh();
      window.dispatchEvent(new CustomEvent("signalforge:refresh"));
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
      if (!res.ok) throw new Error("Validation failed");
      toast({ title: "Validation complete", description: "Results available in Validation Lab." });
      refresh();
      window.dispatchEvent(new CustomEvent("signalforge:refresh"));
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
      if (!res.ok) throw new Error("RFC generation failed");
      toast({ title: "RFC generated", description: "Production artifacts ready for review." });
      refresh();
      window.dispatchEvent(new CustomEvent("signalforge:refresh"));
    } catch {
      toast({ title: "RFC generation failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <PageShell>
        <ErrorState message={error} onRetry={refresh} />
      </PageShell>
    );
  }

  const sorted = [...(ideas ?? [])].sort((a, b) => b.score - a.score);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Innovation Agent"
        icon={Lightbulb}
        title="Signal Ideas"
        description="Ranked detection ideas with human approval gates before PoC generation."
      />

      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No signal ideas yet"
          description="The Innovation Agent generates ranked ideas from research topics and high-confidence insights."
          actionLabel="Run Pipeline"
          onAction={runPipeline}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Score</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((idea) => (
                <TableRow
                  key={idea.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedIdea(idea)}
                >
                  <TableCell>
                    <ScoreBadge score={idea.score} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium group-hover:text-foreground">{idea.title}</div>
                    <div className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {idea.signalType} · {idea.expectedValue} value
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {idea.platforms.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{idea.collectionLayer}</TableCell>
                  <TableCell>
                    <StatusBadge status={idea.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoading === idea.id}
                          aria-label="Idea actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {idea.status === "pending_review" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(idea)}>
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(idea)}>
                              <X className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {idea.status === "approved" && (
                          <DropdownMenuItem onClick={() => handleGeneratePoc(idea)}>
                            <Code className="mr-2 h-4 w-4" /> Generate PoC
                          </DropdownMenuItem>
                        )}
                        {(idea.status === "poc_in_progress" || idea.status === "approved") && (
                          <DropdownMenuItem onClick={() => handleRunValidation(idea)}>
                            <FlaskConical className="mr-2 h-4 w-4" /> Run Validation
                          </DropdownMenuItem>
                        )}
                        {(idea.status === "validated" || idea.status === "validating") && (
                          <DropdownMenuItem onClick={() => handleGenerateRfc(idea)}>
                            <FileText className="mr-2 h-4 w-4" /> Generate RFC
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <SheetContent className="w-full overflow-y-auto border-white/[0.08] bg-background/95 backdrop-blur-xl sm:max-w-xl">
          {selectedIdea && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedIdea.title}</SheetTitle>
                <SheetDescription>{selectedIdea.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selectedIdea.status} />
                  <StatusBadge status={selectedIdea.expectedValue} />
                  <StatusBadge status={selectedIdea.falsePositiveRisk} />
                  <Badge variant="outline">Score: {selectedIdea.score}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Required Data</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedIdea.requiredData.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Next Step</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedIdea.recommendedNextStep.replace(/_/g, " ")}
                  </p>
                </div>

                {selectedIdea.status === "pending_review" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 border-0 hover:from-violet-500 hover:to-violet-400"
                      onClick={() => handleApprove(selectedIdea)}
                      disabled={actionLoading === selectedIdea.id}
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve for PoC
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedIdea)}
                      disabled={actionLoading === selectedIdea.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
