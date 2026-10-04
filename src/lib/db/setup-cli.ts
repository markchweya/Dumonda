/**
 * CLI entry: npm run db:setup. Applies migrations, then seeds, in one go:
 * what a new hosted database needs once, and what every deploy can run
 * again safely (both steps skip what is already there).
 */
import { getDb } from "./index";
import { migrateDb } from "./migrate";
import { seedIfEmpty } from "./seed";

async function main() {
  const db = await getDb();
  await migrateDb(db);
  console.log("Migrations applied.");
  await seedIfEmpty(db);
  console.log("Seed checked (reference data and admin account).");
  process.exit(0);
}

main().catch((err) => {
  // Drizzle wraps the driver's error ("Failed query: ..."); the cause is
  // what says why (a refused connection, a missing extension, a password).
  console.error(err instanceof Error ? err.message : err);
  if (err instanceof Error && err.cause) console.error(`Cause: ${String(err.cause)}`);
  process.exit(1);
});
