import { NextRequest, NextResponse } from "next/server";
import { refetchDueSources } from "@/lib/sources/refetch";

export const maxDuration = 300;

/**
 * Scheduled source re-fetching endpoint. Wire it to any scheduler (Vercel
 * Cron, GitHub Actions, OS cron) with:
 *   Authorization: Bearer $CRON_SECRET
 * Changed sources land in the /admin/review queue; nothing is applied
 * silently. Returns a machine-readable summary.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured; scheduled refetch is disabled." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const summary = await refetchDueSources();
  return NextResponse.json(summary);
}
