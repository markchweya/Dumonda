import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { ArrowRight, Building2, CalendarClock, ShieldAlert, ShieldCheck } from "lucide-react";
import { getDb, schema } from "@/lib/db";
import { evaluateRules } from "@/lib/rules/engine";
import type { ConditionNode, TaskTemplate } from "@/lib/rules/types";
import { GUIDE_BY_SLUG } from "@/lib/guides";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const PRIORITY_LABEL: Record<string, string> = {
  required: "Required",
  may_apply: "May apply",
  recommended: "Recommended",
  information: "Good to know",
};

async function loadGuideData(slug: string) {
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) return null;
  const db = await getDb();
  const ruleRows = await db
    .select()
    .from(schema.rules)
    .where(and(eq(schema.rules.eventType, guide.eventType), eq(schema.rules.active, true)));
  const rules = ruleRows.map((r) => ({
    id: r.id,
    eventType: r.eventType,
    jurisdiction: r.jurisdiction,
    conditions: r.conditions as ConditionNode,
    actions: r.actions as TaskTemplate[],
    sourceIds: r.sourceIds,
    version: r.version,
    active: r.active,
    validFrom: r.validFrom,
    validUntil: r.validUntil,
    notes: r.notes,
  }));
  const tasks = evaluateRules(rules, guide.eventType, guide.facts);
  const sourceIds = [...new Set(tasks.flatMap((t) => t.sourceIds))];
  const sources = sourceIds.length
    ? await db.select().from(schema.sources).where(inArray(schema.sources.id, sourceIds))
    : [];
  const allVerified = sources.length > 0 && sources.every((s) => s.verification === "verified");
  return { guide, tasks, sources, allVerified };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guideSlug: string }>;
}): Promise<Metadata> {
  const { guideSlug } = await params;
  const data = await loadGuideData(guideSlug);
  if (!data) return {};
  return {
    title: data.guide.title,
    description: data.guide.metaDescription,
    // Honest SEO: only ask to be indexed once every cited source is verified.
    robots: { index: data.allVerified, follow: true },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ guideSlug: string }>;
}) {
  const { guideSlug } = await params;
  const data = await loadGuideData(guideSlug);
  if (!data) notFound();
  const { guide, tasks, sources, allVerified } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Dumonda guide</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{guide.title}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{guide.intro}</p>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm">
          <span className="font-medium">Get your personalised version. </span>
          <span className="text-ink-soft">
            Deadlines calculated from your dates, only the steps that apply to you.
          </span>
        </p>
        <Link
          href={`/ask?q=${encodeURIComponent(guide.askQuery)}`}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          Start now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {!allVerified && (
        <p className="mt-4 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-ink">
          Some sources behind this guide are still pending human verification
          against the live official pages. Verify details on the linked official
          websites before acting.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-base font-semibold">
          What applies ({tasks.length} {tasks.length === 1 ? "step" : "steps"})
        </h2>
        <div className="mt-3 space-y-3">
          {tasks.map((task) => (
            <Card key={task.title} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium leading-snug">{task.title}</p>
                <Badge tone={task.priority}>{PRIORITY_LABEL[task.priority]}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{task.description}</p>
              <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-soft">
                {task.deadline?.label && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {task.deadline.label}
                  </span>
                )}
                {task.authorityName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {task.authorityName}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold">Official sources for this guide</h2>
        <div className="mt-3 space-y-2">
          {sources.map((s) => {
            const verified = s.verification === "verified";
            return (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{s.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{s.authorityName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (verified ? "bg-verified-soft text-verified" : "bg-amber-soft text-amber-ink")
                    }
                  >
                    {verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {verified ? "Verified" : "Pending verification"}
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium underline underline-offset-4 hover:text-ink-soft"
                  >
                    Open
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="mt-10 p-6 text-center">
        <p className="font-medium">Your situation is specific — your checklist should be too.</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          Dumonda asks only the questions that change the answer and calculates
          your deadlines from your dates.
        </p>
        <Link
          href={`/ask?q=${encodeURIComponent(guide.askQuery)}`}
          className="mt-4 inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          Tell Dumonda what happened
        </Link>
      </Card>
    </div>
  );
}
