/**
 * Batch ingestion: npm run ingest:all
 *
 * Fetches and indexes every enabled source in the registry, sequentially with
 * a politeness delay between requests. Respects robots.txt per fetch (inside
 * ingestSource). Prints a per-source result and a summary; failures never
 * touch previously stored knowledge.
 *
 * Human verification remains a separate, deliberate step: this script never
 * sets a source to "verified" — use /admin/sources for that after reviewing
 * the fetched content.
 */
import { ne } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ingestSource } from "@/lib/sources/ingest";

const DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const db = await getDb();
  const sources = await db
    .select({ id: schema.sources.id, title: schema.sources.title, url: schema.sources.url })
    .from(schema.sources)
    .where(ne(schema.sources.verification, "disabled"));

  console.log(`Ingesting ${sources.length} sources (politeness delay ${DELAY_MS}ms)…\n`);
  let ok = 0;
  let changed = 0;
  let failed = 0;

  for (const [i, source] of sources.entries()) {
    process.stdout.write(`[${i + 1}/${sources.length}] ${source.title}\n    ${source.url}\n`);
    try {
      const result = await ingestSource(source.id);
      if (!result.ok) failed++;
      else if (result.changed) changed++;
      else ok++;
      console.log(`    → ${result.message}`);
    } catch (err) {
      failed++;
      console.log(`    → Unexpected error: ${err instanceof Error ? err.message : err}`);
    }
    if (i < sources.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. Indexed: ${ok} · Queued for change review: ${changed} · Failed: ${failed}`);
  console.log("Next step: review fetched content in /admin/sources and approve sources as verified.");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
