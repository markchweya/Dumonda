"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Building2, CalendarClock, Check, FileText, MessageCircleQuestion, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge, Card, PRIORITY_LABEL, cn } from "@/components/ui";
import { SourceDrawer, verificationLabel, type SourceInfo } from "./source-drawer";

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

export function TaskCard({ task, signedIn = false }: { task: TaskView; signedIn?: boolean }) {
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
            <Badge tone={task.priority}>{PRIORITY_LABEL[task.priority]}</Badge>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{task.description}</p>

          <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-soft">
            {(task.deadlineIso || task.deadlineLabel) && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {task.deadlineIso
                  ? `${new Date(task.deadlineIso).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })}${task.deadlineLabel ? ` (${task.deadlineLabel})` : ""}`
                  : task.deadlineLabel}
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
                  "inline-flex items-center gap-1.5 font-medium cursor-pointer transition-colors",
                  allVerified ? "text-verified hover:opacity-80" : "text-amber-ink hover:opacity-80",
                )}
              >
                {allVerified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {allVerified ? "Verified source" : verificationLabel(task.sources[0].verification).label}
              </button>
            )}
            {task.officialUrl && (
              <a
                href={task.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4 hover:text-ink-soft"
              >
                Open official service
              </a>
            )}
            <Link
              href={`/ask?q=${encodeURIComponent(`Regarding "${task.title}": `)}`}
              className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Ask Dumonda
            </Link>
            {task.deadlineIso && !done && !notApplicable && (
              reminder === "needs_account" ? (
                <Link href="/signup" className="text-ink-soft underline underline-offset-4 hover:text-ink">
                  Create an account to get reminders
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
                  {reminder === "set" ? "Reminder set" : reminder === "saving" ? "Setting…" : "Remind me"}
                </button>
              )
            )}
            {!done && (
              <button
                type="button"
                onClick={() => setTaskStatus(notApplicable ? "todo" : "not_applicable")}
                className="text-ink-soft/70 hover:text-ink transition-colors cursor-pointer"
              >
                {notApplicable ? "Applies after all" : "Doesn't apply to me"}
              </button>
            )}
          </div>
        </div>
      </div>
      <SourceDrawer sources={task.sources} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Card>
  );
}
