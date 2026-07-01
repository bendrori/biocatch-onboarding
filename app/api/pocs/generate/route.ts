import { NextRequest, NextResponse } from "next/server";
import { generatePocForIdea } from "@/lib/agents/orchestrator";
import { db } from "@/lib/db/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ideaId } = body;

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId required" }, { status: 400 });
  }

  const result = generatePocForIdea(ideaId);
  if (!result) {
    return NextResponse.json(
      { error: "Idea not found or not approved" },
      { status: 400 }
    );
  }

  const poc = db.read().pocs.find((p) => p.id === result.pocId);
  return NextResponse.json({ success: true, poc });
}
