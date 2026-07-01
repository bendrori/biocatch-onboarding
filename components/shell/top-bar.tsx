"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/store/ui-store";

const titles: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/feed": "Research",
  "/dashboard/ideas": "Signals",
  "/dashboard/catalog": "Signal Catalog",
  "/dashboard/validation": "Validation",
  "/dashboard/topics": "Knowledge Graph",
  "/dashboard/pipeline": "RFCs",
  "/dashboard/agents": "Settings",
};

function getTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  const match = Object.entries(titles).find(([path]) => pathname.startsWith(path) && path !== "/dashboard");
  return match?.[1] ?? "SignalForge";
}

export function TopBar() {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <h1 className="text-sm font-medium text-foreground">{getTitle(pathname)}</h1>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </Button>
    </header>
  );
}
