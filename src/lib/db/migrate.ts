/**
 * Applies SQL migrations from ./drizzle to whichever Postgres flavour is in
 * use (embedded PGlite in dev, real Postgres/Supabase in production).
 */
import path from "node:path";
import type { Db } from "./index";

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

export async function migrateDb(db: Db) {
  // The two drivers ship separate migrator entrypoints with identical APIs.
  if (isPglite(db)) {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: MIGRATIONS_FOLDER });
  }
}

function isPglite(db: Db): db is import("drizzle-orm/pglite").PgliteDatabase<
  typeof import("./schema")
> {
  // PGlite's session client exposes `dataDir`; postgres-js does not.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (db as any).$client;
  return typeof client?.dataDir !== "undefined" || client?.constructor?.name === "PGlite";
}
