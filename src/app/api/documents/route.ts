import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { analyzeDocumentText, extractTextFromUpload } from "@/lib/documents/analyze";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Uploads and analyses an official letter (PDF or text). The file itself is
 * not stored — only the extracted text and the structured analysis, both
 * deletable by the owner and cascaded on account deletion.
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is larger than 10 MB" }, { status: 413 });
  }

  const session = await getOrCreateSession();
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const extraction = await extractTextFromUpload(buffer, mimeType);
  if (!extraction.ok) {
    return NextResponse.json({ error: extraction.error }, { status: 422 });
  }

  const analysis = await analyzeDocumentText(extraction.text);

  const db = await getDb();
  const id = newId("doc");
  await db.insert(schema.documents).values({
    id,
    sessionId: session.sessionId,
    userId: session.userId,
    filename: file.name.slice(0, 200),
    mimeType,
    sizeBytes: file.size,
    extractedText: extraction.text,
    analysis: analysis as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, documentId: id, analysis });
}
