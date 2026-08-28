# Talent AI

AI Talent Intelligence Platform — parses resumes, extracts structured candidate
data, and semantically ranks candidates against a job description. Rebuilt
multi-tenant from the ground up as a product multiple companies can sign up
for and use, each with their own isolated candidate data (originally
prototyped as a single-user Streamlit capstone; that version's public demo
has since been retired — see git history for that era of the project).

This is **Phase A** of a longer roadmap: a thin but real vertical slice that
proves the multi-tenant architecture works end-to-end (signup -> upload a
resume -> submit a job description -> get a ranking -> confirm another
company can't see any of it), rather than a full rebuild of every feature
the original Streamlit dashboard had.

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
- **Billing**: Stripe (not wired up yet — Phase D)

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
- `matching/ranker.py` — `SemanticRanker` (FAISS `.fit()`/`.rank()`)

**Replaced** (assumed one global file / one tenant):
- `storage.py` (Parquet read/write) -> Postgres tables (`apps/api/app/services/*`)
- `indexing.py`'s `persist_candidates`/`append_candidate` (Parquet + FAISS file) -> a Postgres insert + `pgvector` column per candidate
- `config.py` (local filesystem paths, one shared `.env`) -> `apps/api/app/config.py`, Supabase env vars only, no dataset directories
- `indexing.py`'s `process_resume()` itself isn't reused directly (it derives `candidate_id` from the filename and `source_path` from a local relative path) — `apps/api/app/services/candidate_service.py` calls the three functions inside it (`extract_text`, `anonymize_text`, `extract_all`) directly and builds a `CandidateProfile` with a UUID + Supabase Storage key instead

**Explicitly deferred past Phase A** (not wired into any endpoint yet, so there's
no accidental cost/scope creep before later phases design them properly):
- `insights/insight_generator.py` — OpenAI-powered candidate insights (needs
  per-tenant usage metering first — Phase D)
- `matching/baseline.py` — TF-IDF baseline ranker
- `analytics.py` — skill-gap analysis
- `automation/*` — folder watcher, scheduler, email reports

## Roadmap

- [x] **Phase A**: multi-tenant skeleton — signup, upload, rank, RLS-proven isolation
- [x] **Phase B**: full backend API — candidate detail (`GET /candidates/{id}`),
      delete with Storage cleanup (`DELETE /candidates/{id}`), signed resume
      URLs, job listing/detail (`GET /jobs`, `GET /jobs/{id}`), saved rankings
      without recompute (`GET /jobs/{id}/results`), pagination on both list
      endpoints, and a real bug fix: re-ranking a job used to accumulate
      duplicate `match_results` rows on every call — it now replaces them.
- [ ] **Phase C**: push ranking into pgvector directly (`<=>` + the `hnsw` index) for scale; migrate the TF-IDF baseline and skill-gap analytics in
- [ ] **Phase D**: auth hardening (enable Supabase's leaked-password protection — see `get_advisors`), Stripe billing, per-tenant OpenAI usage metering, then wire in AI insights
- [ ] **Phase E**: full dashboard feature parity with the original Streamlit app
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
