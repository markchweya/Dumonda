import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

// Input validation runs before any session/database access, so these route
// handlers can be exercised without a Next.js request context.

function jsonRequest(url: string, body: unknown, method = "POST") {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ask validation", () => {
  it("rejects malformed JSON", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const req = new NextRequest("http://localhost/api/ask", { method: "POST", body: "{not json" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects an empty query", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(jsonRequest("/api/ask", { query: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects an oversized query", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(jsonRequest("/api/ask", { query: "x".repeat(3000) }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/signup validation", () => {
  it("rejects invalid email and short passwords", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    expect((await POST(jsonRequest("/api/auth/signup", { email: "nope", password: "longenough" }))).status).toBe(400);
    expect((await POST(jsonRequest("/api/auth/signup", { email: "a@b.ch", password: "short" }))).status).toBe(400);
  });
});

describe("PATCH /api/tasks/:id validation", () => {
  it("rejects unknown status values", async () => {
    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const res = await PATCH(jsonRequest("/api/tasks/tsk_x", { status: "done" }, "PATCH"), {
      params: Promise.resolve({ id: "tsk_x" }),
    });
    expect(res.status).toBe(400);
  });
});
