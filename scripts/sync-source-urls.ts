/**
 * Syncs source URLs from the seed definitions into an existing database
 * (npm run db:sync-urls). Useful after correcting a stale official URL in
 * seed-data.ts: content, checksum and verification state are untouched.
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { SEED_SOURCES } from "@/lib/db/seed-data";

async function main() {
  const db = await getDb();
  let updated = 0;
  for (const seed of SEED_SOURCES) {
    const [existing] = await db
      .select({ id: schema.sources.id, url: schema.sources.url })
      .from(schema.sources)
      .where(eq(schema.sources.id, seed.id))
      .limit(1);
    if (existing && existing.url !== seed.url) {
      await db.update(schema.sources).set({ url: seed.url }).where(eq(schema.sources.id, seed.id));
      console.log(`${seed.id}: ${existing.url} → ${seed.url}`);
      updated++;
    }
  }
  console.log(`${updated} URL(s) updated.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
