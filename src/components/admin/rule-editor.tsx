"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { createRuleAction, updateRuleAction } from "@/app/admin/actions";
import { Input, cn } from "@/components/ui";

export interface RuleFormData {
  ruleId?: string;
  eventType: string;
  jurisdiction: string;
  conditionsJson: string;
  actionsJson: string;
  notes: string;
}

const EMPTY_CONDITIONS = `{ "all": [] }`;
const EMPTY_ACTIONS = `[
  {
    "title": "Task title",
    "description": "What the user must do and why.",
    "category": "registration",
    "priority": "required",
    "authorityName": "Responsible authority",
    "authorityLevel": "cantonal",
    "sourceIds": ["src_chch_moving"],
    "deadline": { "type": "unknown", "label": "When this is due" }
  }
]`;

export function RuleEditor({
  eventTypes,
  initial,
}: {
  eventTypes: { id: string; title: string }[];
  initial?: RuleFormData;
}) {
  const isEdit = !!initial?.ruleId;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RuleFormData>(
    initial ?? {
      eventType: eventTypes[0]?.id ?? "",
      jurisdiction: "CH",
      conditionsJson: EMPTY_CONDITIONS,
      actionsJson: EMPTY_ACTIONS,
      notes: "",
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = initial?.ruleId
        ? await updateRuleAction(initial.ruleId, form)
        : await createRuleAction(form);
      if (!result.ok) {
        setError(result.error ?? "Validation failed.");
      } else {
        setOpen(false);
        if (!isEdit) {
          setForm({
            eventType: eventTypes[0]?.id ?? "",
            jurisdiction: "CH",
            conditionsJson: EMPTY_CONDITIONS,
            actionsJson: EMPTY_ACTIONS,
            notes: "",
          });
        }
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-ink/30 transition-colors cursor-pointer",
          !isEdit && "bg-ink text-paper border-ink hover:bg-black",
        )}
      >
        {isEdit ? <Pencil className="h-3 w-3" /> : <Plus className="h-3.5 w-3.5" />}
        {isEdit ? "Edit" : "New rule"}
      </button>
    );
  }

  const textareaClass =
    "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink/40 transition min-h-32";

  return (
    <div className="mt-3 w-full rounded-2xl border border-line bg-stone-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {isEdit ? `Edit rule (creates version ${""}+1)` : "New rule"}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-ink-soft hover:bg-stone-200 transition-colors cursor-pointer"
          aria-label="Close editor"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium">Event type</label>
          <select
            value={form.eventType}
            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-ink/40 cursor-pointer"
          >
            {eventTypes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium">Jurisdiction (CH, CH-ZH, CH-BS-basel)</label>
          <div className="mt-1">
            <Input
              value={form.jurisdiction}
              onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium">Conditions (JSON condition tree)</label>
        <textarea
          value={form.conditionsJson}
          onChange={(e) => setForm((f) => ({ ...f, conditionsJson: e.target.value }))}
          className={cn(textareaClass, "mt-1")}
          spellCheck={false}
        />
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium">Actions (JSON array of task templates)</label>
        <textarea
          value={form.actionsJson}
          onChange={(e) => setForm((f) => ({ ...f, actionsJson: e.target.value }))}
          className={cn(textareaClass, "mt-1 min-h-48")}
          spellCheck={false}
        />
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium">Notes (internal)</label>
        <div className="mt-1">
          <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save (bump version)" : "Create rule"}
        </button>
        <p className="text-xs text-ink-soft">
          Validated against the rule schema; source ids must exist in the registry.
        </p>
      </div>
    </div>
  );
}
