import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { EVENT_TYPES } from "@/lib/events/taxonomy";
import { Card } from "@/components/ui";

export default async function AdminOverviewPage() {
  const db = await getDb();

  const [sourceCount] = await db.select({ n: sql<number>`count(*)` }).from(schema.sources);
  const [verifiedCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.sources)
    .where(eq(schema.sources.verification, "verified"));
  const [ruleCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.rules)
    .where(eq(schema.rules.active, true));
  const [pendingChanges] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.sourceChangeEvents)
    .where(eq(schema.sourceChangeEvents.status, "pending_review"));
  const [eventCount] = await db.select({ n: sql<number>`count(*)` }).from(schema.lifeEvents);
  const unanswered = await db
    .select()
    .from(schema.analyticsEvents)
    .where(eq(schema.analyticsEvents.name, "unanswered_query"))
    .orderBy(desc(schema.analyticsEvents.createdAt))
    .limit(1);

  const stats = [
    { label: "Sources in registry", value: Number(sourceCount.n), href: "/admin/sources" },
    { label: "Verified sources", value: Number(verifiedCount.n), href: "/admin/sources" },
    { label: "Active rules", value: Number(ruleCount.n), href: "/admin/rules" },
    { label: "Life-event types", value: EVENT_TYPES.length, href: "/admin/events" },
    { label: "Changes awaiting review", value: Number(pendingChanges.n), href: "/admin/review" },
    { label: "User life events created", value: Number(eventCount.n), href: "/admin" },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-all hover:border-ink/25">
              <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-6 p-5">
        <p className="font-medium">Knowledge health</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Sources marked “seed data” were created during development and must be
          fetched and verified through the ingestion pipeline before they can be
          labelled verified in the product. Unanswered user queries
          {unanswered.length > 0 ? " are being recorded" : " will be recorded"} in
          analytics to prioritise which life events to build next.
        </p>
      </Card>
    </div>
  );
}
