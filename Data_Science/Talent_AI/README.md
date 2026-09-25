# Talent AI

AI Talent Intelligence Platform — parses resumes, extracts structured candidate
data, and semantically ranks candidates against a job description. Rebuilt
multi-tenant from the ground up as a product multiple companies can sign up
for and use, each with their own isolated candidate data (originally
prototyped as a single-user Streamlit capstone; that version's public demo
has since been retired — see git history for that era of the project).

**Live in production**, multi-tenant, with billing. Phases A–D are done
(signup/upload/rank/RLS-proven isolation, the full backend API,
pgvector-native ranking at scale, AI candidate insights, per-tenant usage
metering, and Stripe subscription billing) and most of Phase E (dashboard
feature parity with the original Streamlit app, plus a bulk resume upload
and an opt-in weekly shortlist email that reimagine what its local-only
automation used to do). See the Roadmap section below for exactly what's
done vs. still open, and `CLAUDE.md` for the practical "how to work in this
codebase" notes (commands, architecture, gotchas).

## Live

- **App**: https://my-projects-zeta-three.vercel.app
- **Backend API**: https://talent-ai-api-427358561754.us-central1.run.app
- **Supabase project**: `TalentAI` (`ljtjlvyezkyakayetlod`)

⚠️ **Supabase's free tier auto-pauses a project after ~1 week of inactivity.**
If the live app starts failing with "Failed to fetch" on signup/login, this is
almost certainly why — check the project's status in the Supabase dashboard
and click **Restore** (or use the `restore_project` MCP tool) to wake it back
up; it takes a few minutes to fully come back online. This isn't a code bug,
it's a free-tier limitation — moving to a paid Supabase plan removes it.

## Stack

- **Backend**: FastAPI (`apps/api`), containerized, deployed to **Google
  Cloud Run** (`us-central1`, 2GiB RAM / 2 CPU)
- **Database + Auth + Storage**: Supabase — Postgres with `pgvector`, Auth,
  and Storage
- **Frontend**: Next.js App Router (`apps/web`), deployed to **Vercel**
- **Billing**: Stripe Checkout + billing portal + a signature-verified
  webhook (`apps/api/app/services/billing_service.py`), plan state on
  `tenants.plan`

Backend hosting note: Render was tried first and rejected — its free *and*
cheapest paid tier both cap out at 512MB RAM, which isn't enough to hold
torch + sentence-transformers + spaCy in memory at once (confirmed via a real
OOM crash in production). Cloud Run's pay-per-use pricing with configurable
memory made it a better fit for a low-traffic app with a heavy dependency
stack, at effectively $0/month within its free tier.

## Why multi-tenant, and why this stack

The original Talent_AI project is a single-user, file-based pipeline (local
Parquet files + one global FAISS index + one shared `.env`). Selling it to
multiple companies requires that Company A can never see Company B's
candidates — that's not something you can bolt on with app-level filtering
alone, because a bug in that filtering code would leak data. Here, **Postgres
Row-Level Security is the actual isolation mechanism**: every request from
the frontend carries the signed-in user's own Supabase JWT all the way
through FastAPI to PostgREST/Storage (see `apps/api/app/deps.py`), so even if
this backend's own code had a bug, the database itself refuses to return
another tenant's rows.

## What's reused vs. replaced vs. deferred from the original project

The core ML pipeline (parse -> anonymize -> extract -> embed -> rank) is
storage-agnostic pure logic and didn't need to change — only the parts that
assumed "one global file on disk, one tenant" did.

**Vendored into `apps/api/talent_ai_core/` and reused verbatim:**
- `schemas.py` — `CandidateProfile`, `JobDescription`, `MatchResult`
- `parsing/resume_parser.py` — `extract_text()` (PyMuPDF + OCR fallback)
- `extraction/anonymize.py` — `anonymize_text()` (strips PII before embedding)
- `extraction/nlp_extractor.py` + `extraction/skills_taxonomy.py` — skill/education/experience extraction
- `embeddings/embedder.py` — `embed_text()`/`embed_texts()` (Sentence Transformers, 384-dim)
- `matching/baseline.py` — `TfidfRanker` (keyword baseline, on-demand comparison only)
- `analytics.py` — `skill_gap_analysis()` (shortlist skill-coverage aggregate)

