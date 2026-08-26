import { ne } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ingestSource } from "./ingest";

const DELAY_MS = 2000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RefetchSummary {
  checked: number;
  due: number;
  indexed: number;
  queuedForReview: number;
  failed: number;
  results: { sourceId: string; title: string; message: string }[];
}

/**
 * Change monitoring: re-fetches every source whose refresh interval has
 * elapsed. Content changes are never applied silently — ingestSource queues
 * them in the admin review queue. Called by /api/cron/refetch or the
 * cron:refetch CLI on whatever scheduler hosts the deployment.
 */
export async function refetchDueSources(now: Date = new Date()): Promise<RefetchSummary> {
  const db = await getDb();
  const sources = await db
    .select({
      id: schema.sources.id,
      title: schema.sources.title,
      fetchedAt: schema.sources.fetchedAt,
      refreshIntervalDays: schema.sources.refreshIntervalDays,
    })
    .from(schema.sources)
    .where(ne(schema.sources.verification, "disabled"));

  const due = sources.filter((s) => {
    if (!s.fetchedAt) return true; // never fetched live
    const ageMs = now.getTime() - s.fetchedAt.getTime();
    return ageMs >= s.refreshIntervalDays * 86400000;
  });

  const summary: RefetchSummary = {
    checked: sources.length,
    due: due.length,
    indexed: 0,
    queuedForReview: 0,
    failed: 0,
    results: [],
  };

  for (const [i, source] of due.entries()) {
    try {
      const result = await ingestSource(source.id);
      if (!result.ok) summary.failed++;
      else if (result.changed) summary.queuedForReview++;
      else summary.indexed++;
      summary.results.push({ sourceId: source.id, title: source.title, message: result.message });
    } catch (err) {
      summary.failed++;
      summary.results.push({
        sourceId: source.id,
        title: source.title,
        message: `Unexpected error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
    if (i < due.length - 1) await sleep(DELAY_MS);
  }

  return summary;
}
