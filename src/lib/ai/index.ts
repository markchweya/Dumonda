import type { AIProvider } from "./provider";
import { DeterministicProvider } from "./deterministic";
import { OpenAICompatProvider } from "./openai-compat";

/**
 * Provider factory — the only place that reads AI_* environment variables.
 *
 * AI_PROVIDER=apertus        → Apertus via its OpenAI-compatible endpoint
 * AI_PROVIDER=openai-compat  → any OpenAI-compatible dev fallback endpoint
 * AI_PROVIDER=deterministic  → no LLM (default; never fabricates)
 */
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const kind = (process.env.AI_PROVIDER ?? "deterministic").toLowerCase();

  if (kind === "apertus" && process.env.APERTUS_BASE_URL && process.env.APERTUS_API_KEY) {
    cached = new OpenAICompatProvider({
      name: "apertus",
      baseUrl: process.env.APERTUS_BASE_URL,
      apiKey: process.env.APERTUS_API_KEY,
      model: process.env.APERTUS_MODEL ?? "swiss-ai/apertus-70b-instruct",
    });
    return cached;
  }

  if (
    kind === "openai-compat" &&
    process.env.FALLBACK_LLM_BASE_URL &&
    process.env.FALLBACK_LLM_API_KEY
  ) {
    cached = new OpenAICompatProvider({
      name: "openai-compat",
      baseUrl: process.env.FALLBACK_LLM_BASE_URL,
      apiKey: process.env.FALLBACK_LLM_API_KEY,
      model: process.env.FALLBACK_LLM_MODEL ?? "gpt-4o-mini",
    });
    return cached;
  }

  cached = new DeterministicProvider();
  return cached;
}

export type { AIProvider } from "./provider";
