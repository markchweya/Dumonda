/**
 * Marks reviewed sources as verified: npm run sources:approve -- <src_id> …
 *
 * Guardrails: a source can only be approved if it has live-fetched content
 * (fetchedAt set) that does not look like an error page. This records the
 * same decision the /admin/sources "Approve as verified" button records —
 * run it only after reviewing the content (npm run sources:review).
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { looksLikeErrorPage } from "@/lib/sources/ingest";

async function main() {
  const ids = process.argv.slice(2).filter((a) => a.startsWith("src_"));
  if (ids.length === 0) {
    console.error("Usage: npm run sources:approve -- <src_id> [<src_id> …]");
    process.exit(1);
  }
  const db = await getDb();
  let approved = 0;

  for (const id of ids) {
    const [source] = await db.select().from(schema.sources).where(eq(schema.sources.id, id)).limit(1);
    if (!source) {
      console.log(`${id}: not found — skipped`);
      continue;
    }
    if (!source.fetchedAt || !source.extractedText) {
      console.log(`${id}: REFUSED — no live-fetched content to verify`);
      continue;
    }
    if (looksLikeErrorPage(source.extractedText)) {
      console.log(`${id}: REFUSED — stored content looks like an error page`);
      continue;
    }
    await db
      .update(schema.sources)
      .set({ verification: "verified", lastVerifiedAt: new Date() })
      .where(eq(schema.sources.id, id));
    console.log(`${id}: verified`);
    approved++;
  }
  console.log(`${approved} source(s) approved.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
