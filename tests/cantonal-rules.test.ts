import { describe, expect, it } from "vitest";
import { evaluateRules } from "@/lib/rules/engine";
import { SEED_RULES } from "@/lib/db/seed-data";
import { CANTONAL_RULES } from "@/lib/db/seed-cantons";

const ALL_RULES = [...SEED_RULES, ...CANTONAL_RULES];
const COVERED = ["ZH", "BE", "VD", "AG", "SG", "GE"];

describe("cantonal rule coverage (6 largest cantons)", () => {
  it("cantonal registration task overrides the federal one for covered cantons", () => {
    for (const canton of COVERED) {
      const tasks = evaluateRules(ALL_RULES, "move_between_cantons", {
        canton,
        event_date: "2026-08-20",
      });
      const register = tasks.filter((t) =>
        t.title === "Register with your new municipality within 14 days",
      );
      expect(register, canton).toHaveLength(1);
      expect(register[0].ruleId, canton).toBe(`rule_move_register_${canton.toLowerCase()}`);
      expect(register[0].description, canton).toContain("Canton of");
      expect(register[0].resolvedDeadline.date, canton).not.toBeNull();
    }
  });

  it("uncovered cantons keep the federal baseline", () => {
    const tasks = evaluateRules(ALL_RULES, "move_between_cantons", { canton: "TI" });
    const register = tasks.find((t) => t.title === "Register with your new municipality within 14 days")!;
    expect(register.ruleId).toBe("rule_move_deregister");
  });

  it("permit renewal names the cantonal migration office, without duplicates", () => {
    for (const canton of COVERED) {
      const withPermit = evaluateRules(ALL_RULES, "permit_expiring", { canton, permit_type: "B" });
      const renewalTasks = withPermit.filter((t) => t.category === "immigration");
      expect(renewalTasks, canton).toHaveLength(1);
      expect(renewalTasks[0].authorityName, canton).toContain("Migration office of the Canton of");

      const withoutPermit = evaluateRules(ALL_RULES, "permit_expiring", { canton });
      const contactTasks = withoutPermit.filter((t) => t.category === "immigration");
      expect(contactTasks, canton).toHaveLength(1);
      expect(contactTasks[0].ruleId, canton).toBe(`rule_permit_unknown_${canton.toLowerCase()}`);
    }
  });

  it("tax return works federally and is overridden per canton", () => {
    const federal = evaluateRules(ALL_RULES, "tax_return", {});
    expect(federal.some((t) => t.title.startsWith("File your tax return"))).toBe(true);

    const bern = evaluateRules(ALL_RULES, "tax_return", { canton: "BE" });
    const file = bern.find((t) => t.title.startsWith("File your tax return"))!;
    expect(file.ruleId).toBe("rule_tax_return_be");
    expect(file.authorityName).toBe("Tax administration of the Canton of Bern");
    // The federal extension tip still applies alongside.
    expect(bern.some((t) => t.title.startsWith("Ask for an extension"))).toBe(true);
  });
});
