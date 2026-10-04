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
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm test                     # vitest (unit + integration against embedded Postgres)
npm run build                # production build
npm run db:generate          # regenerate SQL migrations after schema changes
npm run db:migrate           # apply migrations explicitly
npm run db:seed              # seed reference data explicitly
npm run db:setup             # migrate + seed once; what a new hosted database needs
npm run db:sync-urls         # sync corrected source URLs into an existing db
npm run db:reindex           # re-embed all chunks with the configured embedder
npm run ingest:all           # fetch + index every registered source (rate-limited)
npm run cron:refetch         # change monitoring: re-fetch sources due for a check
npm run cron:reminders       # dispatch due email reminders
npm run eval:classification  # compare the configured AI provider vs the baseline
```

To reset the local database, delete the `./.data/` directory.

Note on the embedded database: PGlite is a single-process engine. If you run
CLI database commands (`db:seed`, `ingest:all`, `cron:refetch`, `db:reindex`)
while `npm run dev` is running, restart the dev server afterwards so it picks
up the changes — or stop it first. Production Postgres has no such
restriction.

## Deploying

Production runs on Vercel with a hosted Postgres (pgvector) at
[dumonda.olkeri.space](https://dumonda.olkeri.space). Step by step, with the
environment variables and scheduled jobs: [docs/DEPLOY.md](docs/DEPLOY.md).

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
stores a checksum. The first live fetch of a seeded source applies directly
(the seed text was never a live snapshot); afterwards, a fetch that produces a
different checksum lands in `/admin/review` with an AI-drafted assessment —
stored knowledge is **not** replaced until a human accepts the change, and
verification resets to pending until re-approved.

Scheduled change monitoring: `POST /api/cron/refetch` (Bearer `CRON_SECRET`)
or `npm run cron:refetch` re-checks every source whose per-source refresh
interval has elapsed.

## Reminders

Signed-in users can add a reminder on any task with a computed deadline
(7 days before, or immediately when closer). Dispatch runs via
`POST /api/cron/reminders` or `npm run cron:reminders` through a mail
abstraction: `EMAIL_PROVIDER=console` (dev, logs only) or `resend-compat`
(any Resend-compatible HTTP API).

## Document upload (beta)

`/upload` analyses official letters: PDF (text layer) or plain text, up to
10 MB. It extracts Swiss-format dates with payment/objection context, CHF
amounts, matches the issuing authority against the directory, and suggests the
matching workflow via the same classifier as typed queries. Only the extracted
text and analysis are stored — deletable anytime, purged with the account, and
guest uploads are removed when their session ends. Scanned images (OCR) are
not supported yet and fail with honest guidance.

## Languages

The product UI ships in EN/DE/FR/IT (footer switcher, cookie-based, falling
back to the profile language). Clarification questions and answer summaries
follow the detected query language. Authority names are never translated.
Rule content (task titles/descriptions) is authored in English — localising
rule templates is the next content milestone.

## Public guides

Curated SEO entry pages (`/moving-to-basel`, `/having-a-baby-switzerland`, …,
index at `/guides`) render the same checklist the rules engine produces — no
hand-written administrative claims, no mass generation. Each page sets robots
`noindex` until every source it cites is human-verified.

## Testing

47 tests (`npm test`): rules-engine unit tests (conditions, jurisdiction
inheritance, priority/deadline ordering, validity windows), deadline engine,
deterministic classifier/entity-extraction/language-detection, ingestion
utilities (robots.txt, HTML extraction, chunking), API input validation, and
an end-to-end integration suite that runs the full orchestrator (classify →
clarify → rules → retrieval → persisted checklist with citations) against an
isolated embedded Postgres.

## Honest limitations

- 17 of 19 core sources hold content fetched live from the official sites and
  await one-click human verification in `/admin/sources`; SwissPass and SBB
  block automated fetching (HTTP 403) and keep their labelled seed summaries.
- Connecting Apertus requires an endpoint + API key (`APERTUS_*` env). The
  deterministic baseline scores 100% on the labelled evaluation set but that
  set is a regression floor, not a robustness proof — run
  `npm run eval:classification` against the live endpoint before enabling it.
- The hash embedder is lexical, not semantic. Configure a real embeddings
  endpoint and run `npm run db:reindex`; chunks not yet re-indexed degrade to
  keyword search rather than mixing vector spaces.
- Rule content (task titles/descriptions) is English; UI chrome, questions
  and summaries are fully localised.
- Document upload has no OCR — scanned letters are rejected with guidance.
- Guide pages stay `noindex` until their sources are human-verified.
