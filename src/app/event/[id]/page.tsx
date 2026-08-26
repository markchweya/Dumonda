import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { getOrCreateSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { getEventType } from "@/lib/events/taxonomy";
import { cantonLabel } from "@/lib/swiss/cantons";
import { TaskCard, type TaskView } from "@/components/event/task-card";
import type { SourceInfo } from "@/components/event/source-drawer";
import { Card } from "@/components/ui";
import { t, type MessageKey } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const SECTIONS: { key: TaskView["priority"]; titleKey: MessageKey; hintKey: MessageKey }[] = [
  { key: "required", titleKey: "event.doFirst", hintKey: "event.doFirstHint" },
  { key: "may_apply", titleKey: "event.maybe", hintKey: "event.maybeHint" },
  { key: "recommended", titleKey: "event.recommended", hintKey: "event.recommendedHint" },
  { key: "information", titleKey: "event.info", hintKey: "event.infoHint" },
];

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getOrCreateSession();
  const locale = await getLocale();
  const db = await getDb();

  const [event] = await db
    .select()
    .from(schema.lifeEvents)
    .where(eq(schema.lifeEvents.id, id))
    .limit(1);
  if (!event) notFound();

  const owns =
    (event.userId && event.userId === session.userId) ||
    (event.sessionId && event.sessionId === session.sessionId);
  if (!owns) notFound();

  const taskRows = await db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.eventId, id))
    .orderBy(asc(schema.tasks.sortOrder));

  const sourceIds = [...new Set(taskRows.flatMap((t) => t.sourceIds))];
  const sourceRows = sourceIds.length
    ? await db.select().from(schema.sources).where(inArray(schema.sources.id, sourceIds))
    : [];
  const sourceMap = new Map<string, SourceInfo>(
    sourceRows.map((s) => [
      s.id,
      {
        id: s.id,
        title: s.title,
        authorityName: s.authorityName,
        authorityLevel: s.authorityLevel,
        canton: s.canton,
        url: s.url,
        verification: s.verification,
        lastVerifiedAt: s.lastVerifiedAt?.toISOString() ?? null,
        fetchedAt: s.fetchedAt?.toISOString() ?? null,
        excerpt: s.extractedText ? s.extractedText.slice(0, 320) + (s.extractedText.length > 320 ? "…" : "") : null,
      } satisfies SourceInfo,
    ]),
  );

  const tasks: TaskView[] = taskRows.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    deadlineIso: t.deadline?.toISOString() ?? null,
    deadlineLabel: t.deadlineLabel,
    authorityName: t.authorityName,
    authorityLevel: t.authorityLevel,
    officialUrl: t.officialUrl,
    documentsRequired: t.documentsRequired,
    sources: t.sourceIds.map((sid) => sourceMap.get(sid)).filter((s): s is SourceInfo => !!s),
  }));

  const completed = tasks.filter((t) => t.status === "completed" || t.status === "not_applicable").length;
  const def = getEventType(event.eventType);
  const facts = event.facts;
  const factSummary = [
    facts.canton ? cantonLabel(facts.canton) : null,
    facts.origin_canton ? `from ${cantonLabel(facts.origin_canton)}` : null,
    facts.event_date
      ? new Date(facts.event_date).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
      : null,
  ].filter(Boolean);

  // Assistant message payload for warnings.
  const [conversation] = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.eventId, id))
    .limit(1);
  let warnings: string[] = [];
  if (conversation) {
    const msgs = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversation.id));
    const assistant = msgs.filter((m) => m.role === "assistant").at(-1);
    const payloadWarnings = assistant?.payload?.warnings;
    if (Array.isArray(payloadWarnings)) warnings = payloadWarnings.filter((w): w is string => typeof w === "string");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
        {def ? def.category.replace("_", " & ").toLowerCase() : "your situation"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{event.title}</h1>
      {factSummary.length > 0 && (
        <p className="mt-1 text-sm text-ink-soft">{factSummary.join(" · ")}</p>
      )}
      {event.summary && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{event.summary}</p>}

      {tasks.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completed} {t(locale, "event.of")} {tasks.length} {t(locale, "event.handled")}
            </span>
            <span className="text-ink-soft">
              {tasks.length - completed} {t(locale, "event.remaining")}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-ink transition-all"
              style={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {["fine_received", "tax_return"].includes(event.eventType) && (
        <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">
            <span className="font-medium">{t(locale, "event.haveLetter")} </span>
            <span className="text-ink-soft">{t(locale, "event.haveLetterSub")}</span>
          </p>
          <Link
            href="/upload"
            className="rounded-xl border border-line px-3.5 py-2 text-sm font-medium hover:border-ink/30 transition-colors"
          >
            {t(locale, "event.uploadLetter")}
          </Link>
        </Card>
      )}

      {warnings.map((w) => (
        <Card key={w} className="mt-5 flex items-start gap-3 border-amber-ink/20 bg-amber-soft p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-ink" />
          <p className="text-sm text-amber-ink">{w}</p>
        </Card>
      ))}

      {tasks.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <p className="font-medium">No verified guidance yet for this exact situation</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            We found your situation but don&apos;t yet have rules backed by an
            approved official source for it. Rather than guessing, we&apos;ve
            recorded it so we can add coverage. Try the official portal ch.ch as
            a starting point.
          </p>
          <a
            href="https://www.ch.ch/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          >
            Open ch.ch
          </a>
        </Card>
      ) : (
        SECTIONS.map((section) => {
          const sectionTasks = tasks.filter((t) => t.priority === section.key);
          if (sectionTasks.length === 0) return null;
          return (
            <section key={section.key} className="mt-9">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold">{t(locale, section.titleKey)}</h2>
                <span className="text-xs text-ink-soft">{t(locale, section.hintKey)}</span>
              </div>
              <div className="mt-3 space-y-3">
                {sectionTasks.map((task) => (
                  <TaskCard key={task.id} task={task} signedIn={!!session.userId} locale={locale} />
                ))}
              </div>
            </section>
          );
        })
      )}

      <Card className="mt-10 p-5">
        <p className="text-sm font-medium">{t(locale, "event.somethingElse")}</p>
        <p className="mt-1 text-sm text-ink-soft">{t(locale, "event.somethingElseSub")}</p>
        <Link
          href="/ask"
          className="mt-3 inline-block rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          {t(locale, "event.askDumonda")}
        </Link>
      </Card>

      {!session.userId && (
        <Card className="mt-4 border-dashed p-5 text-sm">
          <span className="font-medium">{t(locale, "event.keepTitle")} </span>
          <span className="text-ink-soft">{t(locale, "event.keepText")}</span>
          <Link href="/signup" className="ml-2 font-medium underline underline-offset-4">
            {t(locale, "event.createAccount")}
          </Link>
        </Card>
      )}
    </div>
  );
}
