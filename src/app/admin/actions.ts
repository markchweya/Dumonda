"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { ingestSource } from "@/lib/sources/ingest";

const addSourceSchema = z.object({
  title: z.string().min(3).max(300),
  url: z.string().url().max(1000),
  authorityName: z.string().min(2).max(200),
  authorityLevel: z.enum(["federal", "cantonal", "municipal", "private_public_service"]),
  canton: z.string().max(2).optional().or(z.literal("")),
  municipality: z.string().max(120).optional().or(z.literal("")),
  language: z.enum(["en", "de", "fr", "it"]),
  sourceType: z.enum([
    "federal_government",
    "canton",
    "commune",
    "federal_law",
    "ordinance",
    "official_service_portal",
    "official_public_institution",
    "official_open_data",
  ]),
  eventTags: z.string().max(500),
});

export async function addSourceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = addSourceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const d = parsed.data;
  const db = await getDb();
  await db
    .insert(schema.sources)
    .values({
      id: newId("src"),
      title: d.title,
      authorityName: d.authorityName,
      authorityLevel: d.authorityLevel,
      canton: d.canton || null,
      municipality: d.municipality || null,
      url: d.url,
      sourceType: d.sourceType,
      language: d.language,
      eventTags: d.eventTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      verification: "pending_review",
    })
    .onConflictDoNothing();
  revalidatePath("/admin/sources");
}

export async function ingestSourceAction(sourceId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const result = await ingestSource(sourceId);
  revalidatePath("/admin/sources");
  return { ok: result.ok, message: result.message };
}

export async function setSourceVerificationAction(
  sourceId: string,
  verification: "verified" | "disabled" | "pending_review",
): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  await db
    .update(schema.sources)
    .set({
      verification,
      lastVerifiedAt: verification === "verified" ? new Date() : undefined,
    })
    .where(eq(schema.sources.id, sourceId));
  revalidatePath("/admin/sources");
  revalidatePath("/sources");
}

export async function resolveChangeAction(
  changeId: string,
  status: "accepted" | "dismissed",
): Promise<void> {
  const session = await requireAdmin();
  const db = await getDb();
  const [change] = await db
    .select()
    .from(schema.sourceChangeEvents)
    .where(eq(schema.sourceChangeEvents.id, changeId))
    .limit(1);
  if (!change) return;
  await db
    .update(schema.sourceChangeEvents)
    .set({ status, reviewedBy: session.email, reviewedAt: new Date() })
    .where(eq(schema.sourceChangeEvents.id, changeId));
  if (status === "accepted") {
    // Accepting applies the new content (chunks rebuilt, checksum updated);
    // verification returns to pending until a human re-verifies.
    await ingestSource(change.sourceId, { applyChanges: true });
  }
  revalidatePath("/admin/review");
}

export async function toggleRuleAction(ruleId: string, active: boolean): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  await db.update(schema.rules).set({ active }).where(eq(schema.rules.id, ruleId));
  revalidatePath("/admin/rules");
}
