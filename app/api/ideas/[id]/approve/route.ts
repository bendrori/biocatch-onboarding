import { NextRequest, NextResponse } from "next/server";
import { approveIdea } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const approvedBy = body.approvedBy ?? "researcher@biocatch.com";

  const success = approveIdea(id, approvedBy);
  if (!success) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, ideaId: id });
}
