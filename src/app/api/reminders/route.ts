import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createTaskReminder } from "@/lib/reminders/dispatch";

const bodySchema = z.object({ taskId: z.string().min(1).max(100) });

/** Creates an email reminder for a task with a computed deadline. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json(
      { error: "Sign in to set reminders — they are delivered to your account email." },
      { status: 401 },
    );
  }

  const result = await createTaskReminder(session.userId, parsed.data.taskId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, remindAt: result.remindAt?.toISOString() });
}
