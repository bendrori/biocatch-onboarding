import { NextRequest, NextResponse } from "next/server";
import { runValidationForIdea } from "@/lib/agents/orchestrator";
import { db } from "@/lib/db/store";

export const runtime = "edge";



export async function GET() {
  const data = db.read();
  return NextResponse.json(data.validationRuns);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ideaId } = body;

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId required" }, { status: 400 });
  }

  const result = runValidationForIdea(ideaId);
  if (!result) {
    return NextResponse.json(
      { error: "Idea or PoC not found" },
      { status: 400 }
    );
  }

  const validation = db.read().validationRuns.find((v) => v.id === result.validationId);
  return NextResponse.json({ success: true, validation });
}
