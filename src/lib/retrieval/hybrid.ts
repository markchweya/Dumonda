import { and, cosineDistance, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { RetrievedPassage } from "@/lib/ai/provider";
import { getEmbedder } from "./embeddings";

export interface RetrievalFilter {
  eventType?: string;
  canton?: string | null;
  limit?: number;
}

/**
 * Hybrid retrieval: metadata filtering first (country, event tags, canton,
 * verification status), then vector similarity merged with keyword scoring.
 * Vector similarity alone is never the sole gate.
 */
export async function retrievePassages(
  query: string,
  filter: RetrievalFilter = {},
): Promise<RetrievedPassage[]> {
  const db = await getDb();
  const limit = filter.limit ?? 6;

  // 1. Metadata filter: usable sources for this event/jurisdiction.
  const candidateSources = await db
    .select({
      id: schema.sources.id,
      title: schema.sources.title,
      authorityName: schema.sources.authorityName,
      canton: schema.sources.canton,
      eventTags: schema.sources.eventTags,
    })
    .from(schema.sources)
    .where(
      and(
        eq(schema.sources.country, "CH"),
        inArray(schema.sources.verification, ["verified", "seed_demo", "pending_review"]),
      ),
    );

  const usable = candidateSources.filter((s) => {
    if (filter.eventType && s.eventTags.length > 0 && !s.eventTags.includes(filter.eventType)) {
      return false;
    }
    // Cantonal sources from other cantons are excluded; federal (null canton) kept.
    if (filter.canton && s.canton && s.canton !== filter.canton) return false;
    return true;
  });
  if (usable.length === 0) return [];

  const sourceIds = usable.map((s) => s.id);
  const sourceById = new Map(usable.map((s) => [s.id, s]));

  // 2. Vector similarity over the filtered chunk set. Only vectors produced
  // by the ACTIVE embedder are comparable — after switching providers, chunks
  // not yet re-indexed (npm run db:reindex) fall back to keyword scoring
  // instead of polluting results with cross-space similarities.
  const embedder = getEmbedder();
  let vectorRows: { id: string; sourceId: string; content: string; similarity: number }[] = [];
  try {
    const [queryVec] = await embedder.embed([query]);
    const similarity = sql<number>`1 - (${cosineDistance(schema.sourceChunks.embedding, queryVec)})`;
    vectorRows = await db
      .select({
        id: schema.sourceChunks.id,
        sourceId: schema.sourceChunks.sourceId,
        content: schema.sourceChunks.content,
        similarity,
      })
      .from(schema.sourceChunks)
      .where(
        and(
          inArray(schema.sourceChunks.sourceId, sourceIds),
          sql`${schema.sourceChunks.metadata}->>'embedder' = ${embedder.name}`,
        ),
      )
      .orderBy(desc(similarity))
      .limit(limit * 3);
  } catch {
    vectorRows = [];
  }

  // 3. Keyword scoring over ALL candidate chunks (independent signal), with
  // vector similarity merged in where the active embedder produced a vector.
  const terms = query
    .toLowerCase()
    .split(/[^a-zäöüéèàêç0-9]+/)
    .filter((w) => w.length > 3);
  const similarityById = new Map(vectorRows.map((r) => [r.id, r.similarity]));
  const allChunks = (
    await db
      .select({
        id: schema.sourceChunks.id,
        sourceId: schema.sourceChunks.sourceId,
        content: schema.sourceChunks.content,
      })
      .from(schema.sourceChunks)
      .where(inArray(schema.sourceChunks.sourceId, sourceIds))
  ).map((c) => ({ ...c, similarity: similarityById.get(c.id) ?? 0 }));

  const scored = allChunks.map((chunk) => {
    const lower = chunk.content.toLowerCase();
    let keywordScore = 0;
    for (const term of terms) if (lower.includes(term)) keywordScore += 1;
    const normKeyword = terms.length > 0 ? keywordScore / terms.length : 0;
    return { ...chunk, score: 0.6 * chunk.similarity + 0.4 * normKeyword };
  });

  scored.sort((a, b) => b.score - a.score);

  const perSource = new Map<string, number>();
  const results: RetrievedPassage[] = [];
  for (const chunk of scored) {
    if (results.length >= limit) break;
    // At most 2 chunks per source, for diversity.
    const count = perSource.get(chunk.sourceId) ?? 0;
    if (count >= 2) continue;
    perSource.set(chunk.sourceId, count + 1);
    const src = sourceById.get(chunk.sourceId);
    if (!src) continue;
    results.push({
      sourceId: chunk.sourceId,
      sourceTitle: src.title,
      authorityName: src.authorityName,
      content: chunk.content,
    });
  }
  return results;
}
