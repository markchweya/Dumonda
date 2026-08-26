import { and, eq } from "drizzle-orm";
import { getAIProvider } from "@/lib/ai";
import { track } from "@/lib/analytics";
import { getDb, schema } from "@/lib/db";
import { FACT_DEFS, getEventType, type FactKey } from "@/lib/events/taxonomy";
import { newId } from "@/lib/ids";
import { retrievePassages } from "@/lib/retrieval/hybrid";
import { findCantonsInText } from "@/lib/swiss/cantons";
import { evaluateRules } from "@/lib/rules/engine";
import type { ConditionNode, DeadlineSpec, RuleDef, TaskTemplate } from "@/lib/rules/types";

/**
 * The pipeline of section 17:
 * query → classification → profile/context → clarification → filtered
 * retrieval → rules engine → answer generation → citation validation →
 * structured answer.
 */

export interface AskResult {
  kind: "clarify" | "checklist" | "unrecognised";
  eventId?: string;
  eventTitle?: string;
  questions?: { fact: FactKey; question: string; whyWeAsk: string; options?: { value: string; label: string }[]; input?: "text" | "date" }[];
  message?: string;
}

/** Facts referenced by a rule's conditions or deadline anchors. */
function factsReferencedByRules(rules: RuleDef[]): Set<string> {
  const facts = new Set<string>();
  const walk = (node: ConditionNode) => {
    if ("all" in node) node.all.forEach(walk);
    else if ("any" in node) node.any.forEach(walk);
    else if ("not" in node) walk(node.not);
    else facts.add(node.fact);
  };
  for (const rule of rules) {
    walk(rule.conditions);
    for (const action of rule.actions) {
      const dl = action.deadline as DeadlineSpec | undefined;
      if (dl?.type === "relative") facts.add(dl.anchor);
    }
  }
  return facts;
}

async function loadRules(eventType: string): Promise<RuleDef[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.rules)
    .where(and(eq(schema.rules.eventType, eventType), eq(schema.rules.active, true)));
  return rows.map((r) => ({
    id: r.id,
    eventType: r.eventType,
    jurisdiction: r.jurisdiction,
    conditions: r.conditions as ConditionNode,
    actions: r.actions as TaskTemplate[],
    sourceIds: r.sourceIds,
    version: r.version,
    active: r.active,
    validFrom: r.validFrom,
    validUntil: r.validUntil,
    notes: r.notes,
  }));
}

/** Copies known profile fields into facts without overwriting extracted ones. */
async function mergeProfileFacts(userId: string | null, facts: Record<string, string>) {
  if (!userId) return facts;
  const db = await getDb();
  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, userId))
    .limit(1);
  if (!profile) return facts;
  const merged = { ...facts };
  if (!merged.canton && profile.canton) merged.canton = profile.canton;
  if (!merged.municipality && profile.municipality) merged.municipality = profile.municipality;
  if (!merged.nationality_category && profile.nationalityCategory) merged.nationality_category = profile.nationalityCategory;
  if (!merged.residence_permit && profile.residencePermit) merged.residence_permit = profile.residencePermit;
  if (!merged.employment_status && profile.employmentStatus) merged.employment_status = profile.employmentStatus;
  if (!merged.has_vehicle && profile.hasVehicle !== null) merged.has_vehicle = profile.hasVehicle ? "yes" : "no";
  if (!merged.has_children && profile.hasChildren !== null) merged.has_children = profile.hasChildren ? "yes" : "no";
  return merged;
}

/** Determines which clarification questions genuinely change the outcome. */
async function planClarifications(
  eventType: string,
  facts: Record<string, string>,
): Promise<FactKey[]> {
  const def = getEventType(eventType);
  if (!def) return [];
  const rules = await loadRules(eventType);
  const referenced = factsReferencedByRules(rules);
  // Candidates: relevant per taxonomy, referenced by at least one rule
  // (or event_date for deadline calculation), and not yet known.
  const candidates = def.relevantFacts.filter(
    (f) => referenced.has(f) && !facts[f],
  );
  if (candidates.length === 0) return [];
  const ai = getAIProvider();
  const plan = await ai.determineClarifications(eventType, facts, candidates);
  const allowed = new Set(candidates);
  const selected = plan.facts.filter((f): f is FactKey => allowed.has(f as FactKey));
  return selected.slice(0, 4);
}

function questionsFor(factKeys: FactKey[]) {
  return factKeys.map((fact) => {
    const def = FACT_DEFS[fact];
    return {
      fact,
      question: def.question,
      whyWeAsk: def.whyWeAsk,
      options: def.options,
      input: def.input,
    };
  });
}

/** Entry point for a new natural-language query. */
export async function processQuery(
  query: string,
  session: { sessionId: string; userId: string | null },
): Promise<AskResult> {
  const db = await getDb();
  const ai = getAIProvider();

  const classification = await ai.classifyEvent(query);
  await track("search", { recognised: !classification.unrecognised });

  if (classification.unrecognised || !getEventType(classification.eventType)) {
    await track("unanswered_query", {});
    return {
      kind: "unrecognised",
      message:
        "I couldn't match this to a situation I can reliably help with yet. Try describing what happened in a sentence — for example \"I moved from Zürich to Basel\" or \"my B permit expires soon\". Your question has been recorded so we can add this situation.",
    };
  }

  const def = getEventType(classification.eventType)!;
  await track("event_classified", {
    eventType: def.id,
    confidence: Math.round(classification.confidence * 100) / 100,
  });

  let facts = { ...classification.entities };
  facts = await mergeProfileFacts(session.userId, facts);

  const eventId = newId("ev");
  const pending = await planClarifications(def.id, facts);

  await db.insert(schema.lifeEvents).values({
    id: eventId,
    sessionId: session.sessionId,
    userId: session.userId,
    eventType: def.id,
    title: def.title,
    originalQuery: query.slice(0, 2000),
    facts,
    pendingFacts: pending,
    status: pending.length > 0 ? "clarifying" : "active",
    classificationConfidence: classification.confidence,
    language: classification.language,
    eventDate: facts.event_date ? new Date(facts.event_date) : null,
  });

  const conversationId = newId("cnv");
  await db.insert(schema.conversations).values({
    id: conversationId,
    eventId,
    sessionId: session.sessionId,
    userId: session.userId,
  });
  await db.insert(schema.messages).values({
    id: newId("msg"),
    conversationId,
    role: "user",
    content: query.slice(0, 2000),
  });

  if (pending.length > 0) {
    await track("clarification_asked", { eventType: def.id, count: pending.length });
    return { kind: "clarify", eventId, eventTitle: def.title, questions: questionsFor(pending) };
  }

  await generateChecklist(eventId);
  return { kind: "checklist", eventId, eventTitle: def.title };
}

