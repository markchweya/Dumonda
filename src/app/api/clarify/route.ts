import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getOrCreateSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { submitClarifications } from "@/lib/engine/orchestrator";

const bodySchema = z.object({
  eventId: z.string().min(1),
  answers: z.record(z.string(), z.string().max(200)),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = await getOrCreateSession();
  const db = await getDb();
  const [event] = await db
    .select({ id: schema.lifeEvents.id, sessionId: schema.lifeEvents.sessionId, userId: schema.lifeEvents.userId })
    .from(schema.lifeEvents)
    .where(eq(schema.lifeEvents.id, parsed.data.eventId))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const owns =
    (event.userId && event.userId === session.userId) ||
    (event.sessionId && event.sessionId === session.sessionId);
  if (!owns) return NextResponse.json({ error: "Not authorised" }, { status: 403 });

  const result = await submitClarifications(parsed.data.eventId, parsed.data.answers);
  return NextResponse.json(result);
}
