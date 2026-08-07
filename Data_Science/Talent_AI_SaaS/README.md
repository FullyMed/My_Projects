# Talent AI SaaS

Multi-tenant rebuild of the [Talent_AI](../Talent_AI)
capstone project (resume parsing + semantic candidate ranking) as a product
multiple companies can sign up for and use, each with their own isolated
candidate data.

This is **Phase A** of a longer roadmap: a thin but real vertical slice that
proves the multi-tenant architecture works end-to-end (signup -> upload a
resume -> submit a job description -> get a ranking -> confirm another
company can't see any of it), rather than a full rebuild of every feature
the original Streamlit dashboard had.

## Stack

- **Backend**: FastAPI (`apps/api`)
- **Database + Auth + Storage**: Supabase — Postgres with `pgvector`, Auth,
  and Storage (project `talent-ai-saas`, `https://ljtjlvyezkyakayetlod.supabase.co`)
- **Frontend**: Next.js App Router (`apps/web`), deployed to Vercel
- **Billing**: Stripe (not wired up yet — Phase D)

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

- [x] **Phase A** (this): multi-tenant skeleton — signup, upload, rank, RLS-proven isolation
- [ ] **Phase B**: full backend API (candidate detail/delete, re-rank, pagination)
- [ ] **Phase C**: push ranking into pgvector directly (`<=>` + the `hnsw` index) for scale; migrate the TF-IDF baseline and skill-gap analytics in
- [ ] **Phase D**: auth hardening (enable Supabase's leaked-password protection — see `get_advisors`), Stripe billing, per-tenant OpenAI usage metering, then wire in AI insights
- [ ] **Phase E**: full dashboard feature parity with the original Streamlit app
- [ ] **Phase F**: production deployment, observability, CI/CD

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

Known rough edges from this session, left as-is rather than over-polished
for a Phase A skeleton:
- `apps/web/middleware.ts` uses a convention Next.js 16 has deprecated in
  favor of `proxy.ts` — still functional, flagged by a build warning only.
- The FastAPI Dockerfile was written to mirror the working local setup
  (`tesseract-ocr`, `poppler-utils`, the same spaCy model wheel install) but
  wasn't itself built and run in Docker this session — only smoke-tested via
  the local `uvicorn` dev server against real PDFs.
