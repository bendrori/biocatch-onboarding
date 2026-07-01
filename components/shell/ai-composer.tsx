"use client";

import { useState } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

export function AIComposer() {
  const { composerExpanded, toggleComposer } = useUIStore();
  const [value, setValue] = useState("");

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        composerExpanded ? "pb-4 pt-3" : "py-2"
      )}
    >
      <div className="mx-auto max-w-3xl px-4">
        {!composerExpanded ? (
          <button
            type="button"
            onClick={toggleComposer}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground"
            aria-label="Open AI composer"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Ask SignalForge about signals, research, or run actions...</span>
            <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              /
            </kbd>
          </button>
        ) : (
          <div className="animate-slide-up space-y-2 rounded-lg border border-border bg-card p-3 shadow-sm">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about detection signals, research topics, or type / for commands..."
              className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              autoFocus
              aria-label="AI composer input"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Enter to send · Esc to minimize
                </span>
              </div>
              <Button
                size="icon"
                className="h-8 w-8"
                disabled={!value.trim()}
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
