import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { track } from "@/lib/analytics";

const bodySchema = z.object({ sourceId: z.string().max(100) });

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (parsed.success) {
      await track("source_clicked", { sourceId: parsed.data.sourceId });
    }
  } catch {
    // analytics only
  }
  return NextResponse.json({ ok: true });
}
