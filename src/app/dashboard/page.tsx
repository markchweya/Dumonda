import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, CalendarClock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { Card } from "@/components/ui";
import { daysUntil, formatDate } from "@/lib/deadlines";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Dumonda" };

const DATE_LOCALE: Record<string, string> = { en: "en-CH", de: "de-CH", fr: "fr-CH", it: "it-CH" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/signin");
  const locale = await getLocale();

  const db = await getDb();
  const events = await db
    .select()
    .from(schema.lifeEvents)
    .where(eq(schema.lifeEvents.userId, session.userId))
    .orderBy(desc(schema.lifeEvents.createdAt));

  const eventIds = events.map((e) => e.id);
  const allTasks = eventIds.length
    ? await db
        .select()
        .from(schema.tasks)
        .where(inArray(schema.tasks.eventId, eventIds))
        .orderBy(asc(schema.tasks.sortOrder))
    : [];

  const byEvent = new Map<string, typeof allTasks>();
  for (const task of allTasks) {
    const list = byEvent.get(task.eventId) ?? [];
    list.push(task);
    byEvent.set(task.eventId, list);
  }

  const withProgress = events.map((e) => {
    const tasks = byEvent.get(e.id) ?? [];
    const handled = tasks.filter((x) => x.status === "completed" || x.status === "not_applicable").length;
    const isDone = tasks.length > 0 && handled === tasks.length;
    return { event: e, tasks, handled, isDone };
  });

  const active = withProgress.filter((e) => !e.isDone && e.event.status !== "archived");
  const completedEvents = withProgress.filter((e) => e.isDone || e.event.status === "completed");

  const now = new Date();
  const upcoming = allTasks
    .filter((x) => x.deadline && x.status !== "completed" && x.status !== "not_applicable" && x.deadline >= now)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    .slice(0, 6);
  const eventTitleById = new Map(events.map((e) => [e.id, e.title]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t(locale, "dash.title")}</h1>
        <Link
          href="/ask"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          {t(locale, "dash.somethingHappened")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold">{t(locale, "dash.now")}</h2>
        {active.length === 0 ? (
          <Card className="mt-3 p-8 text-center">
            <p className="font-medium">{t(locale, "dash.emptyTitle")}</p>
            <p className="mt-1 text-sm text-ink-soft">{t(locale, "dash.emptyText")}</p>
            <Link
              href="/ask"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
            >
              {t(locale, "dash.startNow")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {active.map(({ event, tasks, handled }) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="h-full p-5 transition-all hover:border-ink/25 hover:shadow-sm">
                  <p className="font-medium">{event.title}</p>
                  {tasks.length > 0 ? (
                    <>
                      <p className="mt-1 text-sm text-ink-soft">
                        {handled} {t(locale, "event.of")} {tasks.length} {t(locale, "event.handled")},{" "}
                        {tasks.length - handled} {t(locale, "event.remaining")}
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{ width: `${(handled / tasks.length) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">{t(locale, "ask.generating")}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold">{t(locale, "dash.deadlines")}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">{t(locale, "dash.noDeadlines")}</p>
        ) : (
          <Card className="mt-3 divide-y divide-line p-0">
            {upcoming.map((task) => {
              const days = daysUntil(task.deadline!);
              return (
                <Link
                  key={task.id}
                  href={`/event/${task.eventId}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-stone-50"
                >
                  <CalendarClock className="h-4 w-4 shrink-0 text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-ink-soft">{eventTitleById.get(task.eventId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(task.deadline!, DATE_LOCALE[locale])}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {days <= 0
                        ? t(locale, "dash.today")
                        : days === 1
                          ? t(locale, "dash.tomorrow")
                          : t(locale, "dash.inDays", { days })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </Card>
        )}
      </section>

      {completedEvents.length > 0 && (
        <section className="mt-10">
          <h2 className="text-base font-semibold">{t(locale, "dash.completed")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {completedEvents.map(({ event, tasks }) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="p-5 opacity-70 transition-opacity hover:opacity-100">
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {tasks.length} {t(locale, "dash.tasksHandled")}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
