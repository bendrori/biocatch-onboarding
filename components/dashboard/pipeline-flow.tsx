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
    <div className={cn("overflow-x-auto pb-1", className)}>
      <div className="flex min-w-max items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-1">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-white/10 hover:text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.05] font-mono text-[10px] text-foreground/70">
                {i + 1}
              </span>
              {stage}
            </div>
            {i < stages.length - 1 && (
              <div className="h-px w-3 bg-gradient-to-r from-white/10 to-white/5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
