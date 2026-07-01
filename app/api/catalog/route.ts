import { NextResponse } from "next/server";
import { CATEGORY_META, CATEGORY_ORDER, SIGNAL_CATALOG } from "@/lib/agents/signal-catalog";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    signals: SIGNAL_CATALOG,
    categoryOrder: CATEGORY_ORDER,
    categoryMeta: CATEGORY_META,
  });
}
