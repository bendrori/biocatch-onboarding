import { NextResponse } from "next/server";
import { getDashboardStats, runDailyPipeline, seedInitialData } from "@/lib/agents/orchestrator";
import { db } from "@/lib/db/store";

export const runtime = "nodejs";

export async function GET() {
  seedInitialData();
  const stats = getDashboardStats();
  const data = db.read();
  return NextResponse.json({
    stats,
    recentAgentRuns: data.agentRuns.slice(0, 5),
    auditLogs: data.auditLogs.slice(0, 10),
  });
}

export async function POST() {
  seedInitialData();
  const result = runDailyPipeline();
  const stats = getDashboardStats();
  return NextResponse.json({ ...result, stats });
}
