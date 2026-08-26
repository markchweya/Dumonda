import { EVENT_TYPES, getEventType } from "@/lib/events/taxonomy";
import { findCantonsInText } from "@/lib/swiss/cantons";
import type { AIProvider, AnswerContext } from "./provider";
import type { ChangeSummary, Classification, ClarificationPlan, GeneratedAnswer } from "./schemas";

/**
 * Deterministic provider — no LLM involved.
 *
 * Classification uses keyword scoring over the event taxonomy; answers are
 * composed from the rules engine's output and verified sources only. It can
 * sound less fluent than an LLM, but it can never fabricate an administrative
 * claim. It is the default for local development and the safety net when no
 * model endpoint is configured.
 */
export class DeterministicProvider implements AIProvider {
  readonly name = "deterministic";

  async classifyEvent(query: string): Promise<Classification> {
    const language = detectLanguage(query);
    const lower = query.toLowerCase();

    let best: { id: string; score: number } | null = null;
    for (const def of EVENT_TYPES) {
      let score = 0;
      for (const kw of def.keywords) {
        if (lower.includes(kw)) score += kw.split(" ").length * 2;
      }
      for (const word of def.title.toLowerCase().split(/\s+/)) {
        if (word.length > 3 && lower.includes(word)) score += 1;
      }
      if (score > 0 && (!best || score > best.score)) best = { id: def.id, score };
    }

    // Disambiguate moves: "moving to <canton>" with two cantons → intercantonal
    const cantons = findCantonsInText(query);
    if (/\bmov(e|ed|ing)\b|\bumzug\b|\bumgezogen\b|\bz[üu]gel(n|e)?\b|\bd[ée]m[ée]nag|\btrasferit/i.test(query)) {
      if (/abroad|leave switzerland|out of switzerland|emigrat/i.test(lower)) {
        best = { id: "leave_switzerland", score: 100 };
      } else if (/to switzerland|nach der schweiz|in die schweiz/i.test(lower)) {
        best = { id: "arrive_in_switzerland", score: 100 };
      } else if (cantons.length >= 1 && (!best || best.score < 8)) {
        best = { id: "move_between_cantons", score: 8 };
      }
    }

    if (!best) {
      return { eventType: "", confidence: 0, entities: {}, language, unrecognised: true };
    }

    const def = getEventType(best.id)!;
    const entities = extractEntitiesDeterministic(query, def.id);
    const confidence = Math.min(0.95, 0.5 + best.score * 0.05);
    return { eventType: def.id, confidence, entities, language, unrecognised: false };
  }

  async extractEntities(text: string, eventType: string): Promise<Record<string, string>> {
    return extractEntitiesDeterministic(text, eventType);
  }

  async determineClarifications(
    _eventType: string,
    facts: Record<string, string>,
    candidateFacts: string[],
  ): Promise<ClarificationPlan> {
    const missing = candidateFacts.filter((f) => !facts[f]);
    return { needsClarification: missing.length > 0, facts: missing };
  }

  async generateAnswer(ctx: AnswerContext): Promise<GeneratedAnswer> {
    const required = ctx.tasks.filter((t) => t.priority === "required").length;
    const conditional = ctx.tasks.filter((t) => t.priority === "may_apply").length;

    const parts: string[] = [];
    parts.push(
      `Based on your situation, we identified ${ctx.tasks.length} ${ctx.tasks.length === 1 ? "step" : "steps"}` +
        (required > 0 ? `, ${required} of ${required === 1 ? "which is" : "which are"} official obligations` : "") +
        ".",
    );
    if (conditional > 0) {
      parts.push(
        `${conditional} ${conditional === 1 ? "item depends" : "items depend"} on details of your situation — check whether they apply to you.`,
      );
    }
    parts.push("Every step below links to the official information it is based on.");

    const def = getEventType(ctx.eventType);
    const warnings: string[] = [];
    if (def?.highConsequence) {
      warnings.push(
        "This topic can have legal or financial consequences. Dumonda provides verified official information and navigation, not an official decision — for binding answers contact the responsible authority.",
      );
    }

    return {
      summary: parts.join(" "),
      intro: def ? `Here is what applies for: ${def.title.toLowerCase()}.` : "",
      warnings,
      followUpSuggestions: [],
    };
  }

  async summariseSourceChange(before: string, after: string): Promise<ChangeSummary> {
    const delta = Math.abs(after.length - before.length);
    return {
      substantiveChange: delta > 200,
      summary:
        "Automatic comparison only (no LLM configured): the page content changed" +
        ` by roughly ${delta} characters. Manual review required.`,
    };
  }
}

// ─── Deterministic entity extraction ─────────────────────────────────────────

