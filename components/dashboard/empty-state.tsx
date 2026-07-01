import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && (
          <Button className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" className="mt-6" onClick={onRetry}>
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
