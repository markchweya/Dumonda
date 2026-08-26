import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { EVENT_TYPES } from "@/lib/events/taxonomy";
import { Badge, Card } from "@/components/ui";

export default async function AdminEventsPage() {
  const db = await getDb();
  const ruleCounts = await db
    .select({ eventType: schema.rules.eventType, n: sql<number>`count(*)` })
    .from(schema.rules)
    .where(eq(schema.rules.active, true))
    .groupBy(schema.rules.eventType);
  const rulesByEvent = new Map(ruleCounts.map((r) => [r.eventType, Number(r.n)]));

  return (
    <div className="space-y-3">
      <Card className="p-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          The event taxonomy lives in code
          (<code className="rounded bg-stone-100 px-1.5 py-0.5">src/lib/events/taxonomy.ts</code>)
          so classification, clarification and rules stay in sync. Event types
          without active rules fall back to an honest &quot;no verified guidance
          yet&quot; state instead of generated guesses.
        </p>
      </Card>
      {EVENT_TYPES.map((e) => (
        <Card key={e.id} className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-medium">{e.id}</p>
            <Badge tone="neutral">{e.category}</Badge>
            {e.highConsequence && <Badge tone="danger">high consequence</Badge>}
            <Badge tone={rulesByEvent.get(e.id) ? "verified" : "seed"}>
              {rulesByEvent.get(e.id) ?? 0} active rules
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">{e.description}</p>
          <p className="mt-1.5 text-xs text-ink-soft">
            Relevant facts: {e.relevantFacts.length > 0 ? e.relevantFacts.join(", ") : "none"}
          </p>
        </Card>
      ))}
    </div>
  );
}
