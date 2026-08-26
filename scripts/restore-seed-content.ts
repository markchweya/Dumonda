/**
 * Restores the labelled seed summaries for sources whose live fetch stored
 * unusable content (soft-404 shells, JS app shells, navigation-only pages):
 * npm run sources:restore -- src_id_a src_id_b …
 *
 * Resets extractedText, checksum and chunks from the seed definition, marks
 * the source seed_demo again and clears fetchedAt so the honest "pending
 * verification" labelling applies.
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { SEED_SOURCES } from "@/lib/db/seed-data";
import { checksumOf, chunkText } from "@/lib/sources/ingest";
import { getEmbedder } from "@/lib/retrieval/embeddings";

async function main() {
  const ids = process.argv.slice(2).filter((a) => a.startsWith("src_"));
  if (ids.length === 0) {
    console.error("Usage: npm run sources:restore -- <src_id> [<src_id> …]");
    process.exit(1);
  }
  const db = await getDb();
  const embedder = getEmbedder();

  for (const id of ids) {
    const seed = SEED_SOURCES.find((s) => s.id === id);
    if (!seed) {
      console.log(`${id}: no seed definition — skipped`);
      continue;
    }
    await db
      .update(schema.sources)
      .set({
        extractedText: seed.extractedText,
        content: null,
        checksum: checksumOf(seed.extractedText),
        fetchedAt: null,
        lastVerifiedAt: null,
        verification: "seed_demo",
        metadata: {
          seed: true,
          note: "Restored to seed summary — the live page is not machine-fetchable (JS-rendered or blocked).",
        },
      })
      .where(eq(schema.sources.id, id));

    await db.delete(schema.sourceChunks).where(eq(schema.sourceChunks.sourceId, id));
    const chunks = chunkText(seed.extractedText, 800, 100);
    let embeddings: number[][] | null = null;
    try {
      embeddings = await embedder.embed(chunks);
    } catch {
      embeddings = null;
    }
    for (let i = 0; i < chunks.length; i++) {
      await db.insert(schema.sourceChunks).values({
        id: `${id}_c${i}`,
        sourceId: id,
        chunkIndex: i,
        content: chunks[i],
        embedding: embeddings ? embeddings[i] : null,
        metadata: { embedder: embeddings ? embedder.name : "none", seed: true },
      });
    }
    console.log(`${id}: restored to seed summary (${chunks.length} chunks)`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
