import type { EvaluatedTask, Facts } from "@/lib/rules/types";
import type {
  ChangeSummary,
  Classification,
  ClarificationPlan,
  GeneratedAnswer,
} from "./schemas";

export interface RetrievedPassage {
  sourceId: string;
  sourceTitle: string;
  authorityName: string;
  content: string;
}

export interface AnswerContext {
  eventType: string;
  eventTitle: string;
  facts: Facts;
  tasks: EvaluatedTask[];
  passages: RetrievedPassage[];
  language: "en" | "de" | "fr" | "it";
}

/**
 * Provider abstraction. The production target is Apertus; any OpenAI-compatible
 * endpoint can be used for development; the deterministic provider works with
 * no LLM at all. No provider-specific logic may leak outside this module.
 */
export interface AIProvider {
  readonly name: string;

  /** Maps a natural-language query to an event type + extracted entities. */
  classifyEvent(query: string): Promise<Classification>;

  /** Extracts additional structured facts from a free-text answer. */
  extractEntities(text: string, eventType: string): Promise<Record<string, string>>;

  /**
   * Decides which facts are still needed. The candidate list is computed
   * deterministically from taxonomy + rules; the provider may only narrow it.
   */
  determineClarifications(
    eventType: string,
    facts: Facts,
    candidateFacts: string[],
  ): Promise<ClarificationPlan>;

  /**
   * Produces the conversational layer (summary, intro, warnings) around the
   * rules-engine tasks. It must not add, remove or alter obligations.
   */
  generateAnswer(ctx: AnswerContext): Promise<GeneratedAnswer>;

  /** Summarises a diff between two versions of an official source. */
  summariseSourceChange(before: string, after: string): Promise<ChangeSummary>;
}
