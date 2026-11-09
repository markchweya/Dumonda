"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Building2, CalendarClock, Check, FileText, MessageCircleQuestion, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge, Card, cn } from "@/components/ui";
import { SourceDrawer, verificationLabel, type SourceInfo } from "./source-drawer";
import { t, type Locale } from "@/lib/i18n";

export interface TaskView {
  id: string;
  title: string;
  description: string;
  priority: "required" | "may_apply" | "recommended" | "information";
  status: "todo" | "in_progress" | "completed" | "not_applicable";
  deadlineIso: string | null;
  deadlineLabel: string | null;
  authorityName: string | null;
  authorityLevel: string | null;
  officialUrl: string | null;
  documentsRequired: string[];
  sources: SourceInfo[];
}

function sourceDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function TaskCard({
  task,
  signedIn = false,
  locale = "en",
  windowStartIso = null,
}: {
  task: TaskView;
  signedIn?: boolean;
  locale?: Locale;
  /** Start of the deadline window (the event date, falling back to checklist creation) for the meter. */
  windowStartIso?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reminder, setReminder] = useState<"idle" | "saving" | "set" | "needs_account">("idle");

  async function setReminderForTask() {
    if (reminder === "saving" || reminder === "set") return;
    if (!signedIn) {
      setReminder("needs_account");
      return;
    }
    setReminder("saving");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      if (res.status === 401) setReminder("needs_account");
      else if (res.ok) setReminder("set");
      else setReminder("idle");
    } catch {
      setReminder("idle");
    }
  }

  const done = status === "completed";
  const notApplicable = status === "not_applicable";
  const allVerified = task.sources.length > 0 && task.sources.every((s) => s.verification === "verified");
  const hasSources = task.sources.length > 0;
  const firstSourceDomain = hasSources ? sourceDomain(task.sources[0].url) : null;

  // Deadline meter: fill = share of the window still left, anchored on when the checklist was created.
  const deadline = task.deadlineIso ? new Date(task.deadlineIso) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000) : null;
  let meterPct: number | null = null;
  if (deadline && windowStartIso) {
    const total = deadline.getTime() - new Date(windowStartIso).getTime();
    if (total > 0) meterPct = Math.max(4, Math.min(100, Math.round(((deadline.getTime() - Date.now()) / total) * 100)));
  }
  const deadlineText =
    daysLeft === null
      ? null
      : daysLeft < 0
        ? t(locale, "task.overdue")
        : daysLeft === 0
          ? t(locale, "task.dueToday")
          : daysLeft >= 14
            ? t(locale, "task.weeksLeft", { n: Math.round(daysLeft / 7) })
            : t(locale, "task.daysLeft", { n: daysLeft });
  const urgent = daysLeft !== null && daysLeft < 7;

  async function setTaskStatus(next: TaskView["status"]) {
    if (saving) return;
    const prev = status;
    setStatus(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setStatus(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={cn("p-5 transition-opacity", (done || notApplicable) && "opacity-60")}>
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          aria-label={done ? "Mark as not completed" : "Mark as completed"}
          onClick={() => setTaskStatus(done ? "todo" : "completed")}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer",
            done ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/50",
          )}
        >
          {done && <Check className="h-3.5 w-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium leading-snug", done && "line-through decoration-1")}>{task.title}</p>
            <Badge tone={task.priority}>{t(locale, `task.${task.priority}`)}</Badge>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{task.description}</p>

          {deadline && deadlineText && (
            <div className="mt-3 rounded-xl border border-line bg-paper px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{t(locale, "task.yourDeadline")}</p>
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className={cn("inline-flex items-center gap-1.5 font-semibold", urgent ? "text-accent" : "text-ink")}>
                  <CalendarClock className="h-3.5 w-3.5" />
                  {deadlineText}
                </span>
                <span className="text-xs text-ink-soft">
                  {deadline.toLocaleDateString(locale === "en" ? "en-CH" : `${locale}-CH`, { day: "numeric", month: "long", year: "numeric" })}
                  {task.deadlineLabel ? ` · ${task.deadlineLabel}` : ""}
                </span>
              </p>
              {meterPct !== null && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className={cn("h-full rounded-full transition-[width]", urgent ? "bg-accent" : "bg-verified")}
                    style={{ width: `${meterPct}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-soft">
            {!deadline && task.deadlineLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {task.deadlineLabel}
              </span>
            )}
            {task.authorityName && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {task.authorityName}
              </span>
            )}
            {task.documentsRequired.length > 0 && (
              <span className="inline-flex items-start gap-1.5">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{task.documentsRequired.join(" · ")}</span>
              </span>
            )}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {hasSources && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  "inline-flex flex-wrap items-center justify-start gap-1.5 text-left font-medium cursor-pointer transition-colors",
                  allVerified ? "text-verified hover:opacity-80" : "text-amber-ink hover:opacity-80",
                )}
              >
                {allVerified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {allVerified
                  ? t(locale, "source.verified")
                  : task.sources[0].verification === "seed_demo"
                    ? t(locale, "source.seed")
                    : task.sources[0].verification === "pending_review"
                      ? t(locale, "source.pending")
                      : verificationLabel(task.sources[0].verification).label}
                {firstSourceDomain && <span className="font-normal text-ink-soft">· {firstSourceDomain}</span>}
              </button>
            )}
            {task.officialUrl && (
              <a
                href={task.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
              >
                {t(locale, "task.openOfficial")} →
              </a>
            )}
            <Link
              href={`/ask?q=${encodeURIComponent(`Regarding "${task.title}": `)}`}
              className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              {t(locale, "event.askDumonda")}
            </Link>
            {task.deadlineIso && !done && !notApplicable && (
              reminder === "needs_account" ? (
                <Link href="/signup" className="text-ink-soft underline underline-offset-4 hover:text-ink">
                  {t(locale, "task.reminderNeedsAccount")}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={setReminderForTask}
                  disabled={reminder === "saving" || reminder === "set"}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                    reminder === "set" ? "text-verified" : "text-ink-soft hover:text-ink",
                  )}
                >
                  <Bell className="h-4 w-4" />
                  {reminder === "set"
                    ? t(locale, "task.reminderSet")
                    : reminder === "saving"
                      ? t(locale, "task.reminderSaving")
                      : t(locale, "task.remindMe")}
                </button>
              )
            )}
            {!done && (
              <button
                type="button"
                onClick={() => setTaskStatus(notApplicable ? "todo" : "not_applicable")}
                className="text-ink-soft/70 hover:text-ink transition-colors cursor-pointer"
              >
                {notApplicable ? t(locale, "task.appliesAfterAll") : t(locale, "task.notApplicable")}
              </button>
            )}
          </div>
        </div>
      </div>
      <SourceDrawer sources={task.sources} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Card>
  );
}
