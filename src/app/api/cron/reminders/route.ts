import { NextRequest, NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/reminders/dispatch";

export const maxDuration = 120;

/**
 * Scheduled reminder dispatch. Wire to a scheduler with
 * Authorization: Bearer $CRON_SECRET. With EMAIL_PROVIDER=console (dev),
 * reminders are logged, not delivered — the response says which.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured; scheduled reminders are disabled." },
      { status: 503 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const summary = await dispatchDueReminders();
  return NextResponse.json(summary);
}

/**
 * Vercel Cron calls with GET and the same bearer token (it sends
 * CRON_SECRET for you); see vercel.json. Other schedulers may POST.
 */
export const GET = POST;
