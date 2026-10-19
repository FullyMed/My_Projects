# Talent AI

Talent AI reads resumes, pulls out each candidate's skills, education and
experience, and ranks candidates against a job description by meaning
rather than exact keywords. Several companies can sign up and use it at
once, and each one sees only its own candidates.

It started as a single-user Streamlit capstone. Once the goal became a real
product, I rebuilt it from scratch as a multi-tenant web app. The capstone's
public demo is gone; git history has that version.

It's live in production with billing. Phases A to D are done: signup,
upload and ranking with proven tenant isolation, the full backend API,
ranking inside Postgres with pgvector, AI candidate reviews, per-tenant
usage limits and Stripe subscriptions. Most of Phase E is done too: the
dashboard now matches the old Streamlit app, and there's a bulk resume
upload and an optional weekly shortlist email. The roadmap below lists what's
done and what's still open. `CLAUDE.md` has the practical notes for working
in this codebase: commands, architecture and gotchas.

## Live

- App: https://my-projects-zeta-three.vercel.app
- Backend API: https://talent-ai-api-427358561754.us-central1.run.app
- Supabase project: `TalentAI` (`ljtjlvyezkyakayetlod`)

**Supabase's free tier pauses a project after about a week without use.** If
signup or login on the live app starts failing with "Failed to fetch", check
the project in the Supabase dashboard and click **Restore**. It takes a few
minutes to come back. (Claude Code's safety check blocks the
`restore_project` MCP tool, so this has to be a manual click.) A paid
Supabase plan removes the pause.

## Stack

- Backend: FastAPI (`apps/api`) in a container on Google Cloud Run
  (`us-central1`, 2 GiB RAM, 2 CPUs).
- Database, auth and file storage: Supabase (Postgres with `pgvector`, Auth,
  Storage).
- Frontend: Next.js App Router (`apps/web`) on Vercel.
- Billing: Stripe Checkout, the Stripe billing portal and a webhook that
  checks Stripe's signature (`apps/api/app/services/billing_service.py`).
  The current plan lives in `tenants.plan`.

I tried Render first for the backend and dropped it. Both its free tier and
its cheapest paid tier stop at 512 MB of RAM, which can't hold torch,
sentence-transformers and spaCy at once; it crashed out of memory in
production. Cloud Run lets me pick the memory and only charges for use, which
suits a low-traffic app with heavy dependencies. Within its free tier it
costs close to nothing.

## Why multi-tenant, and why this stack

The original project was a single-user pipeline built on files: local
Parquet files, one global FAISS index and one shared `.env`. To sell it to
several companies, Company A must never see Company B's candidates, and
filtering in app code alone can't promise that, since one bug in the filter
leaks data.

So Postgres Row-Level Security does the isolating. Every request from the
frontend carries the signed-in user's own Supabase JWT through FastAPI to
PostgREST and Storage (see `apps/api/app/deps.py`). If the backend had a bug,
the database would still refuse to return another tenant's rows.

## What came over from the original project

The core pipeline (parse, anonymize, extract, embed, rank) is plain logic
that doesn't care where data is stored, so it carried over almost unchanged.
Only the parts that assumed one global file and one user had to go.

Copied into `apps/api/talent_ai_core/` and reused as is:

- `schemas.py`: `CandidateProfile`, `JobDescription`, `MatchResult`
- `parsing/resume_parser.py`: `extract_text()` (PyMuPDF, with an OCR fallback)
- `extraction/anonymize.py`: `anonymize_text()` (removes PII before embedding)
- `extraction/nlp_extractor.py` and `extraction/skills_taxonomy.py`: skill, education and experience extraction
- `embeddings/embedder.py`: `embed_text()` / `embed_texts()` (Sentence Transformers, 384 dimensions)
- `matching/baseline.py`: `TfidfRanker` (the keyword comparison, computed on request)
- `analytics.py`: `skill_gap_analysis()` (which required skills a shortlist lacks)

