import { getAIProvider } from "@/lib/ai";
import { getDb, schema } from "@/lib/db";
import { getEventType } from "@/lib/events/taxonomy";

/**
 * Document analysis for "what does this letter mean?".
 *
 * Everything reported is FOUND IN THE DOCUMENT and labelled as such — the
 * analysis never asserts legal meaning. Dates and amounts are extracted with
 * deterministic patterns; the issuing authority is matched against the
 * authority directory; the suggested workflow comes from the same classifier
 * used for typed queries. Uploaded content is treated as untrusted data and
 * never as instructions.
 */

export interface FoundDate {
  raw: string;
  iso: string;
  /** surrounding words suggesting it is a payment/objection deadline */
  context: "payment_deadline" | "objection_period" | "date" ;
}

export interface DocumentAnalysis {
  authorityMatch: { id: string; name: string; officialDomain: string } | null;
  authorityHints: string[];
  dates: FoundDate[];
  amountsChf: string[];
  suggestedEventType: string | null;
  suggestedEventTitle: string | null;
  suggestedQuery: string | null;
  classificationConfidence: number | null;
  language: string;
  /** honest caveats shown with the analysis */
  notes: string[];
}

const MONTHS_DE = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];

const DEADLINE_HINTS = [
  "zahlungsfrist", "zahlbar bis", "zu bezahlen bis", "payable by", "payment deadline",
  "délai de paiement", "payable jusqu", "termine di pagamento",
];
const OBJECTION_HINTS = [
  "einsprache", "einsprachefrist", "opposition", "objection", "beschwerde", "recours", "ricorso",
];

/** Extracts dd.mm.yyyy, yyyy-mm-dd and "12. März 2026" style dates with context. */
export function extractDatesFromDocument(text: string): FoundDate[] {
  const results: FoundDate[] = [];
  const lower = text.toLowerCase();

  const push = (raw: string, iso: string, index: number) => {
    // Wording BEFORE the date ("zahlbar bis 15.09.") outranks wording after it,
    // which usually belongs to the next sentence.
    const before = lower.slice(Math.max(0, index - 80), index);
    const after = lower.slice(index + raw.length, index + raw.length + 40);
    let context: FoundDate["context"] = "date";
    if (OBJECTION_HINTS.some((h) => before.includes(h))) context = "objection_period";
    else if (DEADLINE_HINTS.some((h) => before.includes(h))) context = "payment_deadline";
    else if (OBJECTION_HINTS.some((h) => after.includes(h))) context = "objection_period";
    else if (DEADLINE_HINTS.some((h) => after.includes(h))) context = "payment_deadline";
    if (!results.some((r) => r.iso === iso && r.context === context)) {
      results.push({ raw, iso, context });
    }
  };

  for (const m of text.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g)) {
    const [raw, d, mo, y] = m;
    const day = parseInt(d, 10);
    const month = parseInt(mo, 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      push(raw, `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, m.index ?? 0);
    }
  }
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    push(m[0], m[0], m.index ?? 0);
  }
  for (const m of lower.matchAll(new RegExp(`\\b(\\d{1,2})\\.\\s*(${MONTHS_DE.join("|")})\\s+(\\d{4})`, "g"))) {
    const day = parseInt(m[1], 10);
    const month = MONTHS_DE.indexOf(m[2]) + 1;
    if (day >= 1 && day <= 31) {
      push(m[0], `${m[3]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, m.index ?? 0);
    }
  }

  // Deadlines first, then chronological.
  const order = { payment_deadline: 0, objection_period: 1, date: 2 };
  results.sort((a, b) => order[a.context] - order[b.context] || a.iso.localeCompare(b.iso));
  return results.slice(0, 12);
}

