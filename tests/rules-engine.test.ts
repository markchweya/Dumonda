import { describe, expect, it } from "vitest";
import { evaluateCondition, evaluateRules, jurisdictionChain } from "@/lib/rules/engine";
import type { RuleDef } from "@/lib/rules/types";

const baseRule = (over: Partial<RuleDef>): RuleDef => ({
  id: "r1",
  eventType: "move_between_cantons",
  jurisdiction: "CH",
  conditions: { all: [] },
  actions: [
    {
      title: "Task A",
      description: "desc",
      category: "test",
      priority: "required",
      sourceIds: ["src_x"],
    },
  ],
  sourceIds: ["src_x"],
  version: 1,
  active: true,
  ...over,
});

describe("evaluateCondition", () => {
  it("empty all-condition always matches", () => {
    expect(evaluateCondition({ all: [] }, {})).toBe(true);
  });

  it("eq requires the fact to be known and equal", () => {
    expect(evaluateCondition({ fact: "has_vehicle", op: "eq", value: "yes" }, {})).toBe(false);
    expect(evaluateCondition({ fact: "has_vehicle", op: "eq", value: "yes" }, { has_vehicle: "yes" })).toBe(true);
    expect(evaluateCondition({ fact: "has_vehicle", op: "eq", value: "yes" }, { has_vehicle: "no" })).toBe(false);
  });

  it("in matches any listed value", () => {
    const cond = { fact: "nationality_category", op: "in" as const, value: ["eu_efta", "third_country"] };
    expect(evaluateCondition(cond, { nationality_category: "eu_efta" })).toBe(true);
    expect(evaluateCondition(cond, { nationality_category: "swiss" })).toBe(false);
    expect(evaluateCondition(cond, {})).toBe(false);
  });

  it("not_exists matches unknown facts (used for may_apply fallbacks)", () => {
    expect(evaluateCondition({ fact: "has_vehicle", op: "not_exists" }, {})).toBe(true);
    expect(evaluateCondition({ fact: "has_vehicle", op: "not_exists" }, { has_vehicle: "no" })).toBe(false);
  });

  it("nested any/all/not combine correctly", () => {
    const cond = {
      any: [
        { fact: "children_school_age", op: "eq" as const, value: "yes" },
        {
          all: [
            { fact: "has_children", op: "eq" as const, value: "yes" },
            { not: { fact: "children_school_age", op: "exists" as const } },
          ],
        },
      ],
    };
    expect(evaluateCondition(cond, { has_children: "yes" })).toBe(true);
    expect(evaluateCondition(cond, { has_children: "yes", children_school_age: "no" })).toBe(false);
    expect(evaluateCondition(cond, { children_school_age: "yes" })).toBe(true);
  });
});

describe("jurisdictionChain", () => {
  it("builds CH → canton → municipality", () => {
    expect(jurisdictionChain({})).toEqual(["CH"]);
    expect(jurisdictionChain({ canton: "BS" })).toEqual(["CH", "CH-BS"]);
    expect(jurisdictionChain({ canton: "BS", municipality: "Basel" })).toEqual([
      "CH",
      "CH-BS",
      "CH-BS-basel",
    ]);
  });
});

describe("evaluateRules", () => {
  it("applies federal rules regardless of canton", () => {
    const tasks = evaluateRules([baseRule({})], "move_between_cantons", { canton: "ZH" });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Task A");
  });

  it("excludes cantonal rules from other cantons", () => {
    const rule = baseRule({ jurisdiction: "CH-BS" });
    expect(evaluateRules([rule], "move_between_cantons", { canton: "ZH" })).toHaveLength(0);
    expect(evaluateRules([rule], "move_between_cantons", { canton: "BS" })).toHaveLength(1);
  });

  it("ignores inactive rules and other event types", () => {
    expect(evaluateRules([baseRule({ active: false })], "move_between_cantons", {})).toHaveLength(0);
    expect(evaluateRules([baseRule({})], "child_birth", {})).toHaveLength(0);
  });

  it("more specific jurisdiction wins on duplicate task titles", () => {
    const federal = baseRule({ id: "fed" });
    const cantonal = baseRule({
      id: "cant",
      jurisdiction: "CH-BS",
      actions: [
        {
          title: "Task A",
          description: "cantonal override",
          category: "test",
          priority: "required",
          sourceIds: ["src_bs"],
        },
      ],
    });
    const tasks = evaluateRules([federal, cantonal], "move_between_cantons", { canton: "BS" });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].ruleId).toBe("cant");
    expect(tasks[0].description).toBe("cantonal override");
  });

  it("sorts by priority then deadline", () => {
    const rule = baseRule({
      actions: [
        { title: "Info", description: "", category: "t", priority: "information", sourceIds: [] },
        {
          title: "Later required",
          description: "",
          category: "t",
          priority: "required",
          sourceIds: [],
          deadline: { type: "relative", amount: 30, unit: "days", anchor: "event_date", label: "30d" },
        },
        {
          title: "Sooner required",
          description: "",
          category: "t",
          priority: "required",
          sourceIds: [],
          deadline: { type: "relative", amount: 5, unit: "days", anchor: "event_date", label: "5d" },
        },
        { title: "Maybe", description: "", category: "t", priority: "may_apply", sourceIds: [] },
      ],
    });
    const tasks = evaluateRules([rule], "move_between_cantons", { event_date: "2026-08-20" });
    expect(tasks.map((t) => t.title)).toEqual(["Sooner required", "Later required", "Maybe", "Info"]);
  });

  it("respects validFrom/validUntil windows", () => {
    const expired = baseRule({ validUntil: new Date("2020-01-01") });
    expect(evaluateRules([expired], "move_between_cantons", {})).toHaveLength(0);
  });
});