Replaced, because they assumed one global file or one user:

- `storage.py` (Parquet read/write) became Postgres tables (`apps/api/app/services/*`).
- `indexing.py`'s `persist_candidates` / `append_candidate` (Parquet plus a
  FAISS file) became one Postgres insert per candidate, with a `pgvector`
  column.
- `matching/ranker.py`'s `SemanticRanker` (an in-memory `faiss.IndexFlatIP`
  built per request) became the `match_candidates` RPC
  (`supabase/migrations/0009`), an HNSW `<=>` search inside Postgres. The
  cosine scores are the same, since the embeddings are L2-normalized, and the
  API no longer loads every candidate or runs the model when you re-rank.
- `config.py` (local paths and one shared `.env`) became
  `apps/api/app/config.py`, which reads Supabase settings from the
  environment and has no dataset folders.
- `indexing.py`'s `process_resume()` isn't reused, because it builds the
  candidate ID from the filename and the path from a local folder.
  `apps/api/app/services/candidate_service.py` calls the three functions
  inside it (`extract_text`, `anonymize_text`, `extract_all`) and builds a
  `CandidateProfile` with a UUID and a Supabase Storage key instead.

Brought back later:

- `insights/`: OpenAI candidate reviews (Phase D), changed to read settings
  from the environment and to report token use.
- The old `automation/` scheduler and email reports came back in a new form
  as the weekly shortlist email (Phase E, part 2b). The local folder watcher
  stayed retired.

## Roadmap

- [x] **Phase A: multi-tenant skeleton.** Signup, upload and ranking, with
      tenant isolation proven in Postgres.
- [x] **Phase B: full backend API.** Candidate detail
      (`GET /candidates/{id}`), delete with Storage cleanup
      (`DELETE /candidates/{id}`), signed resume URLs, job list and detail
      (`GET /jobs`, `GET /jobs/{id}`), saved rankings without recomputing
      (`GET /jobs/{id}/results`) and pagination on both lists. It also fixed
      a real bug: re-ranking a job used to add duplicate `match_results` rows
      on every call, and now it replaces them.
