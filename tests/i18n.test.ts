import { describe, expect, it } from "vitest";
import { t, isLocale, LOCALES } from "@/lib/i18n";
import { localisedFactQuestion } from "@/lib/i18n/facts";
import { DeterministicProvider } from "@/lib/ai/deterministic";
import { FACT_DEFS, type FactKey } from "@/lib/events/taxonomy";

describe("t()", () => {
  it("translates and falls back to English for missing keys", () => {
    expect(t("de", "ask.submit")).toBe("Zeig mir, was zu tun ist");
    expect(t("fr", "task.required")).toBe("Obligatoire");
    expect(t("it", "dash.title")).toBe("Il mio Dumonda");
    expect(t("en", "ask.submit")).toBe("Show me what to do");
  });

  it("interpolates variables", () => {
    expect(t("en", "dash.inDays", { days: 5 })).toBe("in 5 days");
    expect(t("de", "dash.inDays", { days: 5 })).toBe("in 5 Tagen");
  });

  it("validates locales", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("xx")).toBe(false);
    expect(LOCALES.map((l) => l.code)).toEqual(["en", "de", "fr", "it"]);
  });
});

describe("localised clarification questions", () => {
  it("localises questions, explanations and option labels", () => {
    const de = localisedFactQuestion("nationality_category", "de");
    expect(de.question).toContain("Staatsangehörigkeit");
    expect(de.options?.find((o) => o.value === "swiss")?.label).toBe("Schweizer Staatsangehörigkeit");

    const fr = localisedFactQuestion("has_vehicle", "fr");
    expect(fr.question).toContain("véhicule");
    expect(fr.options?.find((o) => o.value === "yes")?.label).toBe("Oui");
  });

  it("falls back to the taxonomy's English for untranslated locales", () => {
    const en = localisedFactQuestion("has_vehicle", "en");
    expect(en.question).toBe(FACT_DEFS.has_vehicle.question);
    expect(en.options?.find((o) => o.value === "yes")?.label).toBe("Yes");
  });

  it("covers every fact in all four languages without crashing", () => {
    for (const fact of Object.keys(FACT_DEFS) as FactKey[]) {
      for (const locale of ["en", "de", "fr", "it"] as const) {
        const q = localisedFactQuestion(fact, locale);
        expect(q.question.length).toBeGreaterThan(3);
        expect(q.whyWeAsk.length).toBeGreaterThan(3);
      }
    }
  });
});

describe("localised deterministic answers", () => {
  const provider = new DeterministicProvider();
  const baseCtx = {
    eventType: "job_loss",
    eventTitle: "Losing your job",
    facts: {},
    tasks: [
      {
        title: "T1", description: "d", category: "c", priority: "required" as const, sourceIds: [],
        ruleId: "r", resolvedDeadline: { date: null, label: null, type: null },
      },
      {
        title: "T2", description: "d", category: "c", priority: "may_apply" as const, sourceIds: [],
        ruleId: "r", resolvedDeadline: { date: null, label: null, type: null },
      },
    ],
    passages: [],
  };

  it("generates the summary in the user's language", async () => {
    const de = await provider.generateAnswer({ ...baseCtx, language: "de" });
    expect(de.summary).toContain("Schritte");
    expect(de.warnings[0]).toContain("Behörde");

    const fr = await provider.generateAnswer({ ...baseCtx, language: "fr" });
    expect(fr.summary).toContain("démarches");

    const it = await provider.generateAnswer({ ...baseCtx, language: "it" });
    expect(it.summary).toContain("passi");

    const en = await provider.generateAnswer({ ...baseCtx, language: "en" });
    expect(en.summary).toContain("steps");
  });
});
