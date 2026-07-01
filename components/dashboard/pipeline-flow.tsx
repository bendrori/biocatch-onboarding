import { cn } from "@/lib/utils";

const stages = [
  "Collected",
  "Insight",
  "Topic",
  "Idea",
  "PoC",
  "Validation",
  "RFC",
  "Shipped",
];

export function PipelineFlow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
            {stage}
          </span>
          {i < stages.length - 1 && (
            <span className="text-muted-foreground/40">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