- [x] **Phase C: ranking inside Postgres.** A `match_candidates` RPC
      (`SECURITY INVOKER`, `supabase/migrations/0009`) runs an HNSW `<=>`
      nearest-neighbour search over `candidates.embedding`. Before, the API
      pulled every candidate row into a FAISS index built for each request.
      RLS on `candidates` still limits the search to the caller's tenant, and
      `faiss-cpu` and `matching/ranker.py` are gone. The TF-IDF baseline
      came back as `POST /jobs/{id}/rank?method=tfidf`, computed on request
      and never saved, behind a Semantic / Keyword toggle on the job page.
      Skill-gap analytics came back as `GET /jobs/{id}/skill-gap` (the share
      of a job's saved shortlist missing each required skill), with a panel
      on the same page. The job form takes a comma-separated list of required
      skills.
- [x] **Phase D: billing and AI.** All four parts are live.
  - [x] Auth hardening. The free-tier password policy now asks for at least
        8 characters plus character requirements. Supabase's leaked-password
        check (HaveIBeenPwned) needs the Pro plan, so it waits until the
        project leaves the free tier, which would also remove the weekly
        pause and the signup email rate limit. The `get_advisors` warning
        about it is a known free-tier limit. It's about password hygiene and
        doesn't affect tenant isolation.
  - [x] AI candidate reviews (OpenAI). The copied `insights/` modules
        (`insight_generator`, `llm_client`, `schemas`) read the key and model
        from the environment and report token use. One structured call per
        candidate and job returns a summary, strengths, gaps, missing
        qualifications, a hiring recommendation and interview questions.
        Only `anonymized_text` goes to OpenAI, never `raw_text`. Results are
        cached in `candidate_insights` (RLS, one row per candidate and job,
        with token counts). `GET|POST /candidates/{id}/insights?job_id=…`
        reads or creates one (`?refresh=true` makes a new one; 503 if the key
        isn't set). In the UI, each ranked candidate on the job page has an
        expander, and the candidate page has a job picker; both use
        `components/insights.tsx`. A live test caught real names reaching
        OpenAI, so `anonymize_text()` got header-line, split-line and
        bilingual name detection plus messaging-handle redaction, on top of
        the regex and spaCy NER pass. Its docstring explains why it's still
        best effort for non-Western names and unusual layouts.
  - [x] Per-tenant OpenAI usage limits. An append-only `usage_events` table
        (`supabase/migrations/0011`, with RLS like every tenant table) gets
        one row per real OpenAI call; reading a cached review adds nothing.
        The monthly token limit comes from `tenants.plan` through a
        plan-to-limit map in `app/services/usage_service.py`, so Stripe only
        has to change `plan`. `ensure_within_budget()` blocks new reviews
        with a 402 once a tenant reaches its limit, and `GET /usage` returns
        this month's use, limit and remainder, shown as a small bar in the
        dashboard header.
  - [x] Stripe billing. Stripe Checkout (`POST /billing/checkout`, a
        subscription with `tenant_id` in its metadata), the billing portal
        (`POST /billing/portal`) and a webhook (`POST /billing/webhook`) that
        switches `tenants.plan` between `pro` and `trial` as subscriptions
        start and end. The webhook is the one route that skips user auth on
        purpose; Stripe's HMAC signature is what we trust there. No migration
        was needed, since `0002` already had `tenants.plan` and
        `tenants.stripe_customer_id`. The webhook was the first code to use
        the Supabase `service_role` key, now through
        `admin_client.get_admin_client()`, which it shares with the weekly
        email and nothing else. It needs that key because a webhook has no
        user JWT, and `tenants` has no UPDATE policy for users, so this
        signature-checked path is the only way a plan can change. Trial caps
        (10 candidates, 3 jobs, 200,000 AI tokens a month) live in
        `usage_service.py` and return 402; `pro` lifts all three. A real
        test-mode Checkout on the live site worked end to end. The only
        product is a placeholder at $29 a month, since real pricing isn't
        decided yet.
- [ ] **Phase E: match the old Streamlit dashboard, and redo its local
      automation for a hosted product.**
  - [x] Parts 1 and 2a (live). `create_job` finds required skills in the job
        description (`extract_skills`) and adds them to any you type. The job
        page has a top-K setting, a Semantic / Keyword / Compare
        (side-by-side) view, and highlights candidate skills that match the
        job's. The job form has sample job descriptions
        (`apps/web/lib/sampleJds.ts`). Bulk upload: `POST /candidates/upload/bulk`
        takes many PDFs, reports success or an error for each file and
        respects the Trial candidate cap; the candidates page has a
        multi-file picker.
  - [x] Part 2b: an optional weekly shortlist email per job. The code is
        written and deployed, but nothing gets sent until I add SMTP
        credentials and `REPORT_TRIGGER_SECRET` and create a GCP Cloud
        Scheduler job. Until then the job page says the emails aren't being
        sent yet; remove that note once they are. A checkbox on the job page
        calls `POST /jobs/{id}/email-reports`. An outside scheduler calls
        `POST /internal/run-weekly-reports`, which checks a shared-secret
        `X-Report-Token` header (the only other route without a user
        session) and runs `report_service.run_weekly_reports()`. For every
        job with emails on, that ranks the tenant's candidates with
        `match_candidates_for_tenant` (migration `0012`, a twin of
        `match_candidates` that takes the tenant explicitly, because this run
        has no RLS-scoped client), builds a plain-text email (rank, score,
        matching skills and missing skills) and sends it to the tenant owner
        through `email_service.py` (stdlib `smtplib`; it does nothing if SMTP
        isn't set). It imports nothing from `talent_ai_core.insights`, and a
        test checks its imports, so a timer can never run up OpenAI costs.
  - Retired for good: the local folder watcher and `scripts/evaluate.py`'s
    Precision@K benchmark. Neither fits a multi-tenant product.
- [x] **Security and robustness pass (2026-09-28)**, from a review of the
      whole codebase:
  - `0013` closed a cross-tenant hole. Users could update their own
    `profiles` row, so someone calling PostgREST directly could change their
    `tenant_id` and read another tenant's data, if they knew that tenant's
    UUID (it appears in resume Storage paths). `profiles` is now read-only
    for users. The same migration made `usage_events` append-only; before,
    a tenant could delete its own rows to reset its OpenAI budget. Only one
    tenant existed in production then.
  - `0014` sets `hnsw.iterative_scan = strict_order` on both ranking RPCs,
    so a tenant still gets a full top-K once many tenants share the HNSW
    index.
  - API: a missing or other tenant's ID now returns 404 instead of an
    unhandled 500 (`.single()` became `db_utils.fetch_one`), database errors
    are answered inside CORS, `top_k` is capped at 100,
    `GET /candidates/{id}` no longer returns `raw_text` or the embedding, an
    unusable OpenAI response no longer causes a 500 (its tokens still
    count), and keyword ranking on text with only stop words returns an
    empty list instead of "job not found".
  - Web: signup shows "check your email" when confirmation is needed
    (before, it sent people back to `/login` with no explanation), and the
    password minimum matches Supabase's 8 characters.
- [x] **Writing pass (2026-10-16).** All user-facing text, the API's error
      messages, the weekly email, the legal pages and both docs were
      rewritten with the Humanizer and Stop Slop skills. Pages now show the
      server's own error sentence instead of raw JSON, login and signup
      explain Supabase errors in plain words, and the legal pages no longer
      claim things the app doesn't do. `CLAUDE.md` has the style rules
      under "Writing style".
- [x] **Design pass (2026-10-19).** A fix pass with the UI/UX Pro Max,
      taste-skill, Frontend Design and Emil Kowalski skills, keeping the
      existing look. Fixed: the dashboard header overflowed a phone screen
      (every dashboard page scrolled sideways at 375px) and wrapped its text
      on desktop, so it's now two rows; the resume upload couldn't be reached
      by keyboard, and now also takes drag-and-drop; native controls stayed
      light in dark mode; red error text failed contrast in dark mode; inputs
      hid their focus ring and had no visible labels; the "Show top" box made
      "20" impossible to type; scores could read "-1.2%"; the Jobs tab wasn't
      highlighted on a job's page. Added a skip link, screen-reader
      announcements, press feedback and a short reveal for AI reviews (both
      respect reduced motion), and a captioned example ranking on the landing
      page. Every page passes a WCAG AA contrast check in light and dark mode
      at phone and desktop widths. `CLAUDE.md` has the rules under "Design
      rules".
- [x] **Phase F (partial): production deployment.** Vercel, Cloud Run and
      Supabase went live early, before Phases B to E, so colleagues could
      try it. Monitoring and CI/CD are still open.

## Local development

### Backend (`apps/api`)

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements-dev.txt
cp .env.example .env            # fill in SUPABASE_URL and SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8010
pytest tests/
```

The OCR fallback needs the `tesseract-ocr` and `poppler` programs installed,
as in the original project. They're optional; without them, scanned resumes
just produce less text.

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
cp .env.local.example .env.local   # the same Supabase project's URL and anon key, plus NEXT_PUBLIC_API_URL
npm run dev
```

### Database

The schema lives in `supabase/migrations/*.sql`, applied with the Supabase
MCP tool `apply_migration` to the `TalentAI` project
(`ljtjlvyezkyakayetlod`), or pasted into the Supabase SQL editor when that
tool is blocked. Migrations run in order and only add to what came before.
For example, `0007` hardened the setup (moving `vector` out of `public`, and
two RLS helper functions into a `private` schema PostgREST doesn't expose)
without rewriting `0001` to `0006`.

## What's been tested by hand

Locally, against the real Supabase project:

1. I signed up two companies, "Acme Recruiting" and "Beta Staffing".
2. As Acme, I uploaded real resume PDFs. Each was parsed, anonymized
   (`[NAME]` and `[EMAIL]` showed up in `anonymized_text`), skill-tagged,
   embedded and stored.
3. I ranked Acme's 3 candidates against an "IT Systems Administrator" job.
   The IT resume came first, ahead of an accountant and an engineer.
4. Through the API, Beta Staffing saw none of Acme's candidates, and Acme saw
   none of Beta's once Beta uploaded one.
5. Looking straight at Postgres as an admin, with RLS bypassed, both
   tenants' rows sat in the same `candidates` table. The RLS policy keeps
   them apart; nothing else does.

In production:

1. Vercel, Cloud Run and Supabase run together with matching CORS settings,
   environment variables and Supabase Auth redirect URLs.
2. A real resume went through the live Cloud Run backend (parse, anonymize,
   extract skills, embed, store), and ranking it against a real job
   description gave a sensible score.
3. I signed up on the live site myself (not through Claude) with my own
   email, received and clicked a real Supabase confirmation email, and
   logged in.

`get_advisors` (Supabase's security checks) is clean apart from the
leaked-password setting described in Phase D. The backend has about 80 unit
tests (`pytest tests/`) that use a mocked Supabase client and never touch the
network.

## Lessons from going live

These failures came up while deploying, and each was found by debugging the
live system. They're worth knowing before you touch the deploy setup.

- **`apps/web/middleware.ts` crashed in production** with
  `ReferenceError: __dirname is not defined`. Next.js 16 replaced
  `middleware.ts` with `proxy.ts`, and the change is more than a rename:
  `proxy.ts` runs on the Node.js runtime by default, while the old
  `middleware.ts` still runs on the Edge runtime, which has no `__dirname`
  (the bundled Supabase SSR client uses it). Renaming the file and the
  exported function (`middleware` to `proxy`) fixed it.
- **Cloud Run rejected the container** with "failed to start and listen on
  the port". The Dockerfile hardcoded `--port 8000`, but Cloud Run requires
  the port in its `PORT` variable (8080 by default). Render had tolerated the
  hardcoded port. A shell-form `CMD`, so that `${PORT:-8000}` expands, fixed
  it.
- **The first real upload hung, then returned a 502.** `embeddings/embedder.py`
  downloads the `all-MiniLM-L6-v2` model from Hugging Face the first time
  it's used, and on Cloud Run that got a `429 Too Many Requests`, because
  Hugging Face limits anonymous downloads from shared cloud IPs. The
  Dockerfile now downloads the model at build time (one
  `RUN python -c "...SentenceTransformer(...)"` line), so the running
  container never makes that call.
- **`gcloud run deploy --source .` hung for over 10 minutes** on the first
  upload, because without a `.gcloudignore` it was uploading the whole 1.4 GB
  local `.venv`. `apps/api/.gcloudignore` (same exclusions as `.gitignore`)
  fixed it, and uploads take seconds now.
- **Vercel kept using an old backend URL after I edited an env var.**
  `NEXT_PUBLIC_API_URL` had been created as a **Secret**, and Vercel doesn't
  pass Secret variables to the `next build` step, where `NEXT_PUBLIC_*`
  values get baked into the browser code. Vercel can't convert a Secret to
  Config in place, so I deleted all three `NEXT_PUBLIC_*` variables,
  recreated them as **Config** and redeployed. If a Vercel deploy ignores an
  env var change again, check this first.
- **A broken Vercel routing manifest**, left over from the `__dirname` crash,
  returned a 404 on every path even after the code was fixed and the build
  passed ("Ready", clean logs, still 404). Following Vercel's community advice
  for exactly this, I deleted the project and imported it again from GitHub,
  which reset the manifest. Redeploying in place didn't.
