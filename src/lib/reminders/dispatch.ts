import { and, eq, lte } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getMailer } from "@/lib/email/mailer";
import { formatDate } from "@/lib/deadlines";

export interface DispatchSummary {
  due: number;
  sent: number;
  failed: number;
  transport: string;
  delivers: boolean;
}

/**
 * Sends every due reminder through the configured mail transport and marks it
 * sent. Failed sends stay scheduled and are retried on the next run. Called by
 * /api/cron/reminders or npm run cron:reminders.
 */
export async function dispatchDueReminders(now: Date = new Date()): Promise<DispatchSummary> {
  const db = await getDb();
  const mailer = getMailer();

  const due = await db
    .select({
      id: schema.reminders.id,
      message: schema.reminders.message,
      remindAt: schema.reminders.remindAt,
      email: schema.users.email,
    })
    .from(schema.reminders)
    .innerJoin(schema.users, eq(schema.reminders.userId, schema.users.id))
    .where(
      and(eq(schema.reminders.status, "scheduled"), lte(schema.reminders.remindAt, now)),
    );

  const summary: DispatchSummary = {
    due: due.length,
    sent: 0,
    failed: 0,
    transport: mailer.name,
    delivers: mailer.delivers,
  };

  for (const reminder of due) {
    const result = await mailer.send({
      to: reminder.email,
      subject: "Dumonda reminder",
      text:
        `${reminder.message}\n\n` +
        `Open your dashboard for details and sources. ` +
        `You can manage reminders from the task itself.\n\n— Dumonda`,
    });
    if (result.ok) {
      await db
        .update(schema.reminders)
        .set({ status: "sent" })
        .where(eq(schema.reminders.id, reminder.id));
      summary.sent++;
    } else {
      summary.failed++;
    }
  }

  return summary;
}

/**
 * Creates a reminder for a task with a computed deadline: 7 days before the
 * deadline, or now if the deadline is closer than that. Duplicate requests
 * for the same task+user are collapsed into the existing scheduled reminder.
 */
export async function createTaskReminder(
  userId: string,
  taskId: string,
): Promise<{ ok: boolean; error?: string; remindAt?: Date }> {
  const db = await getDb();
  const { newId } = await import("@/lib/ids");

  const [task] = await db
    .select({
      id: schema.tasks.id,
      title: schema.tasks.title,
      deadline: schema.tasks.deadline,
      eventId: schema.tasks.eventId,
      eventTitle: schema.lifeEvents.title,
      eventUser: schema.lifeEvents.userId,
    })
    .from(schema.tasks)
    .innerJoin(schema.lifeEvents, eq(schema.tasks.eventId, schema.lifeEvents.id))
    .where(eq(schema.tasks.id, taskId))
    .limit(1);

  if (!task) return { ok: false, error: "Task not found" };
  if (task.eventUser !== userId) return { ok: false, error: "Not authorised" };
  if (!task.deadline) {
    return { ok: false, error: "This task has no computed deadline to remind about." };
  }

  const [existing] = await db
    .select({ id: schema.reminders.id, remindAt: schema.reminders.remindAt })
    .from(schema.reminders)
    .where(
      and(
        eq(schema.reminders.userId, userId),
        eq(schema.reminders.taskId, taskId),
        eq(schema.reminders.status, "scheduled"),
      ),
    )
    .limit(1);
  if (existing) return { ok: true, remindAt: existing.remindAt };

  const sevenDaysBefore = new Date(task.deadline.getTime() - 7 * 86400000);
  const remindAt = sevenDaysBefore > new Date() ? sevenDaysBefore : new Date();

  await db.insert(schema.reminders).values({
    id: newId("rem"),
    userId,
    taskId,
    eventId: task.eventId,
    remindAt,
    channel: "email",
    message: `"${task.title}" (${task.eventTitle}) is due on ${formatDate(task.deadline)}.`,
    status: "scheduled",
  });

  return { ok: true, remindAt };
}
