/** CLI entry: npm run db:migrate */
import { getDb } from "./index";
import { migrateDb } from "./migrate";

async function main() {
  const db = await getDb();
  await migrateDb(db);
  console.log("Migrations applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
