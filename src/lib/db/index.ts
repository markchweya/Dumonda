/**
 * Database client factory.
 *
 * Production: set DATABASE_URL to a PostgreSQL instance (Supabase works; the
 * pgvector extension must be available).
 *
 * Development: with no DATABASE_URL, an embedded PostgreSQL (PGlite) runs
 * in-process with data stored under ./.data/dumonda. Same SQL, same Drizzle
 * schema, same migrations — nothing to install.
 */
import fs from "node:fs";
import path from "node:path";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { embeddedDatabaseProblem, poolOptions } from "./config";
import * as schema from "./schema";

export type Db =
  | PgliteDatabase<typeof schema>
  | PostgresJsDatabase<typeof schema>;

// Next.js dev reloads modules; keep one connection per process.
const globalForDb = globalThis as unknown as {
  __dumondaDb?: Promise<Db>;
};

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url && url.trim().length > 0) {
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const postgres = (await import("postgres")).default;
    const client = postgres(url, poolOptions(url));
    return drizzle(client, { schema });
  }

  const problem = embeddedDatabaseProblem();
  if (problem) throw new Error(problem);

  const { PGlite } = await import("@electric-sql/pglite");
  const { vector } = await import("@electric-sql/pglite/vector");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dataDir =
    process.env.DUMONDA_DATA_DIR ?? path.join(process.cwd(), ".data", "dumonda");
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir, { extensions: { vector } });
  const db = drizzle(client, { schema });
  await ensureMigrated(db);
  return db;
}

/** Applies migrations + seed automatically for the embedded dev database. */
async function ensureMigrated(db: PgliteDatabase<typeof schema>) {
  const { migrateDb } = await import("./migrate");
  const { seedIfEmpty } = await import("./seed");
  await migrateDb(db);
  await seedIfEmpty(db);
}

export function getDb(): Promise<Db> {
  if (!globalForDb.__dumondaDb) {
    globalForDb.__dumondaDb = createDb();
  }
  return globalForDb.__dumondaDb;
}

export { schema };
