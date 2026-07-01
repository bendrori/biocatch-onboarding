"use client";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { AIComposer } from "@/components/shell/ai-composer";
import { CommandPalette } from "@/components/shell/command-palette";
import { TopBar } from "@/components/shell/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <AIComposer />
      </div>
      <CommandPalette />
    </div>
  );
}