/** Extracts CHF amounts like "CHF 120.00", "Fr. 40.–". */
export function extractAmountsChf(text: string): string[] {
  const amounts = new Set<string>();
  for (const m of text.matchAll(/(?:CHF|Fr\.)\s?([\d']{1,10}(?:[.,]\d{2}|\.[–-])?)/gi)) {
    amounts.add(`CHF ${m[1].replace(/[–-]$/, "00").replace(",", ".")}`);
    if (amounts.size >= 8) break;
  }
  return [...amounts];
}

const AUTHORITY_KEYWORD_HINTS: [RegExp, string][] = [
  [/polizei|police|polizia/i, "Police"],
  [/steueramt|steuerverwaltung|tax (office|administration)|administration fiscale/i, "Tax administration"],
  [/betreibungsamt|office des poursuites|debt collection/i, "Debt collection office (Betreibungsamt)"],
  [/einwohner(amt|kontrolle)|residents.? (registration|office)|contrôle des habitants/i, "Residents' registration office"],
  [/migrationsamt|migration (office|service)|office cantonal de la population/i, "Migration office"],
  [/strassenverkehrsamt|road traffic office|service des automobiles/i, "Road traffic office"],
  [/krankenkasse|health insur|assurance maladie/i, "Health insurer"],
];

export async function analyzeDocumentText(text: string): Promise<DocumentAnalysis> {
  const db = await getDb();
  const notes: string[] = [];

  // Authority directory match (by name tokens or official domain in the text).
  const authorities = await db
    .select({
      id: schema.authorities.id,
      name: schema.authorities.name,
      officialDomain: schema.authorities.officialDomain,
    })
    .from(schema.authorities);
  const lower = text.toLowerCase();
  const authorityMatch =
    authorities.find((a) => lower.includes(a.officialDomain.replace(/^www\./, ""))) ??
    authorities.find((a) => {
      const token = a.name.toLowerCase().split(" (")[0];
      return token.length > 6 && lower.includes(token);
    }) ??
    null;

  const authorityHints = AUTHORITY_KEYWORD_HINTS.filter(([re]) => re.test(text)).map(([, label]) => label);

  const dates = extractDatesFromDocument(text);
  const amountsChf = extractAmountsChf(text);

  // Same classifier as typed queries; the snippet is data, not instructions.
  const ai = getAIProvider();
  const classification = await ai.classifyEvent(text.slice(0, 1500));
  const def = classification.unrecognised ? undefined : getEventType(classification.eventType);

  if (dates.some((d) => d.context === "payment_deadline" || d.context === "objection_period")) {
    notes.push(
      "Deadlines shown here were found in your document by pattern matching — always confirm them on the document itself.",
    );
  }
  notes.push(
    "Dumonda explains and navigates; it does not interpret legal effect. The issuing authority named on the document is the binding contact.",
  );

  return {
    authorityMatch,
    authorityHints,
    dates,
    amountsChf,
    suggestedEventType: def?.id ?? null,
    suggestedEventTitle: def?.title ?? null,
    suggestedQuery: def ? def.description : null,
    classificationConfidence: classification.unrecognised ? null : classification.confidence,
    language: classification.language,
    notes,
  };
}

/** Extracts text from an uploaded file. PDFs need a text layer (no OCR yet). */
export async function extractTextFromUpload(
  buffer: Buffer,
  mimeType: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (mimeType === "text/plain") {
    const text = buffer.toString("utf-8").trim();
    if (text.length < 20) return { ok: false, error: "The file contains almost no text." };
    return { ok: true, text: text.slice(0, 100_000) };
  }
  if (mimeType === "application/pdf") {
    try {
      const { extractText } = await import("unpdf");
      const result = await extractText(new Uint8Array(buffer), { mergePages: true });
      const text = (Array.isArray(result.text) ? result.text.join("\n") : result.text).trim();
      if (text.length < 20) {
        return {
          ok: false,
          error:
            "This PDF has no extractable text layer (likely a scan). Scanned-document OCR is not supported yet — please type what the letter says instead.",
        };
      }
      return { ok: true, text: text.slice(0, 100_000) };
    } catch {
      return { ok: false, error: "The PDF could not be read. Is the file valid and unencrypted?" };
    }
  }
  if (mimeType.startsWith("image/")) {
    return {
      ok: false,
      error:
        "Image analysis (OCR) is not supported yet. Upload a PDF with a text layer, or describe the letter in your own words.",
    };
  }
  return { ok: false, error: "Unsupported file type. Upload a PDF or a text file." };
}
