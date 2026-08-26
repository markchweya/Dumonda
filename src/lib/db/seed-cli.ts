/** CLI entry: npm run db:seed */
import { getDb } from "./index";
import { runSeed } from "./seed";

async function main() {
  const db = await getDb();
  await runSeed(db);
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
