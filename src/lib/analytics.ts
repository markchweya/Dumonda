import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";

/**
 * Privacy-respecting product analytics. Only coarse, non-identifying
 * properties are recorded (event types, cantons, counts) — never free text,
 * never user ids. Failures are swallowed: analytics must never break a flow.
 */
export async function track(
  name:
    | "search"
    | "event_classified"
    | "clarification_asked"
    | "checklist_generated"
    | "task_completed"
    | "source_clicked"
    | "follow_up_question"
    | "unanswered_query",
  props: Record<string, string | number | boolean> = {},
) {
  try {
    const db = await getDb();
    await db.insert(schema.analyticsEvents).values({ id: newId("an"), name, props });
  } catch {
    // never break product flows over analytics
  }
}
