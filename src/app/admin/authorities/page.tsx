import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Badge, Card } from "@/components/ui";

export default async function AdminAuthoritiesPage() {
  const db = await getDb();
  const authorities = await db
    .select()
    .from(schema.authorities)
    .orderBy(asc(schema.authorities.level), asc(schema.authorities.name));

  return (
    <div className="space-y-3">
      {authorities.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{a.name}</p>
            <Badge tone="neutral">{a.level}</Badge>
            {a.canton && <Badge tone="neutral">{a.canton}</Badge>}
          </div>
          <p className="mt-1 text-xs text-ink-soft">{a.officialDomain}</p>
          {a.supportedServices.length > 0 && (
            <p className="mt-1 text-xs text-ink-soft">Services: {a.supportedServices.join(", ")}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