/** Applies clarification answers; generates the checklist once complete. */
export async function submitClarifications(
  eventId: string,
  answers: Record<string, string>,
): Promise<AskResult> {
  const db = await getDb();
  const [event] = await db
    .select()
    .from(schema.lifeEvents)
    .where(eq(schema.lifeEvents.id, eventId))
    .limit(1);
  if (!event) return { kind: "unrecognised", message: "Event not found." };

  const facts = { ...event.facts };
  for (const [key, value] of Object.entries(answers)) {
    if (key in FACT_DEFS && typeof value === "string" && value.length > 0 && value.length < 200) {
      facts[key] = normaliseFactValue(key as FactKey, value);
    }
  }

  const pending = await planClarifications(event.eventType, facts);
  await db
    .update(schema.lifeEvents)
    .set({
      facts,
      pendingFacts: pending,
      status: pending.length > 0 ? "clarifying" : "active",
      eventDate: facts.event_date ? new Date(facts.event_date) : event.eventDate,
      updatedAt: new Date(),
    })
    .where(eq(schema.lifeEvents.id, eventId));

  if (pending.length > 0) {
    return {
      kind: "clarify",
      eventId,
      eventTitle: event.title,
      questions: questionsFor(pending),
    };
  }

  await generateChecklist(eventId);
  return { kind: "checklist", eventId, eventTitle: event.title };
}

/** Maps free-text canton answers to codes; passes options through. */
function normaliseFactValue(key: FactKey, value: string): string {
  if (key === "canton" || key === "origin_canton") {
    const found = findCantonsInText(value);
    if (found.length > 0) return found[0].code;
    return value.trim().slice(0, 60);
  }
  return value.trim();
}

/** Runs rules + retrieval + answer generation and persists tasks + citations. */
export async function generateChecklist(eventId: string): Promise<void> {
  const db = await getDb();
  const [event] = await db
    .select()
    .from(schema.lifeEvents)
    .where(eq(schema.lifeEvents.id, eventId))
    .limit(1);
  if (!event) return;

  const def = getEventType(event.eventType);
  const ruleDefs = await loadRules(event.eventType);
  const evaluated = evaluateRules(ruleDefs, event.eventType, event.facts);

  const passages = await retrievePassages(event.originalQuery ?? event.title, {
    eventType: event.eventType,
    canton: event.facts.canton ?? null,
    limit: 6,
  });

  const ai = getAIProvider();
  const answer = await ai.generateAnswer({
    eventType: event.eventType,
    eventTitle: def?.title ?? event.title,
    facts: event.facts,
    tasks: evaluated,
    passages,
    language: event.language,
  });

  // Citation validation: a task may only cite sources that exist in the DB.
  const allSources = await db.select({ id: schema.sources.id }).from(schema.sources);
  const validSourceIds = new Set(allSources.map((s) => s.id));

  // Replace any previous tasks (idempotent regeneration).
  await db.delete(schema.tasks).where(eq(schema.tasks.eventId, eventId));

  let order = 0;
  for (const task of evaluated) {
    const taskId = newId("tsk");
    const citedSources = task.sourceIds.filter((id) => validSourceIds.has(id));
    await db.insert(schema.tasks).values({
      id: taskId,
      eventId,
      ruleId: task.ruleId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      required: task.priority === "required",
      deadline: task.resolvedDeadline.date,
      deadlineType: task.resolvedDeadline.type,
      deadlineLabel: task.resolvedDeadline.label,
      authorityName: task.authorityName ?? null,
      authorityLevel: task.authorityLevel ?? null,
      officialUrl: task.officialUrl ?? null,
      sourceIds: citedSources,
      documentsRequired: task.documentsRequired ?? [],
      confidence: task.confidence ?? 1,
      sortOrder: order++,
    });
    for (const sourceId of citedSources) {
      await db.insert(schema.citations).values({
        id: newId("cit"),
        taskId,
        sourceId,
        excerpt: null,
      });
    }
  }

  await db
    .update(schema.lifeEvents)
    .set({ summary: answer.summary, status: "active", updatedAt: new Date() })
    .where(eq(schema.lifeEvents.id, eventId));

  // Store the assistant message with its structured payload.
  const [conversation] = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.eventId, eventId))
    .limit(1);
  if (conversation) {
    await db.insert(schema.messages).values({
      id: newId("msg"),
      conversationId: conversation.id,
      role: "assistant",
      content: answer.summary,
      payload: {
        intro: answer.intro,
        warnings: answer.warnings,
        followUpSuggestions: answer.followUpSuggestions,
        taskCount: evaluated.length,
      },
    });
  }

  await track("checklist_generated", { eventType: event.eventType, tasks: evaluated.length });
}
