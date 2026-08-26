import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { extractAmountsChf, extractDatesFromDocument, extractTextFromUpload } from "@/lib/documents/analyze";

const testDataDir = path.join(os.tmpdir(), `dumonda-doc-test-${process.pid}-${Date.now()}`);
process.env.DUMONDA_DATA_DIR = testDataDir;
process.env.AI_PROVIDER = "deterministic";

const FINE_LETTER = `
Kantonspolizei Zürich
Ordnungsbusse Nr. 12345

Wegen Parkierens ohne gültigen Parkschein wird eine Busse von CHF 40.00 erhoben.
Zahlungsfrist: zahlbar bis 15.09.2026.
Bei Nichtbezahlung innert Frist wird das ordentliche Verfahren eingeleitet.
Eine Einsprache ist bis zum 30.09.2026 schriftlich möglich.
`;

describe("document date/amount extraction", () => {
  it("finds Swiss-format dates with deadline context", () => {
    const dates = extractDatesFromDocument(FINE_LETTER);
    const payment = dates.find((d) => d.context === "payment_deadline");
    expect(payment?.iso).toBe("2026-09-15");
    const objection = dates.find((d) => d.context === "objection_period");
    expect(objection?.iso).toBe("2026-09-30");
  });

  it("finds CHF amounts", () => {
    expect(extractAmountsChf(FINE_LETTER)).toContain("CHF 40.00");
  });

  it("rejects invalid dates like 45.13.2026", () => {
    const dates = extractDatesFromDocument("Frist: 45.13.2026 und 31.02.2026");
    expect(dates.find((d) => d.raw === "45.13.2026")).toBeUndefined();
  });
});

describe("upload extraction", () => {
  it("accepts plain text and rejects images and empty files", async () => {
    const text = await extractTextFromUpload(Buffer.from(FINE_LETTER, "utf-8"), "text/plain");
    expect(text.ok).toBe(true);
    const image = await extractTextFromUpload(Buffer.from("xx"), "image/jpeg");
    expect(image.ok).toBe(false);
    const empty = await extractTextFromUpload(Buffer.from("hi"), "text/plain");
    expect(empty.ok).toBe(false);
  });
});

describe("full document analysis (embedded Postgres)", () => {
  beforeAll(async () => {
    fs.mkdirSync(testDataDir, { recursive: true });
    const { getDb } = await import("@/lib/db");
    await getDb(); // migrate + seed authorities
  }, 60000);

  it("identifies authority hints and suggests the fine workflow", async () => {
    const { analyzeDocumentText } = await import("@/lib/documents/analyze");
    const analysis = await analyzeDocumentText(
      FINE_LETTER + "\nThis is a parking fine from the police.",
    );
    expect(analysis.authorityHints).toContain("Police");
    expect(analysis.suggestedEventType).toBe("fine_received");
    expect(analysis.dates.length).toBeGreaterThan(0);
    expect(analysis.notes.length).toBeGreaterThan(0);
  });
});
