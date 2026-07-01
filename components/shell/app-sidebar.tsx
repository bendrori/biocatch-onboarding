"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beaker,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  GitBranch,
  Home,
  Library,
  Lightbulb,
  Loader2,
  Network,
  Play,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";
import { usePipelineStore } from "@/store/pipeline-store";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/feed", label: "Research", icon: FileText },
  { href: "/dashboard/ideas", label: "Signals", icon: Lightbulb },
  { href: "/dashboard/catalog", label: "Signal Catalog", icon: Library },
  { href: "/dashboard/validation?tab=pocs", label: "Experiments", icon: Beaker },
  { href: "/dashboard/topics", label: "Knowledge Graph", icon: Network },
  { href: "/dashboard/validation?tab=results", label: "Validation", icon: FlaskConical },
  { href: "/dashboard/pipeline", label: "RFCs", icon: GitBranch },
  { href: "/dashboard/agents", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  if (base === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(base);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { runPipeline, isRunning } = usePipelineStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out",
          sidebarCollapsed ? "w-[52px]" : "w-[220px]"
        )}
      >
        <div
          className={cn(
            "flex h-12 items-center border-b border-border",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
          )}
        >
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 truncate">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
                F
              </div>
              <span className="text-sm font-medium truncate">SDK Foundry</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  sidebarCollapsed && "justify-center px-0"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>

        <div className="border-t border-border p-2">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-full"
                  onClick={() => runPipeline()}
                  disabled={isRunning}
                  aria-label="Run daily pipeline"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Run Daily Pipeline</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={() => runPipeline()}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run Pipeline
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
