# Deploying Dumonda to dumonda.olkeri.space

Dumonda runs on Vercel from this repository, with a hosted Postgres
database. This is the whole setup, in order.

## 1. Database

Dumonda needs PostgreSQL with the **pgvector** extension. Neon (what
olkeri.space already uses) and Supabase both have it.

1. Create a database, for example a new Neon project called `dumonda`.
2. Copy two connection strings:
   - the **pooled** one (Neon: the host contains `-pooler`) for the app,
   - the **direct** one for the one-off setup below.
3. Create the tables, the reference data and the admin account, once, from
   your machine:

   ```bash
   DATABASE_URL="<direct connection string>" \
   ADMIN_EMAIL="you@example.ch" \
   ADMIN_PASSWORD="<at least 12 characters>" \
   npm run db:setup
   ```

   It runs the migrations (they enable pgvector) and seeds once. Running it
   again is safe: nothing is duplicated. Against a hosted database it refuses
   the development admin defaults, and it checks the credentials before it
   writes anything.

## 2. Vercel project

1. In Vercel: **Add New > Project**, import `markchweya/Dumonda`.
2. Framework: **Next.js** (detected). Build command and output: defaults.
3. Node.js version (Settings > Build and Deployment): **22.x**.
4. Environment variables (Settings > Environment Variables), names only here:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | The **pooled** connection string. Prepared statements are turned off for pooled hosts automatically. |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The same as in step 1.3 (used if the seed ever runs again). |
   | `CRON_SECRET` | A long random string, for example from `openssl rand -hex 32`. Vercel Cron sends it for you. |
   | `AI_PROVIDER` | `deterministic` to start. `apertus` or `openai-compat` with their `*_BASE_URL`, `*_API_KEY` and `*_MODEL` once you have an endpoint. |
   | `EMBEDDINGS_PROVIDER` | `hash` to start, or `openai-compat` with its endpoint, then `npm run db:reindex`. |
   | `EMAIL_PROVIDER` and friends | `console` to start, or `resend-compat` with `EMAIL_API_URL`, `EMAIL_API_KEY` and `EMAIL_FROM` to send reminders. |

   `.env.example` lists every variable with a description.
5. Deploy.

Without `DATABASE_URL` the app stops at the first query with a clear
message, instead of trying to run its embedded development database on
Vercel's read-only file system.

## 3. Domain

1. In the Vercel project: **Settings > Domains > Add**, `dumonda.olkeri.space`.
2. If olkeri.space's DNS is on Vercel, it is configured for you. Otherwise
   add the record Vercel shows (a `CNAME` from `dumonda` to
   `cname.vercel-dns.com`).

olkeri.space's own project does not route this host, so nothing changes there.

## 4. Scheduled jobs

`vercel.json` schedules two jobs, once a day each (the most a Hobby plan
allows):

| Path | When (UTC) | What it does |
|---|---|---|
| `/api/cron/refetch` | 03:17 | Re-checks official sources that are due. Changes go to `/admin/review`; nothing is applied silently. |
| `/api/cron/reminders` | 06:43 | Sends due task reminders (logs them while `EMAIL_PROVIDER=console`). |

Both need `CRON_SECRET`. Without it they answer 503 and do nothing.

## 5. After the first deploy

1. Sign in at `/signin` with the admin account, open `/admin/sources`, and
   verify the sources you are confident in. Guide pages stay `noindex` until
   every source they cite is verified.
2. Before switching `AI_PROVIDER` to a model, run
   `npm run eval:classification` against it (see the README).
