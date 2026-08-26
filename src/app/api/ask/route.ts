import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSession } from "@/lib/auth";
import { processQuery } from "@/lib/engine/orchestrator";

const bodySchema = z.object({ query: z.string().min(2).max(2000) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please describe your situation in a sentence." }, { status: 400 });
  }
  const session = await getOrCreateSession();
  const result = await processQuery(parsed.data.query, session);
  return NextResponse.json(result);
}
