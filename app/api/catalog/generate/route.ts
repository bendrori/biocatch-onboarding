import { NextResponse } from "next/server";
import {
  generateAllCatalogSignals,
  generateCatalogSignal,
} from "@/lib/agents/orchestrator";

export const runtime = "edge";



export async function POST(request: Request) {
  let signalId: string | undefined;
  try {
    const body = await request.json();
    signalId = typeof body?.signalId === "string" ? body.signalId : undefined;
  } catch {
    signalId = undefined;
  }

  if (signalId) {
    const result = generateCatalogSignal(signalId);
    if (!result) {
      return NextResponse.json({ error: "Unknown signal" }, { status: 404 });
    }
    return NextResponse.json({ added: 1, ideaId: result.ideaId });
  }

  const result = generateAllCatalogSignals();
  return NextResponse.json(result);
}
