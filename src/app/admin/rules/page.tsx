import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Badge, Card } from "@/components/ui";
import { RuleToggle } from "@/components/admin/rule-toggle";
import type { TaskTemplate } from "@/lib/rules/types";

export default async function AdminRulesPage() {
  const db = await getDb();
  const rules = await db
    .select()
    .from(schema.rules)
    .orderBy(asc(schema.rules.eventType), asc(schema.rules.id));

  return (
    <div className="space-y-3">
      <Card className="p-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          Rules are the deterministic layer that decides which obligations apply
          — the AI model never invents them. Each rule targets one event type
          and one jurisdiction, has a condition tree over known facts, and emits
          task templates backed by sources. Deactivating a rule takes effect
          immediately for new checklists.
        </p>
      </Card>
      {rules.map((r) => {
        const actions = r.actions as TaskTemplate[];
        return (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm font-medium">{r.id}</p>
                <Badge tone="neutral">{r.eventType}</Badge>
                <Badge tone="neutral">{r.jurisdiction}</Badge>
                <Badge tone="neutral">v{r.version}</Badge>
                {!r.active && <Badge tone="danger">inactive</Badge>}
              </div>
              <RuleToggle ruleId={r.id} active={r.active} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Conditions: <code className="rounded bg-stone-100 px-1.5 py-0.5">{JSON.stringify(r.conditions)}</code>
            </p>
            <div className="mt-2 text-xs text-ink-soft">
              {actions.map((a) => (
                <p key={a.title} className="mt-1">
                  <span className="font-medium text-ink">[{a.priority}]</span> {a.title}
                  {a.sourceIds.length > 0 ? ` — sources: ${a.sourceIds.join(", ")}` : ""}
                </p>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
