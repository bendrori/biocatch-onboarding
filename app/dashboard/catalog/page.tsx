"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { ScoreBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { computeIdeaScore } from "@/lib/scoring";
import { dispatchRefresh, useRefreshableData } from "@/hooks/use-refreshable-data";
import type { CatalogSignal, SignalCategory, SignalIdea } from "@/lib/types";

interface CatalogResponse {
  signals: CatalogSignal[];
  categoryOrder: SignalCategory[];
  categoryMeta: Record<SignalCategory, { label: string; description: string }>;
}

export default function SignalCatalogPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SignalCategory | "all">("all");
  const [pending, setPending] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);

  const {
    data: catalog,
    loading,
    error,
    refresh,
  } = useRefreshableData<CatalogResponse>(async () => {
    const res = await fetch("/api/catalog");
    if (!res.ok) throw new Error("Failed to load signal catalog");
    return res.json();
  });

  const { data: ideas } = useRefreshableData<SignalIdea[]>(async () => {
    const res = await fetch("/api/ideas");
    if (!res.ok) throw new Error("Failed to load ideas");
    return res.json();
  });

  const inPipeline = useMemo(
    () => new Set((ideas ?? []).map((i) => i.title)),
    [ideas]
  );

  const filtered = useMemo(() => {
    const signals = catalog?.signals ?? [];
    const q = query.trim().toLowerCase();
    return signals.filter((s) => {
      const matchCategory = activeCategory === "all" || s.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.matchKeywords.some((k) => k.includes(q)) ||
        s.signalType.includes(q)
      );
    });
  }, [catalog, query, activeCategory]);

  const grouped = useMemo(() => {
    const order = catalog?.categoryOrder ?? [];
    return order
      .map((category) => ({
        category,
        signals: filtered.filter((s) => s.category === category),
      }))
      .filter((g) => g.signals.length > 0);
  }, [catalog, filtered]);

  const addedCount = useMemo(
    () => (catalog?.signals ?? []).filter((s) => inPipeline.has(s.name)).length,
    [catalog, inPipeline]
  );

  const handleAddAll = async () => {
    setAddingAll(true);
    try {
      const res = await fetch("/api/catalog/generate", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({
        title: data.added > 0 ? "Signals added" : "Catalog already complete",
        description:
          data.added > 0
            ? `${data.added} new signals queued for review.`
            : "Every catalog signal is already in the pipeline.",
      });
      dispatchRefresh();
    } catch {
      toast({ title: "Failed to add signals", variant: "destructive" });
    } finally {
      setAddingAll(false);
    }
  };

  const handleAdd = async (signal: CatalogSignal) => {
    setPending(signal.id);
    try {
      const res = await fetch("/api/catalog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Added to pipeline", description: `"${signal.name}" queued for review.` });
      dispatchRefresh();
    } catch {
      toast({ title: "Failed to add signal", variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  if (error) {
    return (
      <PageContent>
        <ErrorState message={error} onRetry={refresh} />
      </PageContent>
    );
  }

  const total = catalog?.signals.length ?? 0;
  const categoryCount = catalog?.categoryOrder.length ?? 0;
  const remaining = total - addedCount;

  return (
    <PageContent>
      <PageHeader
        title="Signal Catalog"
        description="The full universe of detection signals BioCatch can collect — behavioral biometrics, device, network, automation, and fraud patterns — beyond agentic-session detection."
        action={
          <Button size="sm" onClick={handleAddAll} disabled={addingAll || loading || remaining === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            {remaining === 0 ? "All in pipeline" : `Add all${remaining ? ` (${remaining})` : ""}`}
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !catalog?.signals.length ? (
        <EmptyState title="No signals" description="The signal catalog is empty." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Signals" value={total} />
            <StatTile label="Categories" value={categoryCount} />
            <StatTile label="In pipeline" value={`${addedCount}/${total}`} />
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Search signals, keywords, or data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 max-w-sm"
              aria-label="Search signal catalog"
            />
            <div className="flex flex-wrap gap-1.5">
              <CategoryPill
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              >
                All
              </CategoryPill>
              {catalog.categoryOrder.map((cat) => (
                <CategoryPill
                  key={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                >
                  {catalog.categoryMeta[cat].label}
                </CategoryPill>
              ))}
            </div>
          </div>

          {grouped.length === 0 ? (
            <EmptyState
              title="No matching signals"
              description="Try a different search term or category."
            />
          ) : (
            <div className="space-y-10">
              {grouped.map(({ category, signals }) => (
                <section key={category} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold tracking-tight">
                        {catalog.categoryMeta[category].label}
                      </h3>
                      <span className="text-xs text-muted-foreground">{signals.length}</span>
                    </div>
                    <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                      {catalog.categoryMeta[category].description}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {signals.map((signal) => (
                      <SignalCard
                        key={signal.id}
                        signal={signal}
                        added={inPipeline.has(signal.name)}
                        pending={pending === signal.id}
                        onAdd={() => handleAdd(signal)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </PageContent>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SignalCard({
  signal,
  added,
  pending,
  onAdd,
}: {
  signal: CatalogSignal;
  added: boolean;
  pending: boolean;
  onAdd: () => void;
}) {
  const score = computeIdeaScore(signal.scores);
  return (
    <Card className="flex flex-col transition-colors hover:border-foreground/20">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{signal.name}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {signal.description}
        </p>
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={signal.expectedValue} />
          <Badge variant="secondary" className="text-[10px] font-normal capitalize">
            {signal.signalType.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            {signal.collectionLayer}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {signal.platforms.map((p) => (
            <Badge key={p} variant="secondary" className="text-[10px] font-normal">
              {p}
            </Badge>
          ))}
        </div>
        {added ? (
          <Button size="sm" variant="outline" className="w-full" disabled>
            <Check className="mr-2 h-4 w-4" /> In pipeline
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={onAdd} disabled={pending}>
            <Plus className="mr-2 h-4 w-4" /> {pending ? "Adding..." : "Add to pipeline"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
