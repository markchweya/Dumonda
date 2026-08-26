/**
 * Re-embeds every source chunk with the currently configured embeddings
 * provider: npm run db:reindex
 *
 * Run this after switching EMBEDDINGS_PROVIDER (e.g. from the dev "hash"
 * embedder to a real endpoint). Chunks record which embedder produced their
 * vector; retrieval only trusts vectors from the active embedder, so a
 * partial re-index degrades gracefully to keyword search instead of mixing
 * incompatible vector spaces.
 */
import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getEmbedder } from "@/lib/retrieval/embeddings";

const BATCH_SIZE = 32;

async function main() {
  const db = await getDb();
  const embedder = getEmbedder();
  console.log(`Re-indexing with embedder "${embedder.name}"…`);

  const chunks = await db
    .select({ id: schema.sourceChunks.id, content: schema.sourceChunks.content })
    .from(schema.sourceChunks)
    .orderBy(asc(schema.sourceChunks.id));

  let done = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedder.embed(batch.map((c) => c.content));
    for (let j = 0; j < batch.length; j++) {
      await db
        .update(schema.sourceChunks)
        .set({ embedding: vectors[j], metadata: { embedder: embedder.name } })
        .where(eq(schema.sourceChunks.id, batch[j].id));
    }
    done += batch.length;
    console.log(`  ${done}/${chunks.length}`);
  }

  console.log(`Done. ${done} chunks re-embedded with "${embedder.name}".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
