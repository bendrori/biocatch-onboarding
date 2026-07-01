import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export const runtime = "nodejs";

export async function GET() {
  const data = db.read();
  return NextResponse.json(data.pocs);
}
