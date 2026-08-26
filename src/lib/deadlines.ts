import type { DeadlineSpec, Facts } from "@/lib/rules/types";

/**
 * Deadline engine.
 *
 * A concrete date is only ever calculated when the underlying rule defines a
 * deadline AND the anchoring fact (e.g. the event date) is actually known.
 * Otherwise the human-readable label is shown without a computed date —
 * Dumonda never invents deadlines.
 */
export function resolveDeadline(
  spec: DeadlineSpec | undefined,
  facts: Facts,
  _now: Date = new Date(),
): { date: Date | null; label: string | null; type: "fixed" | "relative" | "unknown" | null } {
  if (!spec) return { date: null, label: null, type: null };

  if (spec.type === "fixed") {
    const date = new Date(spec.date);
    return { date: isNaN(date.getTime()) ? null : date, label: spec.label, type: "fixed" };
  }

  if (spec.type === "relative") {
    const anchorRaw = facts[spec.anchor];
    if (!anchorRaw) return { date: null, label: spec.label, type: "relative" };
    const anchor = new Date(anchorRaw);
    if (isNaN(anchor.getTime())) return { date: null, label: spec.label, type: "relative" };
    const date = addToDate(anchor, spec.amount, spec.unit);
    return { date, label: spec.label, type: "relative" };
  }

  return { date: null, label: spec.label, type: "unknown" };
}

export function addToDate(date: Date, amount: number, unit: "days" | "weeks" | "months"): Date {
  const d = new Date(date.getTime());
  if (unit === "days") d.setDate(d.getDate() + amount);
  if (unit === "weeks") d.setDate(d.getDate() + amount * 7);
  if (unit === "months") d.setMonth(d.getMonth() + amount);
  return d;
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date, locale = "en-CH"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
