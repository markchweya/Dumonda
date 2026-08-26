import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { destroySession, getSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

const profileSchema = z.object({
  preferredLanguage: z.enum(["en", "de", "fr", "it"]).optional(),
  canton: z.string().max(60).nullish(),
  municipality: z.string().max(120).nullish(),
  nationalityCategory: z.enum(["swiss", "eu_efta", "third_country"]).nullish(),
  residencePermit: z.enum(["none", "L", "B", "C", "other"]).nullish(),
  employmentStatus: z
    .enum(["employed", "self_employed", "student", "unemployed", "retired", "other"])
    .nullish(),
  hasVehicle: z.boolean().nullish(),
  hasChildren: z.boolean().nullish(),
});

/** Update profile (only fields the user chose to share). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });

  const db = await getDb();
  const values = { userId: session.userId, ...parsed.data, updatedAt: new Date() };
  await db
    .insert(schema.profiles)
    .values(values)
    .onConflictDoUpdate({ target: schema.profiles.userId, set: { ...parsed.data, updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

/** Delete account and all associated data (privacy by design). */
export async function DELETE() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const db = await getDb();
  // Cascades remove profile, sessions, life events, tasks, reminders, saved services.
  await db.delete(schema.users).where(eq(schema.users.id, session.userId));
  await destroySession();
  return NextResponse.json({ ok: true });
}
