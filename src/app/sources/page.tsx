import { asc } from "drizzle-orm";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { getDb, schema } from "@/lib/db";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sources" };

export default async function SourcesPage() {
  const db = await getDb();
  const sources = await db
    .select()
    .from(schema.sources)
    .orderBy(asc(schema.sources.authorityName));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Source registry</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">
        Every administrative claim in Dumonda is traceable to an entry in this
        registry — official portals of the Confederation, cantons,
        municipalities and official service providers. Sources labelled
        “verified” have been checked against the live official page by a
        reviewer; “seed data” entries were prepared during development and are
        pending that verification.
      </p>
      <div className="mt-8 space-y-3">
        {sources.map((s) => {
          const verified = s.verification === "verified";
          return (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{s.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {s.authorityName}
                    {s.canton ? ` · Canton ${s.canton}` : " · applies nationally"}
                  </p>
                </div>
                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (verified ? "bg-verified-soft text-verified" : "bg-amber-soft text-amber-ink")
                  }
                >
                  {verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {verified ? "Verified" : "Seed data — pending verification"}
                </span>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
              >
                {s.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
