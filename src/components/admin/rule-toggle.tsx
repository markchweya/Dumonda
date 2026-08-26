"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toggleRuleAction } from "@/app/admin/actions";

export function RuleToggle({ ruleId, active }: { ruleId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleRuleAction(ruleId, !active))}
      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-ink/30 transition-colors cursor-pointer disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : active ? "Deactivate" : "Activate"}
    </button>
  );
}
