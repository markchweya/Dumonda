import { createHash } from "node:crypto";

export const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingsProvider {
  readonly name: string;
  embed(texts: string[]): Promise<number[][]>;
}

/**
 * Deterministic token-hash embedder for development. It captures lexical
 * overlap (shared words → similar vectors) but is NOT semantic — the README
 * and admin UI say so. Swap in a real endpoint via EMBEDDINGS_PROVIDER.
 */
export class HashEmbedder implements EmbeddingsProvider {
  readonly name = "hash";

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }

  private embedOne(text: string): number[] {
    const vec = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
    const tokens = text.toLowerCase().split(/[^a-zäöüéèàêç0-9]+/).filter((w) => w.length > 2);
    for (const token of tokens) {
      const h = createHash("sha256").update(token).digest();
      const idx = h.readUInt32BE(0) % EMBEDDING_DIMENSIONS;
      const sign = h[4] % 2 === 0 ? 1 : -1;
      vec[idx] += sign;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }
}

export class OpenAICompatEmbedder implements EmbeddingsProvider {
  readonly name = "openai-compat";

  constructor(
    private baseUrl: string,
    private apiKey: string,
    private model: string,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/embeddings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!res.ok) throw new Error(`Embeddings endpoint returned ${res.status}`);
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => normaliseDims(d.embedding));
  }
}

/** Pads/truncates to the schema's fixed dimensionality. */
function normaliseDims(vec: number[]): number[] {
  if (vec.length === EMBEDDING_DIMENSIONS) return vec;
  if (vec.length > EMBEDDING_DIMENSIONS) return vec.slice(0, EMBEDDING_DIMENSIONS);
  return [...vec, ...new Array(EMBEDDING_DIMENSIONS - vec.length).fill(0)];
}

let cached: EmbeddingsProvider | null = null;

export function getEmbedder(): EmbeddingsProvider {
  if (cached) return cached;
  const kind = (process.env.EMBEDDINGS_PROVIDER ?? "hash").toLowerCase();
  if (
    kind === "openai-compat" &&
    process.env.EMBEDDINGS_BASE_URL &&
    process.env.EMBEDDINGS_API_KEY
  ) {
    cached = new OpenAICompatEmbedder(
      process.env.EMBEDDINGS_BASE_URL,
      process.env.EMBEDDINGS_API_KEY,
      process.env.EMBEDDINGS_MODEL ?? "text-embedding-3-small",
    );
  } else {
    cached = new HashEmbedder();
  }
  return cached;
}