**Replaced** (assumed one global file / one tenant):
- `storage.py` (Parquet read/write) -> Postgres tables (`apps/api/app/services/*`)
- `indexing.py`'s `persist_candidates`/`append_candidate` (Parquet + FAISS file) -> a Postgres insert + `pgvector` column per candidate
- `matching/ranker.py`'s `SemanticRanker` (per-request in-memory `faiss.IndexFlatIP`) -> the `match_candidates` pgvector RPC (`supabase/migrations/0009`), an HNSW `<=>` search in Postgres — same cosine scores (embeddings are L2-normalized), no full-table load, no model on the re-rank path
- `config.py` (local filesystem paths, one shared `.env`) -> `apps/api/app/config.py`, Supabase env vars only, no dataset directories
- `indexing.py`'s `process_resume()` itself isn't reused directly (it derives `candidate_id` from the filename and `source_path` from a local relative path) — `apps/api/app/services/candidate_service.py` calls the three functions inside it (`extract_text`, `anonymize_text`, `extract_all`) directly and builds a `CandidateProfile` with a UUID + Supabase Storage key instead

**Now wired in (Phase D):**
- `insights/` — OpenAI candidate insights, adapted to read config from env
  and return token usage; see the Phase D roadmap entry

**Still deferred:**
- `automation/*` — folder watcher, scheduler, email reports

## Roadmap

- [x] **Phase A**: multi-tenant skeleton — signup, upload, rank, RLS-proven isolation
- [x] **Phase B**: full backend API — candidate detail (`GET /candidates/{id}`),
      delete with Storage cleanup (`DELETE /candidates/{id}`), signed resume
      URLs, job listing/detail (`GET /jobs`, `GET /jobs/{id}`), saved rankings
      without recompute (`GET /jobs/{id}/results`), pagination on both list
      endpoints, and a real bug fix: re-ranking a job used to accumulate
      duplicate `match_results` rows on every call — it now replaces them.
