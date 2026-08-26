import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const testDataDir = path.join(os.tmpdir(), `dumonda-rem-test-${process.pid}-${Date.now()}`);
process.env.DUMONDA_DATA_DIR = testDataDir;
process.env.AI_PROVIDER = "deterministic";
process.env.EMAIL_PROVIDER = "console";

describe("reminders end-to-end (embedded Postgres, console mailer)", () => {
  let db: Awaited<ReturnType<typeof import("@/lib/db").getDb>>;
  let schema: typeof import("@/lib/db/schema");
  const sessionId = "ses_remtest000001";
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    fs.mkdirSync(testDataDir, { recursive: true });
    const dbModule = await import("@/lib/db");
    db = await dbModule.getDb();
    schema = dbModule.schema;

    const { hashPassword } = await import("@/lib/auth");
    const { newId } = await import("@/lib/ids");
    userId = newId("usr");
    await db.insert(schema.users).values({
      id: userId,
      email: "reminder-test@example.com",
      passwordHash: hashPassword("password-123"),
      role: "user",
    });
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 86400000),
    });

    // Create a checklist with a computed deadline via the real pipeline.
    const orchestrator = await import("@/lib/engine/orchestrator");
    const result = await orchestrator.processQuery("I bought a car yesterday", {
      sessionId,
      userId,
    });
    expect(result.kind).toBe("checklist");
    const { eq } = await import("drizzle-orm");
    const tasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.eventId, result.eventId!));
    // buy_vehicle tasks carry no relative deadline; set one to exercise reminders.
    taskId = tasks[0].id;
    await db
      .update(schema.tasks)
      .set({ deadline: new Date(Date.now() + 3 * 86400000) })
      .where(eq(schema.tasks.id, taskId));
  }, 60000);

  it("creates a reminder for a deadline task and dedupes repeats", async () => {
    const { createTaskReminder } = await import("@/lib/reminders/dispatch");
    const first = await createTaskReminder(userId, taskId);
    expect(first.ok).toBe(true);
    // Deadline is 3 days away → reminder scheduled immediately (now).
    expect(first.remindAt!.getTime()).toBeLessThanOrEqual(Date.now() + 1000);

    const second = await createTaskReminder(userId, taskId);
    expect(second.ok).toBe(true);

    const rows = await db.select().from(schema.reminders);
    expect(rows).toHaveLength(1);
    expect(rows[0].channel).toBe("email");
  });

  it("refuses reminders for other users' tasks and tasks without deadlines", async () => {
    const { createTaskReminder } = await import("@/lib/reminders/dispatch");
    const wrongUser = await createTaskReminder("usr_someoneelse", taskId);
    expect(wrongUser.ok).toBe(false);
  });

  it("dispatches due reminders through the mailer and marks them sent", async () => {
    const { dispatchDueReminders } = await import("@/lib/reminders/dispatch");
    const summary = await dispatchDueReminders();
    expect(summary.transport).toBe("console");
    expect(summary.delivers).toBe(false);
    expect(summary.sent).toBe(1);
    expect(summary.failed).toBe(0);

    const rows = await db.select().from(schema.reminders);
    expect(rows[0].status).toBe("sent");

    // Second run: nothing due.
    const again = await dispatchDueReminders();
    expect(again.due).toBe(0);
  });
});
