import { describe, expect, it } from "vitest";
import { DeterministicProvider, detectLanguage, extractDate, extractEntitiesDeterministic } from "@/lib/ai/deterministic";

const provider = new DeterministicProvider();

describe("deterministic classification", () => {
  const cases: [string, string][] = [
    ["I moved from Zürich to Basel last weekend", "move_between_cantons"],
    ["I recently had a baby. What do I need to do?", "child_birth"],
    ["I lost my job yesterday", "job_loss"],
    ["My Half Fare Card expires next month", "half_fare_expiring"],
    ["My B permit expires soon", "permit_expiring"],
    ["I want to start a company", "start_business"],
    ["I just got a parking fine", "fine_received"],
    ["I just finished high school", "finish_high_school"],
    ["I'm moving out of Switzerland", "leave_switzerland"],
    ["I bought a car", "buy_vehicle"],
    ["what if my child falls sick?", "child_sick"],
    ["my daughter is sick and I need to stay home", "child_sick"],
  ];

  for (const [query, expected] of cases) {
    it(`classifies "${query}" as ${expected}`, async () => {
      const result = await provider.classifyEvent(query);
      expect(result.eventType).toBe(expected);
      expect(result.unrecognised).toBe(false);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  }

  it("marks gibberish as unrecognised instead of guessing", async () => {
    const result = await provider.classifyEvent("purple quantum sandwiches everywhere");
    expect(result.unrecognised).toBe(true);
    expect(result.confidence).toBe(0);
  });
});

describe("entity extraction", () => {
  it("extracts origin and destination cantons from a move", () => {
    const e = extractEntitiesDeterministic("I moved from Zürich to Basel", "move_between_cantons");
    expect(e.origin_canton).toBe("ZH");
    expect(e.canton).toBe("BS");
  });

  it("extracts permit type", () => {
    const e = extractEntitiesDeterministic("My B permit expires soon", "permit_expiring");
    expect(e.permit_type).toBe("B");
  });

  it("extracts relative dates", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    expect(extractDate("i moved yesterday", now)).toBe("2026-08-25");
    expect(extractDate("we moved on 20 august", now)).toBe("2026-08-20");
    expect(extractDate("nothing datelike here", now)).toBeNull();
  });
});

describe("language detection", () => {
  it("detects the four supported languages", () => {
    expect(detectLanguage("I just moved and need to know what to do")).toBe("en");
    expect(detectLanguage("Ich bin nach Basel umgezogen und muss das melden")).toBe("de");
    expect(detectLanguage("Je dois faire quoi après mon déménagement")).toBe("fr");
    expect(detectLanguage("Mi sono trasferito e devo fare una registrazione")).toBe("it");
  });
});