- [x] **Phase C**: semantic ranking now runs in Postgres — a
      `match_candidates` SECURITY INVOKER RPC (`supabase/migrations/0009`)
      does an HNSW `<=>` nearest-neighbour search over `candidates.embedding`
      instead of the API pulling every candidate row into a per-request
      in-memory FAISS index (RLS on `candidates` still scopes it per tenant;
      `faiss-cpu` and `matching/ranker.py` removed). The TF-IDF baseline
      (`matching/baseline.py`) is back as a `POST /jobs/{id}/rank?method=tfidf`
      comparison — computed on demand, never persisted — surfaced as a
      Semantic ⇄ Keyword toggle on the job detail page. Skill-gap analytics
      (`analytics.py`) is back as `GET /jobs/{id}/skill-gap` (fraction of a
      job's saved shortlist missing each required skill) with a panel on the
      same page; the job create form takes a comma-separated required-skills
      list.
- [x] **Phase D**: billing + AI, all four pieces live
  - [x] auth hardening — free-tier password policy tightened (min length 8,
        character requirements). Supabase's HaveIBeenPwned leaked-password
        check is **Pro-plan only**; deferred until the project moves off the
        free tier (which would also remove the ~1-week auto-pause and the
        signup email rate limit). The `get_advisors` finding for this is a
        known, accepted free-tier limitation — it's auth hygiene, not a
        tenant-isolation gap.
  - [x] AI insights (OpenAI) — **live**. Vendored `insights/` modules
        (`insight_generator` / `llm_client` / `schemas`, adapted to read the
        key/model from env and to return token usage). One structured call
        per (candidate, job) → summary, strengths, weaknesses, missing
        qualifications, hiring recommendation, interview questions; only
        `anonymized_text` is sent to OpenAI, never `raw_text`. Cached in
        `candidate_insights` (RLS, `unique(candidate_id, job_description_id)`,
        stores token counts). `GET|POST /candidates/{id}/insights?job_id=…`
        (`?refresh=true` regenerates; 503 if the key isn't set). UI: an
        expander per ranked candidate on the job page, and a job-picker
        section on the candidate page — both via `components/insights.tsx`.
        **`anonymize_text()` hardened** after a live test showed real names
        reaching OpenAI (header line/split-line/bilingual name detection +
        messaging-handle redaction added, on top of the existing regex +
        spaCy NER pass) — see `extraction/anonymize.py`'s own docstring for
        why this stays best-effort, not a guarantee, for non-Western names
        and unusual resume layouts.
  - [x] per-tenant OpenAI usage metering — **live**. An append-only
        `usage_events` ledger (`supabase/migrations/0011`, RLS-isolated like
        every other tenant table) records one row per real OpenAI call
        (cached-insight reads don't touch it). The monthly token limit is
        keyed off the existing `tenants.plan` column (a Phase A hook) via a
        plan→limit map in `app/services/usage_service.py`, not a separate
        DB column — so wiring up Stripe later only means updating `plan` on
        a webhook. `ensure_within_budget()` soft-caps new insight
        generations at the tenant's monthly limit (`402` once reached); `GET
        /usage` returns the tenant's usage/limit/remaining for the current
        calendar month, shown as a small badge + bar in the dashboard
        header.
  - [x] Stripe billing — **live**. Stripe Checkout (`POST /billing/checkout`,
        `mode=subscription`, `tenant_id` in metadata), billing portal
        (`POST /billing/portal`), and a signature-verified webhook
        (`POST /billing/webhook` — the one intentionally unauthenticated
        route; trust is Stripe's HMAC, not RLS) that flips `tenants.plan`
        between `pro` and `trial` on subscription lifecycle events. No
        migration — reuses the `tenants.plan` / `tenants.stripe_customer_id`
        columns from `0002`. The webhook is the **only** place the Supabase
        `service_role` key is used (`billing_service._admin_client()`),
        because a webhook has no user JWT to scope an RLS client with, and
        `tenants` has no UPDATE policy for regular users — so a plan change
        is only reachable through that one signature-gated path. Trial caps
        (10 candidates, 3 jobs, 200k AI tokens/mo) enforced in
        `usage_service.py` → `402`; `pro` lifts all three. Verified
        end-to-end with a real test-mode Checkout on the live site. One
        placeholder "$29/mo" product exists; real pricing/tiers are still
        TBD — only the plumbing is committed.
- [ ] **Phase E**: dashboard parity with the original Streamlit app + a
      SaaS-shaped take on its local automation
  - [x] parity gaps (Parts 1 + 2a, **live**): `create_job` auto-detects
        required skills from the JD text (`extract_skills`) and unions them
        with anything typed; job detail page has a top-K control, a 3-way
        Semantic / Keyword / **Compare** (side-by-side) view, and highlights
        candidate skills that match the JD's required skills; job-create
        form has "load sample JD" buttons (`apps/web/lib/sampleJds.ts`);
        **bulk resume upload** — `POST /candidates/upload/bulk` takes many
        PDFs, returns a per-file ok/error list, respects the trial
        candidate cap; multi-file picker on the candidates page.
  - [x] Part 2b — opt-in weekly shortlist email per job, **code-complete and
        deployed**, awaiting Felix's SMTP creds + `REPORT_TRIGGER_SECRET` +
        a GCP Cloud Scheduler job before it can actually send anything.
        Per-job checkbox → `POST /jobs/{id}/email-reports`. A scheduler
        (external, not built-in) hits `POST /internal/run-weekly-reports`
        (guarded by a shared-secret `X-Report-Token` header — the one other
        route besides the Stripe webhook with no user session) →
        `report_service.run_weekly_reports()`: for every job with
        `email_reports_enabled`, ranks that tenant's candidates via
        `match_candidates_for_tenant` (migration `0012` — a tenant-explicit
        twin of `match_candidates`, needed because the run has no RLS-scoped
        client to lean on), builds a plain-text digest (rank/score/matched
        skills + skill-gap summary), and emails the tenant owner via
        `email_service.py` (stdlib `smtplib`, optional config, no-ops
        cleanly when unset). Deliberately imports nothing from
        `talent_ai_core.insights` — enforced by a test that parses the
        module's own AST — so this path can never touch OpenAI or cost
        money on a timer. `admin_client.get_admin_client()` (2nd and last
        use of the `service_role` key, alongside the Stripe webhook) is now
        the single shared source for it — refactored out of
        `billing_service.py` rather than duplicated.
  - retired for good: the local folder watcher and `scripts/evaluate.py`'s
    Precision@K benchmark — neither fits a multi-tenant product.
- [x] **Phase F (partial)**: live production deployment (Vercel + Cloud Run +
      Supabase) — done early, ahead of B-E, so the current feature set could
      be shared with real colleagues. Observability and CI/CD still open.

## Local development

### Backend (`apps/api`)

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements-dev.txt
cp .env.example .env            # fill in SUPABASE_URL / SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8010
pytest tests/
```

Needs the `tesseract-ocr` and `poppler` system binaries installed locally for
the OCR fallback path (same as the original project) — optional, parsing
degrades gracefully without them.

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
cp .env.local.example .env.local   # fill in the same Supabase project's URL/anon key + NEXT_PUBLIC_API_URL
npm run dev
```

### Database

Schema lives in `supabase/migrations/*.sql`, applied via the Supabase MCP
tools (`apply_migration`) against project `ljtjlvyezkyakayetlod`
(`talent-ai-saas`). Migrations are ordered and additive — `0007` is a
follow-up hardening pass (moving `vector` out of `public` and two RLS helper
functions into a non-PostgREST-exposed `private` schema), not a rewrite of
`0001`-`0006`.

## Verified working (Phase A acceptance test)

Run manually against the real Supabase project and local dev servers:

1. Signed up "Acme Recruiting" and "Beta Staffing" as two separate companies.
2. Uploaded real resume PDFs as Acme — parsed, anonymized, skill-extracted,
   embedded, and stored correctly (verified full pipeline output, including
   `[NAME]`/`[EMAIL]` redaction in `anonymized_text`).
3. Submitted a job description ("IT Systems Administrator") and ranked
   Acme's 3 candidates — the IT resume correctly ranked #1 by semantic
   similarity, ahead of an accountant and an engineer.
4. Confirmed **Beta Staffing sees zero of Acme's candidates** via the API,
   and vice versa after Beta uploaded its own candidate.
5. Cross-checked directly in Postgres (bypassing RLS, as admin) that both
   tenants' rows genuinely coexist in the same `candidates` table — the
   isolation is enforced by RLS policy, not by the absence of data.
6. `get_advisors` (Supabase security lints) clean except for one Auth-level
   setting (leaked-password protection) unrelated to tenant isolation.
7. `pytest tests/` — unit tests for `candidate_service`/`ranking_service`
   with a mocked Supabase client, verifying tenant-scoped inserts.

## Going live (Vercel + Cloud Run + Supabase)

Deployed for real, not just locally. Several real failures came up getting
there (fixed by live debugging, not guessed at) — worth knowing before
touching the deploy config:

- **`apps/web/middleware.ts` crashed in production** with
  `ReferenceError: __dirname is not defined`. Next.js 16 deprecated
  `middleware.ts` in favor of `proxy.ts` — not just a rename: `proxy.ts`
  defaults to the **Node.js runtime**, while the deprecated `middleware.ts`
  convention still runs on the **Edge runtime**, where `__dirname` (used
  somewhere in the bundled Supabase SSR client) doesn't exist. Renamed the
  file and the exported function (`middleware` → `proxy`) — fixed.
- **Cloud Run rejected the container** with "failed to start and listen on
  the port". The Dockerfile hardcoded `--port 8000`; Cloud Run requires the
  container to listen on whatever port its `PORT` env var provides (defaults
  to 8080) — Render happened to tolerate the hardcoded port, Cloud Run does
  not. Fixed by using shell-form `CMD` so `${PORT:-8000}` actually expands.
- **First real upload request hung, then 502'd.** `embeddings/embedder.py`
  lazily downloads the `all-MiniLM-L6-v2` model from HuggingFace Hub on first
  use — this hit a `429 Too Many Requests` on Cloud Run (shared cloud-provider
  IPs get rate-limited by HF's anonymous-request limits). Fixed by
  pre-downloading the model **at Docker build time** (one `RUN python -c
  "...SentenceTransformer(...)"` line) so the container never makes that
  network call at runtime at all.
- **`gcloud run deploy --source .` hung for 10+ minutes** uploading sources
  the first time — there was no `.gcloudignore`, so it was uploading the
  entire 1.4GB local `.venv`. Added `apps/api/.gcloudignore` (same exclusions
  as `.gitignore`) — fixed, uploads in seconds now.
- **Vercel kept serving a stale backend URL after editing an env var.**
  `NEXT_PUBLIC_API_URL` had been created as Vercel's **Secret** type, which
  is write-only/encrypted and — critically — isn't exposed to the `next
  build` step the way `NEXT_PUBLIC_*` variables need to be to get inlined
  into the browser bundle. Vercel won't let you convert a Secret to Config in
  place; had to delete and recreate all three `NEXT_PUBLIC_*` variables as
  **Config** type, then redeploy. If a live Vercel deploy ever silently
  ignores an env var change again, check this first.
- **A corrupted Vercel routing manifest** (from the `__dirname` crash above)
  kept returning a platform-level 404 on every path even after the code was
  fixed and the build succeeded ("Ready" status, clean logs, still 404). Per
  Vercel's own community guidance for this exact symptom: deleting and
  re-importing the project from GitHub resets the manifest — a full redeploy
  in place does not.

## Verified working — Phase A acceptance test, live in production

1. Signed up two separate companies locally, confirmed cross-tenant isolation
   both via the API and directly in Postgres as admin (RLS proven, not just
   claimed — see git history for the full local walkthrough).
2. Deployed for real: Vercel (frontend) + Cloud Run (backend, 2GiB RAM) +
   Supabase (already cloud-hosted). All three wired together with matching
   CORS, env vars, and Supabase Auth redirect URLs.
3. Uploaded a real resume through the live Cloud Run backend — parsed,
   anonymized, skill-extracted, embedded, stored — then ranked it against a
   real job description and got a correct similarity score.
4. **The user (not just Claude) signed up with their own real email on the
   live Vercel URL, received and clicked a real Supabase confirmation email,
   and logged in successfully** — the actual end-to-end flow a real customer
   would experience, confirmed working.
5. `pytest tests/` — unit tests for `candidate_service`/`ranking_service`
   with a mocked Supabase client, verifying tenant-scoped inserts.
6. `get_advisors` (Supabase security lints) clean except for one Auth-level
   setting (leaked-password protection) unrelated to tenant isolation.
