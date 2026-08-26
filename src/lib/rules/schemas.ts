import { z } from "zod";
import { EVENT_TYPES, FACT_DEFS } from "@/lib/events/taxonomy";
import type { ConditionNode } from "./types";

/**
 * Validation for admin-authored rules. Every rule created or edited through
 * /admin/rules passes through these schemas — malformed conditions or task
 * templates never reach the engine.
 */

const factKeys = Object.keys(FACT_DEFS) as [string, ...string[]];
const eventTypeIds = EVENT_TYPES.map((e) => e.id) as [string, ...string[]];

const factConditionSchema = z.object({
  fact: z.enum(factKeys),
  op: z.enum(["eq", "neq", "in", "exists", "not_exists"]),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

export const conditionSchema: z.ZodType<ConditionNode> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(conditionSchema) }),
    z.object({ any: z.array(conditionSchema) }),
    z.object({ not: conditionSchema }),
    factConditionSchema,
  ]),
) as z.ZodType<ConditionNode>;

export const deadlineSpecSchema = z.union([
  z.object({
    type: z.literal("relative"),
    amount: z.number().int().positive().max(3650),
    unit: z.enum(["days", "weeks", "months"]),
    anchor: z.literal("event_date"),
    label: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal("fixed"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    label: z.string().min(1).max(200),
  }),
  z.object({ type: z.literal("unknown"), label: z.string().min(1).max(200) }),
]);

export const taskTemplateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(50),
  priority: z.enum(["required", "may_apply", "recommended", "information"]),
  deadline: deadlineSpecSchema.optional(),
  authorityName: z.string().max(200).optional(),
  authorityLevel: z.enum(["federal", "cantonal", "municipal", "private_public_service"]).optional(),
  officialUrl: z.string().url().max(1000).optional(),
  sourceIds: z.array(z.string().max(100)).max(10),
  documentsRequired: z.array(z.string().max(200)).max(20).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const ruleInputSchema = z.object({
  eventType: z.enum(eventTypeIds),
  jurisdiction: z
    .string()
    .regex(/^CH(-[A-Z]{2}(-[a-z0-9-]+)?)?$/, 'Must be "CH", "CH-XX" or "CH-XX-municipality"'),
  conditions: conditionSchema,
  actions: z.array(taskTemplateSchema).min(1).max(20),
  notes: z.string().max(1000).optional().nullable(),
});

export type RuleInput = z.infer<typeof ruleInputSchema>;

/**
 * Validates that every source id referenced by a rule exists in the registry.
 * Returns the unknown ids (empty = valid).
 */
export function unknownSourceIds(input: RuleInput, validIds: Set<string>): string[] {
  const referenced = new Set<string>();
  for (const action of input.actions) for (const id of action.sourceIds) referenced.add(id);
  return [...referenced].filter((id) => !validIds.has(id));
}
