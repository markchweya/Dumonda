import { describe, expect, it } from "vitest";
import { DeterministicProvider } from "@/lib/ai/deterministic";
import { EVAL_CASES } from "@/lib/ai/eval-dataset";

/**
 * Regression guard: the deterministic baseline must keep at least 90%
 * accuracy on the easy (non-`hard`) evaluation set. The full comparison
 * against a connected LLM provider runs via `npm run eval:classification`.
 */
describe("deterministic classification baseline", () => {
  it("keeps >= 90% accuracy on the easy evaluation set", async () => {
    const provider = new DeterministicProvider();
    const easy = EVAL_CASES.filter((c) => !c.hard);
    let correct = 0;
    const misses: string[] = [];
    for (const c of easy) {
      const result = await provider.classifyEvent(c.query);
      if (!result.unrecognised && result.eventType === c.expected) correct++;
      else misses.push(`"${c.query}" expected ${c.expected} got ${result.unrecognised ? "(unrecognised)" : result.eventType}`);
    }
    const accuracy = correct / easy.length;
    expect(accuracy, `misses:\n${misses.join("\n")}`).toBeGreaterThanOrEqual(0.9);
  });
});
