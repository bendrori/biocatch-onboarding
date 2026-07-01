"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Beaker,
  Brain,
  FileText,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Network,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePipelineStore } from "@/store/pipeline-store";

const navItems = [
  { href: "/dashboard", label: "Executive", icon: LayoutDashboard },
  { href: "/dashboard/feed", label: "Research Feed", icon: FileText },
  { href: "/dashboard/topics", label: "Research Topics", icon: Network },
  { href: "/dashboard/ideas", label: "Signal Ideas", icon: Lightbulb },
  { href: "/dashboard/validation", label: "Validation Lab", icon: FlaskConical },
  { href: "/dashboard/pipeline", label: "Production Pipeline", icon: GitBranch },
  { href: "/dashboard/agents", label: "Agent Team", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const { runPipeline, isRunning } = usePipelineStore();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Innovation Lab</p>
          <p className="text-xs text-muted-foreground">SignalForge</p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <Button
          className="w-full gap-2"
          onClick={() => runPipeline()}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Activity className="h-4 w-4 animate-pulse" />
              Running pipeline...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Daily Pipeline
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Collect → Insight → Topic → Idea
        </p>
      </div>
    </aside>
  );
}
