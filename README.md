# Dumonda

**Tell Dumonda what happened. We'll tell you what to do next.**

Dumonda is an AI-powered life-navigation assistant for people living in
Switzerland. Users describe a life event in plain language — *"I moved from
Zürich to Basel"*, *"I just had a baby"*, *"my B permit expires soon"* — and
Dumonda classifies the event, asks only the follow-up questions that change the
answer, and produces a personalised checklist with deadlines, documents,
responsible authorities and traceable official sources.

## Quick start (local development)

Requirements: Node.js 20+ (tested on 24). Nothing else — no database server,
no API keys.

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first request the app creates an **embedded
PostgreSQL database** (PGlite, stored in `./.data/`), applies migrations and
seeds the reference data automatically.

Admin console: sign in at `/signin` with the seeded admin account
(`admin@dumonda.local` / `dumonda-admin-dev`, override via `ADMIN_EMAIL` /
`ADMIN_PASSWORD` before first seed), then open `/admin`.

Other commands:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest (unit + integration against embedded Postgres)
npm run build       # production build
npm run db:generate # regenerate SQL migrations after schema changes
npm run db:migrate  # apply migrations explicitly
npm run db:seed     # seed reference data explicitly
```

To reset the local database, delete the `./.data/` directory.

## Configuration

Copy `.env.example` to `.env` and adjust. Everything has a working default.

- `DATABASE_URL` — leave empty for embedded Postgres (dev). Point at
  Postgres/Supabase (with the `pgvector` extension) for production. The same
  Drizzle schema and migrations in `./drizzle` apply to both.
- `AI_PROVIDER` — `deterministic` (default, no LLM), `apertus` (production
  target, via its OpenAI-compatible endpoint) or `openai-compat` (any
  OpenAI-compatible dev fallback).
- `EMBEDDINGS_PROVIDER` — `hash` (deterministic dev embedder, lexical not
  semantic) or `openai-compat`.

## Architecture

```
User query
   ↓
AIProvider.classifyEvent          → event type + extracted entities (Zod-validated)
   ↓
Profile/context merge             → known facts from the optional Swiss profile
   ↓
Clarification planner             → asks ONLY facts referenced by active rules
   ↓
Rules engine (deterministic)      → obligations per jurisdiction (CH → canton → municipality)
   ↓
Hybrid retrieval                  → metadata filter + pgvector similarity + keyword score
   ↓
AIProvider.generateAnswer         → conversational layer only; cannot alter obligations
   ↓
Citation validation               → tasks may only cite sources that exist in the registry
   ↓
Persistent checklist              → tasks, deadlines, citations, dashboard
```

Key design decisions:

- **The LLM never decides administrative rules.** The rules engine
  (`src/lib/rules/engine.ts`) evaluates versioned condition trees stored in
  the database. The model classifies, extracts and explains — nothing more.
  With `AI_PROVIDER=deterministic` the entire product works with no model at
  all and can never fabricate.
- **Source-first honesty.** Every task carries `sourceIds`; the UI badge
  distinguishes *Verified source* (a human approved the fetched content) from
  *Seed data — pending verification* (development records). Seeded summaries
  are never presented as verified government information.
- **Deadlines are never invented.** A date is computed only when a rule
  defines a deadline *and* the anchoring fact (e.g. the moving date) is known;
  otherwise only the rule's human-readable label is shown
  (`src/lib/deadlines.ts`).
- **Jurisdiction inheritance.** Rules target `CH`, `CH-<canton>` or
  `CH-<canton>-<municipality>`; more specific jurisdictions override duplicate
  federal tasks (`jurisdictionChain` in the rules engine).
- **Prompt-injection defence.** Retrieved source content is passed to the
  model inside `<evidence>` delimiters with explicit instructions to treat it
  as untrusted data; HTML is sanitised at ingestion; model output is always
  Zod-validated and falls back to the deterministic provider on mismatch.

## Database

PostgreSQL via Drizzle ORM (`src/lib/db/schema.ts`, migrations in
`./drizzle`). Main tables:

`users`, `sessions` (guest + authenticated), `profiles`, `jurisdictions`,
`authorities`, `sources`, `source_chunks` (pgvector embeddings),
`source_change_events` (change-monitoring review queue), `rules`,
`life_events`, `tasks`, `conversations`, `messages`, `citations`,
`saved_services`, `reminders` (delivery not yet enabled), `analytics_events`
(privacy-respecting, coarse properties only).

## AI provider abstraction

`src/lib/ai/provider.ts` defines the interface
(`classifyEvent`, `extractEntities`, `determineClarifications`,
`generateAnswer`, `summariseSourceChange`). Implementations:

- `OpenAICompatProvider` — generic OpenAI-compatible chat endpoint; the
  **Apertus** production target is this class configured with
  `APERTUS_BASE_URL/API_KEY/MODEL`.
- `DeterministicProvider` — keyword classifier over the event taxonomy +
  template answer composer. Default in dev; safety net whenever a model call
  fails or returns malformed output.

No provider-specific logic exists outside `src/lib/ai/`.

## Source ingestion & change monitoring

`/admin/sources` manages a controlled registry — Dumonda never crawls. For a
registered URL, **Fetch & index** checks `robots.txt`, fetches with a named
user agent and timeout, sanitises the HTML, chunks and embeds the text and
stores a checksum. If a later fetch produces a different checksum, the change
lands in `/admin/review` with an AI-drafted assessment — the stored knowledge
is **not** replaced until a human accepts the change, and verification resets
to pending until re-approved.

## Testing

47 tests (`npm test`): rules-engine unit tests (conditions, jurisdiction
inheritance, priority/deadline ordering, validity windows), deadline engine,
deterministic classifier/entity-extraction/language-detection, ingestion
utilities (robots.txt, HTML extraction, chunking), API input validation, and
an end-to-end integration suite that runs the full orchestrator (classify →
clarify → rules → retrieval → persisted checklist with citations) against an
isolated embedded Postgres.

## Honest limitations (MVP)

- Seeded source summaries point at real official domains but were written
  during development; they ship as `seed_demo` and must be verified through
  the ingestion pipeline before the product labels them verified.
- The deterministic classifier handles the seeded scenarios well but is not a
  substitute for the Apertus provider on free-form input.
- The hash embedder is lexical, not semantic — swap in a real embeddings
  endpoint for production retrieval quality.
- Reminders, document upload ("what does this letter mean?"), scheduled
  re-fetching and SEO knowledge pages are architected (tables/design in place)
  but not enabled.
- UI ships in English; the i18n catalogue structure (EN/DE/FR/IT) exists in
  `src/lib/i18n`.
