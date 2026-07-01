import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export const runtime = "edge";



export async function GET() {
  const data = db.read();
  return NextResponse.json({
    topics: data.researchTopics,
    topicDocuments: data.topicDocuments,
  });
}
