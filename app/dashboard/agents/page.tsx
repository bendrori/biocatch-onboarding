"use client";

import { PageContent, PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileCheck,
  FlaskConical,
  Globe,
  Lightbulb,
  Shield,
  Smartphone,
  Swords,
  Users,
  Wrench,
} from "lucide-react";

const agents = [
  { name: "Researcher Agent", role: "Extracts detection opportunities from documents", icon: Brain, status: "active", module: "Research" },
  { name: "Competitor Agent", role: "Tracks competitors and gap analysis", icon: Swords, status: "active", module: "Collector" },
  { name: "Browser Agent", role: "Tracks browser changes and APIs", icon: Globe, status: "active", module: "Collector" },
  { name: "Mobile Agent", role: "Tracks iOS, Android, cross-platform SDKs", icon: Smartphone, status: "planned", module: "Collector" },
  { name: "Threat Agent", role: "Tracks automation, fraud tools, AI agents", icon: Shield, status: "active", module: "Correlation" },
  { name: "Customer Agent", role: "Extracts repeated customer requests", icon: Users, status: "planned", module: "Collector" },
  { name: "Innovation Agent", role: "Generates signal ideas from topics", icon: Lightbulb, status: "active", module: "Innovation" },
  { name: "PoC Agent", role: "Writes experimental signal code", icon: Wrench, status: "active", module: "PoC" },
  { name: "Validation Agent", role: "Runs Playwright vs browser tests", icon: FlaskConical, status: "active", module: "Validation" },
  { name: "Production Agent", role: "Creates RFCs and Jira epics", icon: FileCheck, status: "active", module: "Production" },
];

export default function AgentTeamPage() {
  return (
    <PageContent>
      <PageHeader
        title="Settings"
        description="Agent team configuration and human approval gates."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.name}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-[10px]">
                  {agent.status}
                </Badge>
              </div>
              <h3 className="mt-3 text-sm font-medium">{agent.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{agent.role}</p>
              <Badge variant="outline" className="mt-3 text-[10px] font-normal">
                {agent.module}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed border-border p-5">
        <h3 className="text-sm font-medium">Human approval gates</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The system never pushes directly to production.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Before generating PoCs",
            "Before running on internal datasets",
            "Before creating Jira epics",
            "Before production repositories",
            "Before customer documentation",
            "Before production feature flags",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageContent>
  );
}
