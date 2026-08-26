import { describe, expect, it } from "vitest";
import { suggestEvents } from "@/lib/events/suggest";

describe("did-you-mean suggestions", () => {
  it("suggests family events for child-related queries", () => {
    const suggestions = suggestEvents("something about my child and school next year");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.map((s) => s.eventType)).toContain("child_sick");
  });

  it("suggests permit events for permit-adjacent phrasing", () => {
    const suggestions = suggestEvents("questions about my residence documents");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("returns nothing for pure gibberish", () => {
    expect(suggestEvents("purple quantum sandwiches everywhere")).toHaveLength(0);
  });

  it("caps the number of suggestions", () => {
    expect(suggestEvents("moving job baby school fine permit car insurance tax").length).toBeLessThanOrEqual(3);
  });
});
