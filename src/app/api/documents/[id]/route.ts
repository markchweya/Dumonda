import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getOrCreateSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

/** Deletes an uploaded document's extracted text and analysis permanently. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getOrCreateSession();
  const db = await getDb();
  const [doc] = await db
    .select({ id: schema.documents.id, sessionId: schema.documents.sessionId, userId: schema.documents.userId })
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .limit(1);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owns =
    (doc.userId && doc.userId === session.userId) ||
    (doc.sessionId && doc.sessionId === session.sessionId);
  if (!owns) return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  await db.delete(schema.documents).where(eq(schema.documents.id, id));
  return NextResponse.json({ ok: true });
}
