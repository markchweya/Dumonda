import { desc, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Badge, Card } from "@/components/ui";
import { ReviewActions } from "@/components/admin/review-actions";

export default async function AdminReviewPage() {
  const db = await getDb();
  const changes = await db
    .select()
    .from(schema.sourceChangeEvents)
    .orderBy(desc(schema.sourceChangeEvents.detectedAt))
    .limit(50);

  const sourceIds = [...new Set(changes.map((c) => c.sourceId))];
  const sources = sourceIds.length
    ? await db.select().from(schema.sources).where(inArray(schema.sources.id, sourceIds))
    : [];
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  const pending = changes.filter((c) => c.status === "pending_review");
  const resolved = changes.filter((c) => c.status !== "pending_review");

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          When a re-fetched official page differs from its stored checksum, the
          change lands here instead of silently replacing knowledge. Accepting a
          change re-ingests the page and returns the source to pending
          verification; dismissing keeps the previous content.
        </p>
      </Card>

      <section>
        <h2 className="text-base font-semibold">Awaiting review</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No source changes waiting for review.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((c) => {
              const source = sourceById.get(c.sourceId);
              return (
                <Card key={c.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{source?.title ?? c.sourceId}</p>
                    <Badge tone="seed">changed content</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Detected {c.detectedAt.toISOString().slice(0, 16).replace("T", " ")} · {c.diffSummary}
                  </p>
                  {c.aiChangeAssessment && (
                    <p className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-xs text-ink-soft">
                      {c.aiChangeAssessment}
                    </p>
                  )}
                  <div className="mt-3">
                    <ReviewActions changeId={c.id} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section>
          <h2 className="text-base font-semibold">Resolved</h2>
          <div className="mt-3 space-y-2">
            {resolved.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <p className="text-sm">{sourceById.get(c.sourceId)?.title ?? c.sourceId}</p>
                <p className="text-xs text-ink-soft">
                  {c.status} by {c.reviewedBy ?? "unknown"}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
