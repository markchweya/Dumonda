import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, CalendarClock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { Card } from "@/components/ui";
import { daysUntil, formatDate } from "@/lib/deadlines";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Dumonda" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/signin");

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
  for (const t of allTasks) {
    const list = byEvent.get(t.eventId) ?? [];
    list.push(t);
    byEvent.set(t.eventId, list);
  }

  const withProgress = events.map((e) => {
    const tasks = byEvent.get(e.id) ?? [];
    const handled = tasks.filter((t) => t.status === "completed" || t.status === "not_applicable").length;
    const isDone = tasks.length > 0 && handled === tasks.length;
    return { event: e, tasks, handled, isDone };
  });

  const active = withProgress.filter((e) => !e.isDone && e.event.status !== "archived");
  const completedEvents = withProgress.filter((e) => e.isDone || e.event.status === "completed");

  const now = new Date();
  const upcoming = allTasks
    .filter((t) => t.deadline && t.status !== "completed" && t.status !== "not_applicable" && t.deadline >= now)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    .slice(0, 6);
  const eventTitleById = new Map(events.map((e) => [e.id, e.title]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Dumonda</h1>
        <Link
          href="/ask"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          Something happened?
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold">Things happening now</h2>
        {active.length === 0 ? (
          <Card className="mt-3 p-8 text-center">
            <p className="font-medium">Nothing in progress</p>
            <p className="mt-1 text-sm text-ink-soft">
              Tell Dumonda what&apos;s happening and your checklist will appear here.
            </p>
            <Link
              href="/ask"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
            >
              Start now
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
                        {handled} of {tasks.length} tasks handled, {tasks.length - handled} remaining
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{ width: `${(handled / tasks.length) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">
                      {event.status === "clarifying" ? "A few details still needed" : "Checklist being prepared"}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold">Upcoming deadlines</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            No computed deadlines right now. Deadlines appear when a verified
            rule defines one and the anchoring date is known.
          </p>
        ) : (
          <Card className="mt-3 divide-y divide-line p-0">
            {upcoming.map((t) => {
              const days = daysUntil(t.deadline!);
              return (
                <Link
                  key={t.id}
                  href={`/event/${t.eventId}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-stone-50"
                >
                  <CalendarClock className="h-4 w-4 shrink-0 text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-ink-soft">{eventTitleById.get(t.eventId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(t.deadline!)}</p>
                    <p className="text-xs text-ink-soft">
                      {days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
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
          <h2 className="text-base font-semibold">Completed</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {completedEvents.map(({ event, tasks }) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="p-5 opacity-70 transition-opacity hover:opacity-100">
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">All {tasks.length} tasks handled</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
