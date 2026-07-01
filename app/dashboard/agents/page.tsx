"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Brain,
  Globe,
  Shield,
  Smartphone,
  Swords,
  Users,
  Wrench,
  FlaskConical,
  FileCheck,
  Lightbulb,
} from "lucide-react";

const agents = [
  {
    name: "Researcher Agent",
    role: "Reads documents and extracts detection opportunities",
    icon: Brain,
    status: "active",
    module: "Research Understanding",
  },
  {
    name: "Competitor Agent",
    role: "Tracks competitors and gap analysis",
    icon: Swords,
    status: "active",
    module: "Knowledge Collector",
  },
  {
    name: "Browser Agent",
    role: "Tracks browser changes and new APIs",
    icon: Globe,
    status: "active",
    module: "Knowledge Collector",
  },
  {
    name: "Mobile Agent",
    role: "Tracks iOS, Android, Flutter, RN, MAUI changes",
    icon: Smartphone,
    status: "planned",
    module: "Knowledge Collector",
  },
  {
    name: "Threat Agent",
    role: "Tracks automation frameworks, fraud tools, AI agents",
    icon: Shield,
    status: "active",
    module: "Correlation Engine",
  },
  {
    name: "Customer Agent",
    role: "Extracts repeated customer requests from internal sources",
    icon: Users,
    status: "planned",
    module: "Knowledge Collector",
  },
  {
    name: "Innovation Agent",
    role: "Generates new signal ideas from research topics",
    icon: Lightbulb,
    status: "active",
    module: "Innovation Agent",
  },
  {
    name: "PoC Agent",
    role: "Writes experimental JavaScript signal code",
    icon: Wrench,
    status: "active",
    module: "PoC Generator",
  },
  {
    name: "Validation Agent",
    role: "Runs Playwright vs browser tests and scores results",
    icon: FlaskConical,
    status: "active",
    module: "Validation Lab",
  },
  {
    name: "Production Agent",
    role: "Creates RFCs, Jira epics, and implementation plans",
    icon: FileCheck,
    status: "active",
    module: "Production Readiness",
  },
];

export default function AgentTeamPage() {
  return (
    <div className="space-y-6 p-8 animate-fade-in-up">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          Autonomous Agent Team
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Team</h1>
        <p className="text-muted-foreground max-w-2xl">
          Specialized agents orchestrated through the daily research pipeline.
          Human approval gates control all write actions.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card key={agent.name} className="rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge
                    variant={agent.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {agent.status}
                  </Badge>
                </div>
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <CardDescription>{agent.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">
                  {agent.module}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-xl border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Human Approval Gates</CardTitle>
          <CardDescription>
            The system never pushes directly to production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Before generating expensive PoCs</li>
            <li>• Before running code on internal datasets</li>
            <li>• Before creating Jira epics</li>
            <li>• Before touching production repositories</li>
            <li>• Before customer-facing documentation</li>
            <li>• Before any production feature flag</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
