import { resolveDeadline } from "@/lib/deadlines";
import type { ConditionNode, EvaluatedTask, Facts, RuleDef } from "./types";

/**
 * Evaluates a single condition tree against known facts.
 *
 * Unknown facts are treated as "condition not satisfied" — the engine never
 * assumes an obligation exists without evidence. Conditional obligations are
 * modelled with priority "may_apply" instead.
 */
export function evaluateCondition(node: ConditionNode, facts: Facts): boolean {
  if ("all" in node) return node.all.every((c) => evaluateCondition(c, facts));
  if ("any" in node) return node.any.some((c) => evaluateCondition(c, facts));
  if ("not" in node) return !evaluateCondition(node.not, facts);

  const value = facts[node.fact];
  switch (node.op) {
    case "exists":
      return value !== undefined && value !== "";
    case "not_exists":
      return value === undefined || value === "";
    case "eq":
      return value !== undefined && value === node.value;
    case "neq":
      return value !== undefined && value !== node.value;
    case "in":
      return value !== undefined && Array.isArray(node.value) && node.value.includes(value);
    default:
      return false;
  }
}

/**
 * Builds the jurisdiction inheritance chain for a set of facts.
 * Federal rules always apply; cantonal rules apply when the canton matches;
 * municipal rules only within that municipality.
 */
export function jurisdictionChain(facts: Facts): string[] {
  const chain = ["CH"];
  const canton = facts["canton"];
  if (canton) {
    chain.push(`CH-${canton.toUpperCase()}`);
    const municipality = facts["municipality"];
    if (municipality) {
      chain.push(`CH-${canton.toUpperCase()}-${municipality.toLowerCase().replace(/\s+/g, "-")}`);
    }
  }
  return chain;
}

export interface EvaluateOptions {
  now?: Date;
}

/**
 * Runs all active rules for an event type against the collected facts and
 * returns the applicable tasks, deduplicated and ordered.
 */
export function evaluateRules(
  ruleDefs: RuleDef[],
  eventType: string,
  facts: Facts,
  opts: EvaluateOptions = {},
): EvaluatedTask[] {
  const now = opts.now ?? new Date();
  const chain = jurisdictionChain(facts);

  const applicable = ruleDefs.filter((rule) => {
    if (!rule.active) return false;
    if (rule.eventType !== eventType) return false;
    if (!chain.includes(rule.jurisdiction)) return false;
    if (rule.validFrom && now < rule.validFrom) return false;
    if (rule.validUntil && now > rule.validUntil) return false;
    return evaluateCondition(rule.conditions, facts);
  });

  const tasks: EvaluatedTask[] = [];
  const seenTitles = new Set<string>();

  // More specific jurisdictions win on duplicate task titles.
  const specificity = (j: string) => j.split("-").length;
  const sorted = [...applicable].sort(
    (a, b) => specificity(b.jurisdiction) - specificity(a.jurisdiction),
  );

  for (const rule of sorted) {
    for (const template of rule.actions) {
      const key = template.title.toLowerCase();
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);
      tasks.push({
        ...template,
        ruleId: rule.id,
        resolvedDeadline: resolveDeadline(template.deadline, facts, now),
      });
    }
  }

  const priorityOrder = { required: 0, may_apply: 1, recommended: 2, information: 3 };
  tasks.sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    const da = a.resolvedDeadline.date?.getTime() ?? Infinity;
    const db = b.resolvedDeadline.date?.getTime() ?? Infinity;
    return da - db;
  });

  return tasks;
}