export function extractEntitiesDeterministic(
  text: string,
  eventType: string,
): Record<string, string> {
  const entities: Record<string, string> = {};
  const lower = text.toLowerCase();
  const cantons = findCantonsInText(text);

  const moveLike = ["move_between_cantons", "move_between_communes", "arrive_in_switzerland", "leave_switzerland"];
  if (moveLike.includes(eventType)) {
    const fromMatch = /from\s+([a-zäöüéèâ.\- ]{2,25}?)\s+to\s+([a-zäöüéèâ.\- ]{2,25})(\b|$)/i.exec(text);
    if (fromMatch && cantons.length >= 2) {
      entities["origin_canton"] = cantons[0].code;
      entities["canton"] = cantons[1].code;
    } else if (cantons.length === 1) {
      if (/\bfrom\b/i.test(text) && !/\bto\b/i.test(text)) {
        entities["origin_canton"] = cantons[0].code;
      } else {
        entities["canton"] = cantons[0].code;
      }
    } else if (cantons.length >= 2) {
      entities["origin_canton"] = cantons[0].code;
      entities["canton"] = cantons[1].code;
    }
  } else if (cantons.length >= 1) {
    entities["canton"] = cantons[0].code;
  }

  const permitMatch = /\b([LBC])[\s-]*(?:permit|bewilligung|ausweis)\b/i.exec(text) ??
    /\bpermit\s+([LBC])\b/i.exec(text);
  if (permitMatch) {
    entities["permit_type"] = permitMatch[1].toUpperCase();
    entities["residence_permit"] = permitMatch[1].toUpperCase();
  }

  const date = extractDate(lower);
  if (date) entities["event_date"] = date;

  if (/half[\s-]?fare|halbtax|demi[\s-]?tarif/.test(lower)) entities["travelcard_type"] = "half_fare";
  if (/\bga\b|general abonnement|generalabo/.test(lower)) entities["travelcard_type"] = "ga";

  if (eventType === "fine_received") {
    if (/parking/.test(lower)) entities["fine_type"] = "parking";
    else if (/speed|radar|traffic/.test(lower)) entities["fine_type"] = "traffic";
    else if (/train|tram|bus|public transport|ticket control/.test(lower)) entities["fine_type"] = "public_transport";
  }

  return entities;
}

/** Parses common absolute/relative date phrases to an ISO date. */
export function extractDate(lower: string, now: Date = new Date()): string | null {
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(lower);
  if (iso) return iso[0];

  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const dm = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${months.join("|")})\\b`).exec(lower) ??
    new RegExp(`\\b(${months.join("|")})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`).exec(lower);
  if (dm) {
    const day = parseInt(/\d/.test(dm[1]) ? dm[1] : dm[2], 10);
    const monthName = /\d/.test(dm[1]) ? dm[2] : dm[1];
    const month = months.indexOf(monthName);
    if (month >= 0 && day >= 1 && day <= 31) {
      const year = now.getFullYear();
      const d = new Date(Date.UTC(year, month, day));
      return d.toISOString().slice(0, 10);
    }
  }

  const rel: [RegExp, number][] = [
    [/\byesterday\b/, -1],
    [/\btoday\b/, 0],
    [/\blast week\b|\blast weekend\b/, -7],
    [/\btomorrow\b/, 1],
    [/\bnext week\b/, 7],
  ];
  for (const [re, days] of rel) {
    if (re.test(lower)) {
      const d = new Date(now.getTime() + days * 86400000);
      return d.toISOString().slice(0, 10);
    }
  }
  return null;
}

/** Lightweight language detection across Swiss national languages + English. */
export function detectLanguage(text: string): "en" | "de" | "fr" | "it" {
  const lower = ` ${text.toLowerCase()} `;
  const scores = { en: 0, de: 0, fr: 0, it: 0 };
  const markers: Record<keyof typeof scores, string[]> = {
    en: [" i ", " the ", " what ", " my ", " to ", " do ", " need ", " have ", " just ", " moved "],
    de: [" ich ", " der ", " die ", " das ", " was ", " muss ", " habe ", " nach ", " und ", " umgezogen ", " bin "],
    fr: [" je ", " le ", " la ", " les ", " que ", " dois ", " faire ", " suis ", " une ", " déménagé "],
    it: [" io ", " il ", " la ", " che ", " devo ", " fare ", " sono ", " una ", " trasferito "],
  };
  for (const lang of Object.keys(markers) as (keyof typeof scores)[]) {
    for (const m of markers[lang]) if (lower.includes(m)) scores[lang] += 1;
  }
  const bestEntry = (Object.entries(scores) as [keyof typeof scores, number][]).sort((a, b) => b[1] - a[1])[0];
  return bestEntry[1] > 0 ? bestEntry[0] : "en";
}
