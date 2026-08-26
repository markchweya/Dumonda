import { asc, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Badge, Card, Input } from "@/components/ui";
import { SourceRowActions } from "@/components/admin/source-row-actions";
import { addSourceAction } from "@/app/admin/actions";

export default async function AdminSourcesPage() {
  const db = await getDb();
  const sources = await db.select().from(schema.sources).orderBy(asc(schema.sources.title));
  const chunkCounts = await db
    .select({ sourceId: schema.sourceChunks.sourceId, n: sql<number>`count(*)` })
    .from(schema.sourceChunks)
    .groupBy(schema.sourceChunks.sourceId);
  const chunksBySource = new Map(chunkCounts.map((c) => [c.sourceId, Number(c.n)]));

  const verificationTone: Record<string, "verified" | "seed" | "neutral" | "danger"> = {
    verified: "verified",
    seed_demo: "seed",
    pending_review: "neutral",
    stale: "danger",
    disabled: "danger",
  };
  const verificationLabel: Record<string, string> = {
    verified: "Verified",
    seed_demo: "Seed data",
    pending_review: "Pending review",
    stale: "Stale",
    disabled: "Disabled",
  };

  const selectClass =
    "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-ink/40 transition";

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="font-semibold">Add official source</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Only add pages from official domains (admin.ch, ch.ch, cantonal and
          municipal sites, official service providers). Fetching respects
          robots.txt and rate limits; content is reviewed before approval.
        </p>
        <form action={addSourceAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <Input name="title" placeholder="Title" required minLength={3} />
          <Input name="url" type="url" placeholder="https://www.ch.ch/en/…" required />
          <Input name="authorityName" placeholder="Authority name" required />
          <select name="authorityLevel" className={selectClass} defaultValue="federal">
            <option value="federal">Federal</option>
            <option value="cantonal">Cantonal</option>
            <option value="municipal">Municipal</option>
            <option value="private_public_service">Official service provider</option>
          </select>
          <Input name="canton" placeholder="Canton code (e.g. BS) — optional" maxLength={2} />
          <Input name="municipality" placeholder="Municipality — optional" />
          <select name="language" className={selectClass} defaultValue="en">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
          <select name="sourceType" className={selectClass} defaultValue="official_service_portal">
            <option value="federal_government">Federal government</option>
            <option value="canton">Canton</option>
            <option value="commune">Commune</option>
            <option value="federal_law">Federal law</option>
            <option value="ordinance">Ordinance</option>
            <option value="official_service_portal">Official service portal</option>
            <option value="official_public_institution">Official public institution</option>
            <option value="official_open_data">Official open data</option>
          </select>
          <div className="sm:col-span-2">
            <Input name="eventTags" placeholder="Life-event tags, comma separated (e.g. move_between_cantons, child_birth)" />
          </div>
          <div>
            <button
              type="submit"
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors cursor-pointer"
            >
              Add source
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {sources.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{s.title}</p>
                  <Badge tone={verificationTone[s.verification] ?? "neutral"}>
                    {verificationLabel[s.verification] ?? s.verification}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-xs text-ink-soft">{s.url}</p>
                <p className="mt-1.5 text-xs text-ink-soft">
                  {s.authorityName}
                  {s.canton ? ` · ${s.canton}` : ""} · {chunksBySource.get(s.id) ?? 0} chunks ·{" "}
                  {s.eventTags.length > 0 ? `events: ${s.eventTags.join(", ")}` : "no event tags"}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Fetched: {s.fetchedAt ? s.fetchedAt.toISOString().slice(0, 10) : "never"} · Verified:{" "}
                  {s.lastVerifiedAt ? s.lastVerifiedAt.toISOString().slice(0, 10) : "never"} · Checksum:{" "}
                  {s.checksum ? s.checksum.slice(0, 10) : "none"}
                </p>
              </div>
              <SourceRowActions sourceId={s.id} verification={s.verification} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
