"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  FileText,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Network,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    <aside className="relative flex h-screen w-[272px] shrink-0 flex-col border-r border-white/[0.06] glass-panel">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-80 blur-md" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Innovation Lab
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              SignalForge
            </p>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Agents ready</span>
          <Zap className="ml-auto h-3.5 w-3.5 text-brand/80" />
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-white/[0.06] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              {active && <span className="nav-active-indicator" />}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-brand" : "text-muted-foreground group-hover:text-foreground/80"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-4">
        <Button
          className="btn-glow h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 border-0"
          onClick={() => runPipeline()}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running pipeline...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Run Daily Pipeline
            </>
          )}
        </Button>
        <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Collect · Insight · Topic · Idea
        </p>
      </div>
    </aside>
  );
}
