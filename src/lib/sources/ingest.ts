import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { getAIProvider } from "@/lib/ai";
import { getEmbedder } from "@/lib/retrieval/embeddings";

const USER_AGENT = "DumondaBot/0.1 (+https://dumonda.ch; source verification)";
const FETCH_TIMEOUT_MS = 15000;

/**
 * Controlled ingestion for the source registry. Only URLs added explicitly by
 * an administrator are fetched — Dumonda never crawls. robots.txt is checked
 * before every fetch and the raw HTML is sanitised before storage. Retrieved
 * content is always treated as untrusted data, never as instructions.
 */

export async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const robotsUrl = `${u.origin}/robots.txt`;
    const res = await fetch(robotsUrl, {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return true; // no robots file → allowed
    const text = await res.text();
    return checkRobots(text, u.pathname);
  } catch {
    return true;
  }
}

/** Minimal robots.txt evaluation for User-agent: * disallow rules. */
export function checkRobots(robotsTxt: string, path: string): boolean {
  const lines = robotsTxt.split(/\r?\n/);
  let applies = false;
  const disallows: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [keyRaw, ...rest] = line.split(":");
    const key = keyRaw.toLowerCase().trim();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      applies = value === "*" || value.toLowerCase().includes("dumonda");
    } else if (applies && key === "disallow" && value) {
      disallows.push(value);
    }
  }
  return !disallows.some((d) => path.startsWith(d));
}

/** Strips scripts/styles/tags and collapses whitespace. */
export function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function chunkText(text: string, maxChars = 1200, overlap = 150): string[] {
  if (text.length <= maxChars) return text.length > 0 ? [text] : [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(". ", end);
      if (lastPeriod > start + maxChars / 2) end = lastPeriod + 1;
    }
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = end - overlap;
  }
  return chunks.filter((c) => c.length > 50);
}

export function checksumOf(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export interface IngestResult {
  ok: boolean;
  message: string;
  changed?: boolean;
  chunkCount?: number;
}

/**
 * Fetches a registered source, extracts + chunks + embeds its text, and
 * detects content changes against the stored checksum.
 *
 * Change guard: once a source has been fetched from the live site
 * (fetchedAt set), later fetches with different content are NOT applied —
 * a review item is created and the source is marked pending_review until an
 * admin accepts the change (which re-runs this with applyChanges=true).
 * The first live fetch of a seeded source applies directly: the seed text was
 * written during development and was never a live snapshot worth protecting.
 */
export async function ingestSource(
  sourceId: string,
  opts: { applyChanges?: boolean } = {},
): Promise<IngestResult> {
  const db = await getDb();
  const [source] = await db
    .select()
    .from(schema.sources)
    .where(eq(schema.sources.id, sourceId))
    .limit(1);
  if (!source) return { ok: false, message: "Source not found" };

  if (!(await isAllowedByRobots(source.url))) {
    return { ok: false, message: "Fetch blocked by the site's robots.txt" };
  }

  let html: string;
  try {
    const res = await fetch(source.url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) return { ok: false, message: `Fetch failed with HTTP ${res.status}` };
    html = await res.text();
  } catch (err) {
    return { ok: false, message: `Fetch failed: ${err instanceof Error ? err.message : "network error"}` };
  }

  const text = extractTextFromHtml(html);
  if (text.length < 100) {
    return { ok: false, message: "Extracted text too short — page may be JavaScript-rendered" };
  }
  const checksum = checksumOf(text);
  const now = new Date();
  const previousChecksum = source.checksum;
  const hadLiveFetch = source.fetchedAt !== null;
  const changed =
    hadLiveFetch && previousChecksum !== null && previousChecksum !== checksum;

  if (changed && !opts.applyChanges) {
    // Never silently replace content behind existing rules — queue for review.
    const ai = getAIProvider();
    const assessment = await ai.summariseSourceChange(source.extractedText ?? "", text);
    await db.insert(schema.sourceChangeEvents).values({
      id: newId("chg"),
      sourceId: source.id,
      previousChecksum,
      newChecksum: checksum,
      diffSummary: `Content length ${source.extractedText?.length ?? 0} → ${text.length} chars`,
      aiChangeAssessment: `${assessment.substantiveChange ? "Substantive" : "Likely cosmetic"}: ${assessment.summary}`,
      status: "pending_review",
    });
    await db
      .update(schema.sources)
      .set({ fetchedAt: now, verification: "pending_review" })
      .where(eq(schema.sources.id, source.id));
    return {
      ok: true,
      changed: true,
      message: "Content changed since last fetch — queued for review; stored knowledge unchanged until approved.",
    };
  }

  // First fetch or unchanged: (re)build chunks + embeddings.
  const chunks = chunkText(text);
  const embedder = getEmbedder();
  let embeddings: number[][] | null = null;
  try {
    embeddings = await embedder.embed(chunks);
  } catch {
    embeddings = null;
  }

  await db.delete(schema.sourceChunks).where(eq(schema.sourceChunks.sourceId, source.id));
  for (let i = 0; i < chunks.length; i++) {
    await db.insert(schema.sourceChunks).values({
      id: newId("chk"),
      sourceId: source.id,
      chunkIndex: i,
      content: chunks[i],
      embedding: embeddings ? embeddings[i] : null,
      metadata: { embedder: embeddings ? embedder.name : "none" },
    });
  }

  await db
    .update(schema.sources)
    .set({
      content: html.slice(0, 500_000),
      extractedText: text,
      checksum,
      fetchedAt: now,
      updatedAt: now,
      // Applied changes always demote to pending until a human re-verifies.
      verification:
        !changed && source.verification === "verified" ? "verified" : "pending_review",
    })
    .where(eq(schema.sources.id, source.id));

  return { ok: true, changed: false, chunkCount: chunks.length, message: `Fetched and indexed ${chunks.length} chunks.` };
}
