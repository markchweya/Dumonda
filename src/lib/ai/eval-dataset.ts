/**
 * Labelled evaluation set for event classification.
 *
 * Used by `npm run eval:classification` to compare the configured AI provider
 * (e.g. Apertus) against the deterministic baseline, and by the test suite to
 * guard the baseline against regressions.
 *
 * `hard: true` marks paraphrases and multilingual queries that keyword
 * matching is not expected to handle — they count in the report but not in the
 * baseline regression threshold.
 */

export interface EvalCase {
  query: string;
  expected: string;
  hard?: boolean;
}

export const EVAL_CASES: EvalCase[] = [
  // Moving
  { query: "I moved from Zürich to Basel last weekend", expected: "move_between_cantons" },
  { query: "We are moving to another canton next month, what do we need to do?", expected: "move_between_cantons" },
  { query: "moving house from Bern to Geneva with two kids", expected: "move_between_cantons" },
  { query: "Ich bin von Zürich nach Basel umgezogen", expected: "move_between_cantons", hard: true },
  { query: "I'm relocating to Switzerland from Germany in October", expected: "arrive_in_switzerland" },
  { query: "I'm moving out of Switzerland for good", expected: "leave_switzerland" },
  { query: "we're emigrating to Portugal next year", expected: "leave_switzerland" },

  // Family
  { query: "I recently had a baby. What do I need to do?", expected: "child_birth" },
  { query: "our daughter was born last week", expected: "child_birth" },
  { query: "my wife just gave birth, what paperwork is needed", expected: "child_birth" },
  { query: "we're getting married in June", expected: "marriage" },

  // Work
  { query: "I lost my job yesterday", expected: "job_loss" },
  { query: "I was laid off and my last day is Friday", expected: "job_loss" },
  { query: "my employer terminated my contract", expected: "job_loss", hard: true },
  { query: "I'm starting a new job in Zug", expected: "job_change" },
  { query: "I'm retiring next spring", expected: "retirement" },

  // Education
  { query: "I just finished high school", expected: "finish_high_school" },
  { query: "I got my Matura, what now?", expected: "finish_high_school" },
  { query: "I want to apply to university this year", expected: "start_university" },

  // Transport
  { query: "I bought a car", expected: "buy_vehicle" },
  { query: "just purchased a used vehicle from a private seller", expected: "buy_vehicle" },
  { query: "I lost my SwissPass", expected: "swisspass_lost" },
  { query: "My Half Fare Card expires next month", expected: "half_fare_expiring" },
  { query: "mein Halbtax läuft bald ab", expected: "half_fare_expiring" },
  { query: "my GA travelcard is up for renewal", expected: "ga_expiring" },

  // Immigration
  { query: "My B permit expires soon", expected: "permit_expiring" },
  { query: "my residence permit renewal is due", expected: "permit_expiring" },
  { query: "L permit runs out in two months, what do I do", expected: "permit_expiring" },

  // Business
  { query: "I want to start a company", expected: "start_business" },
  { query: "how do I become self-employed in Switzerland", expected: "start_business" },
  { query: "founding a GmbH with a friend", expected: "start_business" },

  // Legal / admin
  { query: "I just got a parking fine", expected: "fine_received" },
  { query: "received a speeding ticket in the mail", expected: "fine_received" },
  { query: "I got an official letter I don't understand", expected: "fine_received" },

  // Insurance / tax / documents
  { query: "I want to change my health insurance", expected: "health_insurance_change" },
  { query: "my Krankenkasse premium went up, can I switch", expected: "health_insurance_change" },
  { query: "I received a letter from the tax office about my tax return", expected: "tax_return" },
  { query: "my passport expires in three months", expected: "passport_expiring" },

  // Multilingual (hard for the keyword baseline)
  { query: "j'ai perdu mon travail hier", expected: "job_loss", hard: true },
  { query: "ho appena avuto un bambino", expected: "child_birth", hard: true },
];
