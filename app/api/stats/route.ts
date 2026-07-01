import { NextResponse } from "next/server";
import { getDashboardStats, seedInitialData } from "@/lib/agents/orchestrator";
import { db } from "@/lib/db/store";

export const runtime = "nodejs";

export async function GET() {
  seedInitialData();
  const stats = getDashboardStats();
  const data = db.read();

  const pipelineItems = data.signalIdeas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    stage: idea.pipelineStage,
    score: idea.score,
    status: idea.status,
    updatedAt: idea.approvedAt ?? idea.createdAt,
  }));

  return NextResponse.json({ stats, pipelineItems });
}
