import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { embeddedDatabaseProblem, hasHostedDatabase, poolOptions } from "@/lib/db/config";
import { DEV_ADMIN_PASSWORD, adminCredentials } from "@/lib/db/admin-credentials";

describe("database config", () => {
  it("detects a hosted database only when DATABASE_URL has a value", () => {
    expect(hasHostedDatabase({})).toBe(false);
    expect(hasHostedDatabase({ DATABASE_URL: "  " })).toBe(false);
    expect(hasHostedDatabase({ DATABASE_URL: "postgres://h/db" })).toBe(true);
  });

  it("refuses the embedded engine on a serverless host without DATABASE_URL", () => {
    expect(embeddedDatabaseProblem({})).toBeNull();
    expect(embeddedDatabaseProblem({ VERCEL: "1", DATABASE_URL: "postgres://h/db" })).toBeNull();
    expect(embeddedDatabaseProblem({ VERCEL: "1" })).toMatch(/DATABASE_URL is not set/);
  });

  it("holds one connection per serverless instance, ten elsewhere, unless told otherwise", () => {
    expect(poolOptions("postgres://h/db", { VERCEL: "1" }).max).toBe(1);
    expect(poolOptions("postgres://h/db", {}).max).toBe(10);
    expect(poolOptions("postgres://h/db", { VERCEL: "1", DATABASE_POOL_MAX: "3" }).max).toBe(3);
    expect(poolOptions("postgres://h/db", { DATABASE_POOL_MAX: "zero" }).max).toBe(10);
  });

  it("turns prepared statements off behind a transaction pooler", () => {
    expect(poolOptions("postgres://u@ep-x-pooler.eu.aws.neon.tech/db", {}).prepare).toBe(false);
    expect(poolOptions("postgres://u@h:6543/db", {}).prepare).toBe(false);
    expect(poolOptions("postgres://u@h/db?pgbouncer=true", {}).prepare).toBe(false);
    expect(poolOptions("postgres://u@ep-x.eu.aws.neon.tech/db", {}).prepare).toBe(true);
  });
});

describe("admin credentials", () => {
  it("uses the documented defaults on the embedded dev database", () => {
    expect(adminCredentials({})).toEqual({ email: "admin@dumonda.local", password: DEV_ADMIN_PASSWORD });
  });

  it("refuses defaults, missing values and short passwords against a hosted database", () => {
    const hosted = { DATABASE_URL: "postgres://h/db" };
    expect(() => adminCredentials(hosted)).toThrow(/ADMIN_EMAIL/);
    expect(() => adminCredentials({ ...hosted, ADMIN_EMAIL: "admin@dumonda.local", ADMIN_PASSWORD: "x".repeat(20) })).toThrow(/ADMIN_EMAIL/);
    expect(() => adminCredentials({ ...hosted, ADMIN_EMAIL: "me@example.ch" })).toThrow(/ADMIN_PASSWORD/);
    expect(() => adminCredentials({ ...hosted, ADMIN_EMAIL: "me@example.ch", ADMIN_PASSWORD: "short" })).toThrow(/ADMIN_PASSWORD/);
    expect(() =>
      adminCredentials({ VERCEL: "1", ADMIN_EMAIL: "me@example.ch", ADMIN_PASSWORD: DEV_ADMIN_PASSWORD }),
    ).toThrow(/ADMIN_PASSWORD/);
    expect(adminCredentials({ ...hosted, ADMIN_EMAIL: "me@example.ch", ADMIN_PASSWORD: "a-long-passphrase" })).toEqual({
      email: "me@example.ch",
      password: "a-long-passphrase",
    });
  });
});

describe("cron routes answer Vercel Cron's GET", () => {
  const ORIGINAL = process.env.CRON_SECRET;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = ORIGINAL;
  });

  it("guards GET exactly as POST", async () => {
    process.env.CRON_SECRET = "s3cret";
    for (const path of ["refetch", "reminders"] as const) {
      const route = await import(`@/app/api/cron/${path}/route`);
      expect(route.GET).toBe(route.POST);
      const res = await route.GET(new NextRequest(`http://localhost/api/cron/${path}`));
      expect(res.status).toBe(401);
    }
  });
});
