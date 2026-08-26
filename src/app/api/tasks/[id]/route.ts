import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { track } from "@/lib/analytics";
import { getOrCreateSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

const bodySchema = z.object({
  status: z.enum(["todo", "in_progress", "completed", "not_applicable"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const session = await getOrCreateSession();
  const db = await getDb();
  const [row] = await db
    .select({
      taskId: schema.tasks.id,
      eventSession: schema.lifeEvents.sessionId,
      eventUser: schema.lifeEvents.userId,
      eventType: schema.lifeEvents.eventType,
    })
    .from(schema.tasks)
    .innerJoin(schema.lifeEvents, eq(schema.tasks.eventId, schema.lifeEvents.id))
    .where(eq(schema.tasks.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const owns =
    (row.eventUser && row.eventUser === session.userId) ||
    (row.eventSession && row.eventSession === session.sessionId);
  if (!owns) return NextResponse.json({ error: "Not authorised" }, { status: 403 });

  await db
    .update(schema.tasks)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(schema.tasks.id, id));

  if (parsed.data.status === "completed") {
    await track("task_completed", { eventType: row.eventType });
  }
  return NextResponse.json({ ok: true });
}
