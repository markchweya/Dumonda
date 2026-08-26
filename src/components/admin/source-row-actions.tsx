"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  ingestSourceAction,
  setSourceVerificationAction,
} from "@/app/admin/actions";
import { cn } from "@/components/ui";

export function SourceRowActions({
  sourceId,
  verification,
}: {
  sourceId: string;
  verification: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const actionButton =
    "rounded-lg border border-line px-2.5 py-1 text-xs font-medium hover:border-ink/30 transition-colors cursor-pointer disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        className={actionButton}
        onClick={() =>
          startTransition(async () => {
            const result = await ingestSourceAction(sourceId);
            setMessage(result.message);
          })
        }
      >
        {pending ? <Loader2 className="inline h-3 w-3 animate-spin" /> : "Fetch & index"}
      </button>
      {verification !== "verified" && (
        <button
          type="button"
          disabled={pending}
          className={cn(actionButton, "text-verified border-verified/30")}
          onClick={() => startTransition(() => setSourceVerificationAction(sourceId, "verified"))}
        >
          Approve as verified
        </button>
      )}
      {verification !== "disabled" ? (
        <button
          type="button"
          disabled={pending}
          className={cn(actionButton, "text-accent border-accent/30")}
          onClick={() => startTransition(() => setSourceVerificationAction(sourceId, "disabled"))}
        >
          Disable
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          className={actionButton}
          onClick={() => startTransition(() => setSourceVerificationAction(sourceId, "pending_review"))}
        >
          Re-enable
        </button>
      )}
      {message && <span className="w-full text-xs text-ink-soft">{message}</span>}
    </div>
  );
}
