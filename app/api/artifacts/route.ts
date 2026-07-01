import { NextRequest, NextResponse } from "next/server";
import { generateRfcForIdea } from "@/lib/agents/orchestrator";
import { db } from "@/lib/db/store";

export const runtime = "edge";



export async function GET() {
  const data = db.read();
  return NextResponse.json(data.productionArtifacts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ideaId } = body;

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId required" }, { status: 400 });
  }

  const result = generateRfcForIdea(ideaId);
  if (!result) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const artifacts = db
    .read()
    .productionArtifacts.filter((a) => result.artifactIds.includes(a.id));

  return NextResponse.json({ success: true, artifacts });
}
