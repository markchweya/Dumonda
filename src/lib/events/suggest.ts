import { EVENT_TYPES, type EventTypeDef } from "./taxonomy";

/**
 * Fuzzy "did you mean" suggestions for queries the classifier can't match
 * with confidence. Scores events by token overlap between the query and each
 * event's title, description and keywords — weaker than classification on
 * purpose: these are offered as clickable options, never asserted as the
 * user's situation.
 */

const STOPWORDS = new Set([
  "what", "when", "how", "does", "do", "did", "the", "a", "an", "my", "our",
  "his", "her", "their", "your", "i", "we", "is", "are", "was", "were", "be",
  "have", "has", "had", "and", "or", "but", "if", "to", "of", "in", "on",
  "for", "with", "about", "need", "want", "should", "would", "can", "will",
  "happens", "there", "this", "that", "me", "it", "get", "got", "just",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zäöüéèàêçß0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export interface EventSuggestion {
  eventType: string;
  title: string;
  /** the query to feed into /ask when the user picks the suggestion */
  query: string;
}

export function suggestEvents(query: string, limit = 3): EventSuggestion[] {
  const queryTokens = new Set(tokens(query));
  if (queryTokens.size === 0) return [];

  const scored: { def: EventTypeDef; score: number }[] = [];
  for (const def of EVENT_TYPES) {
    const haystack = new Set([
      ...tokens(def.title),
      ...tokens(def.description),
      ...def.keywords.flatMap((k) => tokens(k)),
    ]);
    let score = 0;
    for (const qt of queryTokens) {
      if (haystack.has(qt)) score += 2;
      else if ([...haystack].some((h) => h.startsWith(qt) || qt.startsWith(h))) score += 1;
    }
    if (score > 0) scored.push({ def, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ def }) => ({
    eventType: def.id,
    title: def.title,
    query: def.description,
  }));
}
