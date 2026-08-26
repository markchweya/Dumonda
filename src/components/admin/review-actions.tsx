"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { resolveChangeAction } from "@/app/admin/actions";

export function ReviewActions({ changeId }: { changeId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => resolveChangeAction(changeId, "accepted"))}
        className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept & re-ingest"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => resolveChangeAction(changeId, "dismissed"))}
        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-ink/30 transition-colors cursor-pointer disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
