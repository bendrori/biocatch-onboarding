import { AlertCircle, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card flex flex-col items-center justify-center px-6 py-20 text-center",
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-brand/20 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          className="mt-8 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 border-0"
          onClick={onAction}
        >
          <Sparkles className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center ring-1 ring-red-500/20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6 rounded-xl" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
