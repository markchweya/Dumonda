/**
 * Decisions about the database connection that depend only on the
 * environment, kept apart from the client factory so they can be tested
 * without a database.
 */

type Env = Record<string, string | undefined>;

/** A hosted Postgres is configured (rather than the embedded dev engine). */
export function hasHostedDatabase(env: Env = process.env): boolean {
  return Boolean(env.DATABASE_URL && env.DATABASE_URL.trim().length > 0);
}

/**
 * Whether this process runs on a serverless host (Vercel today). There the
 * app directory is read-only and instances come and go, so the embedded
 * engine cannot keep data and each instance must hold few connections.
 */
export function isServerless(env: Env = process.env): boolean {
  return Boolean(env.VERCEL);
}

/**
 * The reason the embedded engine may not be used here, or null. On a
 * serverless host it would try to write under the read-only app folder,
 * or lose every write when the instance recycles; a clear error at the
 * first query beats either.
 */
export function embeddedDatabaseProblem(env: Env = process.env): string | null {
  if (hasHostedDatabase(env) || !isServerless(env)) return null;
  return (
    "DATABASE_URL is not set. The embedded development database cannot run on a " +
    "serverless host: set DATABASE_URL to a Postgres database with pgvector " +
    "(see docs/DEPLOY.md)."
  );
}

export type PoolOptions = { max: number; prepare: boolean; idle_timeout: number };

/**
 * postgres.js options for a connection string.
 *
 * - max: one connection per serverless instance (many instances run at
 *   once, and each idle connection counts against the database's limit),
 *   ten on a long-running server. DATABASE_POOL_MAX overrides either.
 * - prepare: off behind a transaction-mode pooler (PgBouncer, Neon's
 *   "-pooler" hosts, Supabase's port 6543), which cannot keep prepared
 *   statements between transactions.
 * - idle_timeout: close idle connections after 20 s, so a frozen
 *   serverless instance does not hold them.
 */
export function poolOptions(url: string, env: Env = process.env): PoolOptions {
  const fromEnv = Number(env.DATABASE_POOL_MAX);
  const max = Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : isServerless(env) ? 1 : 10;
  const pooled = /-pooler\.|pgbouncer=true|:6543\//.test(url);
  return { max, prepare: !pooled, idle_timeout: 20 };
}
