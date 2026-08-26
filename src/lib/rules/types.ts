/**
 * Deterministic rules layer.
 *
 * The LLM identifies circumstances (facts). The rules engine — not the LLM —
 * selects obligations. Sources supply the verified information behind each
 * task. The LLM only explains the result.
 */

export type ConditionNode =
  | { all: ConditionNode[] }
  | { any: ConditionNode[] }
  | { not: ConditionNode }
  | FactCondition;

export interface FactCondition {
  fact: string;
  op: "eq" | "neq" | "in" | "exists" | "not_exists";
  value?: string | string[];
}

export type DeadlineSpec =
  | {
      type: "relative";
      amount: number;
      unit: "days" | "weeks" | "months";
      anchor: "event_date";
      /** human label, e.g. "within 14 days of moving in" */
      label: string;
    }
  | { type: "fixed"; date: string; label: string }
  | { type: "unknown"; label: string };

export type TaskPriority = "required" | "may_apply" | "recommended" | "information";

export interface TaskTemplate {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  deadline?: DeadlineSpec;
  authorityName?: string;
  authorityLevel?: "federal" | "cantonal" | "municipal" | "private_public_service";
  officialUrl?: string;
  sourceIds: string[];
  documentsRequired?: string[];
  confidence?: number;
}

export interface RuleDef {
  id: string;
  eventType: string;
  /** "CH" | "CH-ZH" | "CH-BS" | "CH-BS-basel" ... */
  jurisdiction: string;
  conditions: ConditionNode;
  actions: TaskTemplate[];
  sourceIds: string[];
  version: number;
  active: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
  notes?: string | null;
}

export interface EvaluatedTask extends TaskTemplate {
  ruleId: string;
  resolvedDeadline: { date: Date | null; label: string | null; type: "fixed" | "relative" | "unknown" | null };
}

export type Facts = Record<string, string>;
