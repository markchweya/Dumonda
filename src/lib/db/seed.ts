import { sql } from "drizzle-orm";
import type { Db } from "./index";
import * as schema from "./schema";
import { SEED_AUTHORITIES, SEED_JURISDICTIONS, SEED_RULES, SEED_SOURCES } from "./seed-data";
import { CANTONAL_AUTHORITIES, CANTONAL_RULES, CANTONAL_SOURCES } from "./seed-cantons";
import { chunkText, checksumOf } from "@/lib/sources/ingest";
import { getEmbedder } from "@/lib/retrieval/embeddings";
import { hashPassword } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { adminCredentials } from "./admin-credentials";

/**
 * Seeds reference data (jurisdictions, authorities, sources, rules) and the
 * admin account. Sources are stored with verification = "seed_demo": the seed
 * summaries point at real official domains but were written during development
 * and must be verified through the ingestion pipeline before being labelled
 * "verified". The UI communicates this honestly.
 */
export async function seedIfEmpty(db: Db) {
  const existing = await db.select({ id: schema.sources.id }).from(schema.sources).limit(1);
  if (existing.length > 0) return;
  await runSeed(db);
}

export async function runSeed(db: Db) {
  // Admin account for /admin: from ADMIN_EMAIL / ADMIN_PASSWORD, with the
  // documented defaults allowed only on the embedded dev database. Checked
  // before anything is written: a seed that failed halfway would leave the
  // reference data in place, and seedIfEmpty would never come back for the
  // admin account.
  const { email: adminEmail, password: adminPassword } = adminCredentials();
  const now = new Date();
  const allAuthorities = [...SEED_AUTHORITIES, ...CANTONAL_AUTHORITIES];
  const allSources = [...SEED_SOURCES, ...CANTONAL_SOURCES];
  const allRules = [...SEED_RULES, ...CANTONAL_RULES];

  for (const j of SEED_JURISDICTIONS) {
    await db
      .insert(schema.jurisdictions)
      .values(j)
      .onConflictDoNothing();
  }

  for (const a of allAuthorities) {
    await db
      .insert(schema.authorities)
      .values({
        id: a.id,
        name: a.name,
        level: a.level,
        canton: a.canton ?? null,
        municipality: a.municipality ?? null,
        officialDomain: a.officialDomain,
        supportedServices: a.supportedServices,
      })
      .onConflictDoNothing();
  }

  const embedder = getEmbedder();
  for (const s of allSources) {
    await db
      .insert(schema.sources)
      .values({
        id: s.id,
        title: s.title,
        authorityId: s.authorityId ?? null,
        authorityName: s.authorityName,
        authorityLevel: s.authorityLevel,
        canton: s.canton ?? null,
        country: "CH",
        url: s.url,
        sourceType: s.sourceType,
        language: s.language,
        eventTags: s.eventTags,
        extractedText: s.extractedText,
        checksum: checksumOf(s.extractedText),
        fetchedAt: null,
        lastVerifiedAt: null,
        verification: "seed_demo",
        metadata: { seed: true, note: "Development seed record — content not yet fetched/verified from the live page." },
        createdAt: now,
      })
      .onConflictDoNothing();

    const chunks = chunkText(s.extractedText, 800, 100);
    let embeddings: number[][] | null = null;
    try {
      embeddings = await embedder.embed(chunks);
    } catch {
      embeddings = null;
    }
    for (let i = 0; i < chunks.length; i++) {
      await db
        .insert(schema.sourceChunks)
        .values({
          id: `${s.id}_c${i}`,
          sourceId: s.id,
          chunkIndex: i,
          content: chunks[i],
          embedding: embeddings ? embeddings[i] : null,
          metadata: { embedder: embeddings ? embedder.name : "none", seed: true },
        })
        .onConflictDoNothing();
    }
  }

  for (const r of allRules) {
    await db
      .insert(schema.rules)
      .values({
        id: r.id,
        eventType: r.eventType,
        jurisdiction: r.jurisdiction,
        conditions: r.conditions,
        actions: r.actions,
        sourceIds: r.sourceIds,
        version: r.version,
        active: r.active,
        notes: r.notes ?? null,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(schema.users)
    .values({
      id: newId("usr"),
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
    })
    .onConflictDoNothing();

  await db.execute(sql`SELECT 1`);
}
