/**
 * Classification quality evaluation: npm run eval:classification
 *
 * Runs the labelled evaluation set through the deterministic baseline and,
 * when AI_PROVIDER is configured to apertus/openai-compat, through that
 * provider as well, then prints a comparison. Use this to decide whether a
 * connected Apertus endpoint beats the baseline before enabling it in
 * production.
 */
import { DeterministicProvider } from "@/lib/ai/deterministic";
import { getAIProvider } from "@/lib/ai";
import { EVAL_CASES } from "@/lib/ai/eval-dataset";
import type { AIProvider } from "@/lib/ai/provider";

interface Score {
  name: string;
  correct: number;
  correctEasy: number;
  easyTotal: number;
  unrecognised: number;
  misclassified: { query: string; expected: string; got: string }[];
}

async function evaluate(provider: AIProvider): Promise<Score> {
  const score: Score = {
    name: provider.name,
    correct: 0,
    correctEasy: 0,
    easyTotal: 0,
    unrecognised: 0,
    misclassified: [],
  };
  for (const c of EVAL_CASES) {
    if (!c.hard) score.easyTotal++;
    const result = await provider.classifyEvent(c.query);
    const got = result.unrecognised ? "(unrecognised)" : result.eventType;
    if (got === c.expected) {
      score.correct++;
      if (!c.hard) score.correctEasy++;
    } else {
      if (result.unrecognised) score.unrecognised++;
      score.misclassified.push({ query: c.query, expected: c.expected, got });
    }
  }
  return score;
}

function report(score: Score) {
  const total = EVAL_CASES.length;
  console.log(`\n── ${score.name} ─────────────────────────────`);
  console.log(`Overall accuracy:      ${score.correct}/${total} (${((score.correct / total) * 100).toFixed(1)}%)`);
  console.log(`Easy-set accuracy:     ${score.correctEasy}/${score.easyTotal} (${((score.correctEasy / score.easyTotal) * 100).toFixed(1)}%)`);
  console.log(`Unrecognised:          ${score.unrecognised}`);
  if (score.misclassified.length > 0) {
    console.log(`Misclassifications:`);
    for (const m of score.misclassified) {
      console.log(`  "${m.query}"`);
      console.log(`     expected ${m.expected}, got ${m.got}`);
    }
  }
}

async function main() {
  const baseline = new DeterministicProvider();
  const baselineScore = await evaluate(baseline);
  report(baselineScore);

  const configured = getAIProvider();
  if (configured.name !== "deterministic") {
    console.log(`\nEvaluating configured provider "${configured.name}"…`);
    const configuredScore = await evaluate(configured);
    report(configuredScore);
    const delta = configuredScore.correct - baselineScore.correct;
    console.log(
      `\nVerdict: ${configured.name} ${delta > 0 ? "beats" : delta === 0 ? "matches" : "trails"} the deterministic baseline by ${Math.abs(delta)} case(s).`,
    );
  } else {
    console.log(
      "\nNo LLM provider configured (AI_PROVIDER=deterministic). " +
        "Set AI_PROVIDER=apertus with APERTUS_BASE_URL/APERTUS_API_KEY/APERTUS_MODEL " +
        "and re-run to compare Apertus against this baseline.",
    );
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
