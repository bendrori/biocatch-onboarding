import { NextRequest, NextResponse } from "next/server";
import { rejectIdea } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const rejectedBy = body.rejectedBy ?? "researcher@biocatch.com";

  const success = rejectIdea(id, rejectedBy);
  if (!success) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, ideaId: id });
}
