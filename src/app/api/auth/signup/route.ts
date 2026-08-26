import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { attachSessionToUser, getOrCreateSession, hashPassword } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";

const bodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const email = parsed.data.email.toLowerCase().trim();
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const userId = newId("usr");
  await db.insert(schema.users).values({
    id: userId,
    email,
    passwordHash: hashPassword(parsed.data.password),
    role: "user",
  });

  // Claim the current guest session so existing checklists are kept.
  const session = await getOrCreateSession();
  await attachSessionToUser(session.sessionId, userId);

  return NextResponse.json({ ok: true });
}
