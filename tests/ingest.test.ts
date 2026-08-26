import { describe, expect, it } from "vitest";
import { checkRobots, checksumOf, chunkText, extractTextFromHtml, looksLikeErrorPage } from "@/lib/sources/ingest";

describe("checkRobots", () => {
  it("allows paths not disallowed for *", () => {
    const robots = "User-agent: *\nDisallow: /private/\n";
    expect(checkRobots(robots, "/en/moving")).toBe(true);
    expect(checkRobots(robots, "/private/page")).toBe(false);
  });

  it("ignores rules for other agents", () => {
    const robots = "User-agent: OtherBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin\n";
    expect(checkRobots(robots, "/en/")).toBe(true);
    expect(checkRobots(robots, "/admin")).toBe(false);
  });
});

describe("extractTextFromHtml", () => {
  it("strips scripts, styles and tags", () => {
    const html = `<html><head><style>.x{}</style><script>alert(1)</script></head>
      <body><nav>menu</nav><h1>Moving to Basel</h1><p>Register within 14 days.</p></body></html>`;
    const text = extractTextFromHtml(html);
    expect(text).toContain("Moving to Basel");
    expect(text).toContain("Register within 14 days.");
    expect(text).not.toContain("alert");
    expect(text).not.toContain("menu");
  });
});

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    expect(chunkText("short text but long enough to keep around for testing purposes here")).toHaveLength(1);
  });

  it("splits long text with overlap and sentence awareness", () => {
    const sentence = "This is a sentence about Swiss administration and registration duties. ";
    const text = sentence.repeat(60);
    const chunks = chunkText(text, 500, 50);
    expect(chunks.length).toBeGreaterThan(3);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(600);
  });
});

describe("looksLikeErrorPage", () => {
  it("detects soft 404s served with HTTP 200 (SPA error shells)", () => {
    expect(looksLikeErrorPage("Suche starten Zum Inhalt springen Error Page (404) Alle Themen")).toBe(true);
    expect(looksLikeErrorPage("Oops — page not found. Try the homepage.")).toBe(true);
    expect(looksLikeErrorPage("Seite nicht gefunden — zurück zur Startseite")).toBe(true);
  });

  it("does not flag real content", () => {
    expect(
      looksLikeErrorPage(
        "When you move to a new commune in Switzerland you must register within 14 days of moving in.",
      ),
    ).toBe(false);
  });
});

describe("checksumOf", () => {
  it("is stable and content-sensitive", () => {
    expect(checksumOf("abc")).toBe(checksumOf("abc"));
    expect(checksumOf("abc")).not.toBe(checksumOf("abd"));
  });
});
