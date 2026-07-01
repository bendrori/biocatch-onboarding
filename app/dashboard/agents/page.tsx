"use client";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Globe, Shield, Smartphone, Swords, Users, Wrench, FlaskConical, FileCheck, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
  { name: "Researcher Agent", role: "Reads documents and extracts detection opportunities", icon: Brain, status: "active", module: "Research Understanding" },
  { name: "Competitor Agent", role: "Tracks competitors and gap analysis", icon: Swords, status: "active", module: "Knowledge Collector" },
  { name: "Browser Agent", role: "Tracks browser changes and new APIs", icon: Globe, status: "active", module: "Knowledge Collector" },
  { name: "Mobile Agent", role: "Tracks iOS, Android, Flutter, RN, MAUI", icon: Smartphone, status: "planned", module: "Knowledge Collector" },
  { name: "Threat Agent", role: "Tracks automation frameworks, fraud tools, AI agents", icon: Shield, status: "active", module: "Correlation Engine" },
  { name: "Customer Agent", role: "Extracts repeated customer requests", icon: Users, status: "planned", module: "Knowledge Collector" },
  { name: "Innovation Agent", role: "Generates new signal ideas from topics", icon: Lightbulb, status: "active", module: "Innovation Agent" },
  { name: "PoC Agent", role: "Writes experimental JavaScript signal code", icon: Wrench, status: "active", module: "PoC Generator" },
  { name: "Validation Agent", role: "Runs Playwright vs browser tests", icon: FlaskConical, status: "active", module: "Validation Lab" },
  { name: "Production Agent", role: "Creates RFCs, Jira epics, and plans", icon: FileCheck, status: "active", module: "Production Readiness" },
];

export default function AgentTeamPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Autonomous Agent Team"
        icon={Bot}
        title="Agent Team"
        description="Specialized agents orchestrated through the daily research pipeline. Human approval gates control all write actions."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          const isActive = agent.status === "active";
          return (
            <div
              key={agent.name}
              className="glass-card-hover group p-5 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset transition-colors",
                    isActive
                      ? "bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300 ring-violet-500/20 group-hover:from-violet-500/30"
                      : "bg-white/[0.03] text-muted-foreground ring-white/[0.06]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    isActive && "bg-emerald-500/15 text-emerald-300 border-0"
                  )}
                >
                  {agent.status}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{agent.role}</p>
              <Badge variant="outline" className="mt-4 text-[10px] font-normal">
                {agent.module}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="glass-card border-dashed p-6">
        <h3 className="text-sm font-semibold">Human Approval Gates</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The system never pushes directly to production
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          {[
            "Before generating expensive PoCs",
            "Before running code on internal datasets",
            "Before creating Jira epics",
            "Before touching production repositories",
            "Before customer-facing documentation",
            "Before any production feature flag",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
