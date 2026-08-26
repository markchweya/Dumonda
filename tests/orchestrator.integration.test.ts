import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

// Isolated embedded database for this test run.
const testDataDir = path.join(os.tmpdir(), `dumonda-test-${process.pid}-${Date.now()}`);
process.env.DUMONDA_DATA_DIR = testDataDir;
process.env.AI_PROVIDER = "deterministic";

describe("orchestrator end-to-end (embedded Postgres)", () => {
  let db: Awaited<ReturnType<typeof import("@/lib/db").getDb>>;
  let schema: typeof import("@/lib/db/schema");
  let orchestrator: typeof import("@/lib/engine/orchestrator");
  const sessionId = "ses_test000000001";

  beforeAll(async () => {
    fs.mkdirSync(testDataDir, { recursive: true });
    const dbModule = await import("@/lib/db");
    db = await dbModule.getDb(); // migrates + seeds automatically
    schema = dbModule.schema;
    orchestrator = await import("@/lib/engine/orchestrator");
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: null,
      expiresAt: new Date(Date.now() + 86400000),
    });
  }, 60000);

  it("asks only relevant clarifications for an intercantonal move", async () => {
    const result = await orchestrator.processQuery(
      "I moved from Zürich to Basel last weekend",
      { sessionId, userId: null },
    );
    expect(result.kind).toBe("clarify");
    expect(result.eventId).toBeTruthy();
    const asked = (result.questions ?? []).map((q) => q.fact);
    // Cantons and date were extracted from the sentence — must not be re-asked.
    expect(asked).not.toContain("canton");
    expect(asked).not.toContain("origin_canton");
    expect(asked).not.toContain("event_date");
    // Facts that change the plan are asked.
    expect(asked).toContain("nationality_category");
    expect(asked).toContain("has_vehicle");

    // Answering produces a checklist with rule-derived tasks.
    const answers: Record<string, string> = {};
    for (const fact of asked) answers[fact] = fact === "has_vehicle" ? "yes" : fact === "nationality_category" ? "eu_efta" : "yes";
    let next = await orchestrator.submitClarifications(result.eventId!, answers);
    // May ask one more round (e.g. children_school_age); answer until checklist.
    let guard = 0;
    while (next.kind === "clarify" && guard++ < 3) {
      const more: Record<string, string> = {};
      for (const q of next.questions ?? []) more[q.fact] = q.options?.[0]?.value ?? "yes";
      next = await orchestrator.submitClarifications(result.eventId!, more);
    }
    expect(next.kind).toBe("checklist");

    const { eq } = await import("drizzle-orm");
    const tasks = await db.select().from(schema.tasks).where(eq(schema.tasks.eventId, result.eventId!));
    expect(tasks.length).toBeGreaterThanOrEqual(5);

    const titles = tasks.map((t) => t.title);
    expect(titles).toContain("Register with your new municipality within 14 days");
    expect(titles).toContain("Re-register your vehicle in the new canton");
    expect(titles).toContain("Report the move to the migration authority");

    // Deadline was computed from the extracted event date.
    const register = tasks.find((t) => t.title.includes("Register with your new municipality"))!;
    expect(register.deadline).not.toBeNull();
    expect(register.priority).toBe("required");

    // Citation validation: every cited source id exists in the registry.
    const sources = await db.select({ id: schema.sources.id }).from(schema.sources);
    const valid = new Set(sources.map((s) => s.id));
    for (const t of tasks) for (const sid of t.sourceIds) expect(valid.has(sid)).toBe(true);

    // Citations were persisted.
    const citations = await db.select().from(schema.citations);
    expect(citations.length).toBeGreaterThan(0);
  });

  it("generates a checklist without clarification when nothing changes the answer", async () => {
    const result = await orchestrator.processQuery("I lost my SwissPass", {
      sessionId,
      userId: null,
    });
    expect(result.kind).toBe("checklist");
    const { eq } = await import("drizzle-orm");
    const tasks = await db.select().from(schema.tasks).where(eq(schema.tasks.eventId, result.eventId!));
    expect(tasks.some((t) => t.title.includes("Block your card"))).toBe(true);
  });

  it("records unrecognised queries honestly instead of guessing", async () => {
    const result = await orchestrator.processQuery("purple quantum sandwiches everywhere", {
      sessionId,
      userId: null,
    });
    expect(result.kind).toBe("unrecognised");
    expect(result.message).toContain("couldn't match");
  });
});
