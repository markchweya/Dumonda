import { describe, expect, it } from "vitest";
import { conditionSchema, ruleInputSchema, unknownSourceIds } from "@/lib/rules/schemas";
import { SEED_RULES } from "@/lib/db/seed-data";
import { CANTONAL_RULES } from "@/lib/db/seed-cantons";

describe("rule authoring validation", () => {
  it("accepts every seeded rule (schema and seeds stay in sync)", () => {
    for (const rule of [...SEED_RULES, ...CANTONAL_RULES]) {
      const result = ruleInputSchema.safeParse({
        eventType: rule.eventType,
        jurisdiction: rule.jurisdiction,
        conditions: rule.conditions,
        actions: rule.actions,
        notes: rule.notes ?? null,
      });
      expect(result.success, `${rule.id}: ${result.success ? "" : result.error.issues[0]?.message}`).toBe(true);
    }
  });

  it("rejects unknown fact names in conditions", () => {
    expect(conditionSchema.safeParse({ fact: "shoe_size", op: "eq", value: "44" }).success).toBe(false);
    expect(conditionSchema.safeParse({ fact: "has_vehicle", op: "eq", value: "yes" }).success).toBe(true);
  });

  it("rejects malformed jurisdictions and empty actions", () => {
    const base = {
      eventType: "move_between_cantons",
      conditions: { all: [] },
      actions: [
        {
          title: "Some task",
          description: "A long enough description here.",
          category: "test",
          priority: "required",
          sourceIds: [],
        },
      ],
    };
    expect(ruleInputSchema.safeParse({ ...base, jurisdiction: "DE" }).success).toBe(false);
    expect(ruleInputSchema.safeParse({ ...base, jurisdiction: "CH-zh" }).success).toBe(false);
    expect(ruleInputSchema.safeParse({ ...base, jurisdiction: "CH-ZH" }).success).toBe(true);
    expect(
      ruleInputSchema.safeParse({ ...base, jurisdiction: "CH", actions: [] }).success,
    ).toBe(false);
  });

  it("rejects invalid deadline specs", () => {
    const action = (deadline: unknown) => ({
      eventType: "move_between_cantons",
      jurisdiction: "CH",
      conditions: { all: [] },
      actions: [
        {
          title: "Some task",
          description: "A long enough description here.",
          category: "test",
          priority: "required",
          sourceIds: [],
          deadline,
        },
      ],
    });
    expect(ruleInputSchema.safeParse(action({ type: "relative", amount: -3, unit: "days", anchor: "event_date", label: "x" })).success).toBe(false);
    expect(ruleInputSchema.safeParse(action({ type: "fixed", date: "not-a-date", label: "x" })).success).toBe(false);
    expect(ruleInputSchema.safeParse(action({ type: "unknown", label: "On your document" })).success).toBe(true);
  });

  it("flags source ids that are not in the registry", () => {
    const input = ruleInputSchema.parse({
      eventType: "move_between_cantons",
      jurisdiction: "CH",
      conditions: { all: [] },
      actions: [
        {
          title: "Some task",
          description: "A long enough description here.",
          category: "test",
          priority: "required",
          sourceIds: ["src_real", "src_ghost"],
        },
      ],
    });
    expect(unknownSourceIds(input, new Set(["src_real"]))).toEqual(["src_ghost"]);
  });
});
