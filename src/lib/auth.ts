import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";

const SESSION_COOKIE = "dumonda_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// ─── Passwords ───────────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface SessionInfo {
  sessionId: string;
  userId: string | null;
  email: string | null;
  role: "user" | "admin" | null;
}

/**
 * Returns the current session, creating a guest session if none exists.
 * Guests can ask questions and get checklists; an account is only needed to
 * keep them.
 */
export async function getOrCreateSession(): Promise<SessionInfo> {
  const existing = await getSession();
  if (existing) return existing;

  const db = await getDb();
  const id = newId("ses");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.sessions).values({ id, userId: null, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return { sessionId: id, userId: null, email: null, role: null };
}

export async function getSession(): Promise<SessionInfo | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const db = await getDb();
  const rows = await db
    .select({
      sessionId: schema.sessions.id,
      expiresAt: schema.sessions.expiresAt,
      userId: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
    })
    .from(schema.sessions)
    .leftJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(eq(schema.sessions.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
    return null;
  }
  return {
    sessionId: row.sessionId,
    userId: row.userId,
    email: row.email,
    role: (row.role as "user" | "admin" | null) ?? null,
  };
}

/** Links the current (guest) session and its life events to a user account. */
export async function attachSessionToUser(sessionId: string, userId: string) {
  const db = await getDb();
  await db
    .update(schema.sessions)
    .set({ userId })
    .where(eq(schema.sessions.id, sessionId));
  await db
    .update(schema.lifeEvents)
    .set({ userId })
    .where(eq(schema.lifeEvents.sessionId, sessionId));
}

export async function destroySession() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (id) {
    const db = await getDb();
    // Guest uploads would be orphaned by the session's FK set-null — remove
    // their extracted text with the session (privacy by design).
    await db
      .delete(schema.documents)
      .where(and(eq(schema.documents.sessionId, id), isNull(schema.documents.userId)));
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }
  store.delete(SESSION_COOKIE);
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new AuthError("Admin access required");
  }
  return session;
}

export class AuthError extends Error {}
