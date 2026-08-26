import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

const ORIGINAL_SECRET = process.env.CRON_SECRET;

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("POST /api/cron/refetch auth", () => {
  it("returns 503 when no CRON_SECRET is configured", async () => {
    delete process.env.CRON_SECRET;
    const { POST } = await import("@/app/api/cron/refetch/route");
    const res = await POST(new NextRequest("http://localhost/api/cron/refetch", { method: "POST" }));
    expect(res.status).toBe(503);
  });

  it("rejects missing or wrong bearer tokens", async () => {
    process.env.CRON_SECRET = "s3cret";
    const { POST } = await import("@/app/api/cron/refetch/route");
    const noAuth = await POST(new NextRequest("http://localhost/api/cron/refetch", { method: "POST" }));
    expect(noAuth.status).toBe(401);
    const wrong = await POST(
      new NextRequest("http://localhost/api/cron/refetch", {
        method: "POST",
        headers: { authorization: "Bearer nope" },
      }),
    );
    expect(wrong.status).toBe(401);
  });
});
