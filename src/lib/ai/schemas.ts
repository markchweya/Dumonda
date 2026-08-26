import { z } from "zod";

/**
 * Structured-output contracts for every AI provider. Model output is never
 * trusted: everything is parsed through these schemas before use.
 */

export const classificationSchema = z.object({
  eventType: z.string().min(1),
  confidence: z.number().min(0).max(1),
  /** free-text facts the model extracted, keyed by FactKey */
  entities: z.record(z.string(), z.string()).default({}),
  language: z.enum(["en", "de", "fr", "it"]).default("en"),
  /** true when no known event type fits */
  unrecognised: z.boolean().default(false),
});
export type Classification = z.infer<typeof classificationSchema>;

export const clarificationSchema = z.object({
  needsClarification: z.boolean(),
  /** FactKeys to ask about, most impactful first */
  facts: z.array(z.string()).default([]),
});
export type ClarificationPlan = z.infer<typeof clarificationSchema>;

export const answerTaskSchema = z.object({
  title: z.string(),
  priority: z.enum(["required", "may_apply", "recommended", "information"]),
  deadline: z.string().nullish(),
  authority: z.string().nullish(),
  description: z.string(),
  sourceIds: z.array(z.string()).default([]),
});

export const generatedAnswerSchema = z.object({
  summary: z.string(),
  /** short conversational intro shown above the checklist */
  intro: z.string().default(""),
  warnings: z.array(z.string()).default([]),
  followUpSuggestions: z.array(z.string()).default([]),
});
export type GeneratedAnswer = z.infer<typeof generatedAnswerSchema>;

export const changeSummarySchema = z.object({
  substantiveChange: z.boolean(),
  summary: z.string(),
});
export type ChangeSummary = z.infer<typeof changeSummarySchema>;
