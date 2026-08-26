import { describe, expect, it } from "vitest";
import { addToDate, daysUntil, resolveDeadline } from "@/lib/deadlines";

describe("resolveDeadline", () => {
  it("returns nulls when no spec is defined (never invents deadlines)", () => {
    expect(resolveDeadline(undefined, {})).toEqual({ date: null, label: null, type: null });
  });

  it("relative deadline computes only when the anchor fact is known", () => {
    const spec = {
      type: "relative" as const,
      amount: 14,
      unit: "days" as const,
      anchor: "event_date" as const,
      label: "Within 14 days",
    };
    const withoutAnchor = resolveDeadline(spec, {});
    expect(withoutAnchor.date).toBeNull();
    expect(withoutAnchor.label).toBe("Within 14 days");

    const withAnchor = resolveDeadline(spec, { event_date: "2026-08-20" });
    expect(withAnchor.date?.toISOString().slice(0, 10)).toBe("2026-09-03");
  });

  it("ignores invalid anchor dates", () => {
    const spec = {
      type: "relative" as const,
      amount: 14,
      unit: "days" as const,
      anchor: "event_date" as const,
      label: "x",
    };
    expect(resolveDeadline(spec, { event_date: "not-a-date" }).date).toBeNull();
  });

  it("fixed and unknown types resolve as expected", () => {
    expect(
      resolveDeadline({ type: "fixed", date: "2026-11-30", label: "By 30 Nov" }, {}).date?.toISOString().slice(0, 10),
    ).toBe("2026-11-30");
    const unknown = resolveDeadline({ type: "unknown", label: "On your document" }, {});
    expect(unknown.date).toBeNull();
    expect(unknown.type).toBe("unknown");
  });
});

describe("addToDate", () => {
  it("adds days, weeks and months (in local time, like deadlines are)", () => {
    const base = new Date(2026, 0, 31, 12);
    const plusDay = addToDate(base, 1, "days");
    expect([plusDay.getMonth(), plusDay.getDate()]).toEqual([1, 1]);
    const plusWeeks = addToDate(base, 2, "weeks");
    expect([plusWeeks.getMonth(), plusWeeks.getDate()]).toEqual([1, 14]);
    const plusMonths = addToDate(new Date(2026, 0, 15, 12), 3, "months");
    expect([plusMonths.getMonth(), plusMonths.getDate()]).toEqual([3, 15]);
  });
});

describe("daysUntil", () => {
  it("counts calendar days, rounding up", () => {
    const now = new Date("2026-08-26T08:00:00Z");
    expect(daysUntil(new Date("2026-08-28T08:00:00Z"), now)).toBe(2);
  });
});
