# CLAUDE.md

Guidance for Claude Code (and future-you) working in this repository. The
README explains *what the product is and why*; this file is about *not
breaking things while changing the code*. Keep both updated together —
this file whenever a convention/gotcha changes, the README whenever a
feature/phase changes.

## Commands

```bash
# Backend (apps/api)
cd apps/api
python -m venv .venv && .venv\Scripts\activate      # Windows
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8010
pytest tests/                                         # full suite, ~70 tests, no network

# Frontend (apps/web)
cd apps/web
npm install
npm run dev                                            # http://localhost:3000
npm run build                                           # tsc + production build
npx eslint <changed files>                              # lint just what you touched
```

There's no CI yet (Phase F, not started) — `pytest`, `tsc --noEmit`, `npm run
build`, and a targeted `eslint` are the full local check before deploying.
Two pre-existing eslint issues are known and left alone: a
`react-hooks/set-state-in-effect` on the jobs/candidates list pages'
`load*(offset)` calls, and `@next/next/no-html-link-for-pages` on a couple
of plain `<a>` nav links. Don't "fix" these as a drive-by — they're
long-standing, not new breakage, and touching them is out of scope for
unrelated changes.

## Environment

Two separate `.env` files — `apps/api/.env` (see `.env.example` for the
full current list: Supabase, OpenAI, Stripe, service_role, SMTP/report
secrets) and `apps/web/.env.local` (`.env.local.example`: Supabase publishable
config + `NEXT_PUBLIC_API_URL`).

**`CORS_ORIGINS` and `FRONTEND_URL` are prod-specific overrides that only
ever get set directly on Cloud Run — never mirror them from local `.env`.**
Local `.env` correctly has both pointed at `http://localhost:3000`; Cloud
Run's copies additionally/instead include the live Vercel URL
(`https://my-projects-zeta-three.vercel.app`). This bit us for real once
(2026-09-25): a deploy that did a full env-var replace from local `.env`
silently wiped the prod values back to localhost-only, breaking the live
site's CORS and Stripe's checkout redirect until caught and fixed. **Never
deploy with a full env replacement (`--env-vars-file` built from local
`.env`, `--set-env-vars` with the complete set) for this service — always
use `gcloud run services update --update-env-vars` (or `deploy
--update-env-vars`) scoped to just the keys that changed.** If a value has
spaces (e.g. a Gmail app password), don't fight shell quoting — generate a
small YAML with just the new/changed keys and deploy with
`--env-vars-file=that-file.yaml`, never one built from the whole `.env`.

## Deployment

Nothing auto-deploys from a push except the Vercel frontend (and even that
needs a manual **Redeploy** click if only an env var changed, not code —
see "Vercel env var type" gotcha below). The backend always needs an
explicit command after any `apps/api` change:

```bash
cd apps/api
gcloud run deploy talent-ai-api --source . --region us-central1 \
  --project talent-ai-saas-app --memory 2Gi --cpu 2 --timeout 300 \
  --allow-unauthenticated
```

(`gcloud` isn't on PATH by default: prepend
`C:\Users\felix\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin` each
session, or in PowerShell call `gcloud.cmd` directly if `gcloud.ps1`'s
execution policy complains.)

Adding/removing DB objects needs a new numbered file in
`supabase/migrations/` applied via the Supabase `apply_migration` MCP tool
against project `ljtjlvyezkyakayetlod` (`TalentAI`) — migrations are
additive, never rewrite an old one.

**Before assuming a DB-touching failure is a code bug, check whether the
Supabase project auto-paused** (free tier, pauses after ~1 week of
inactivity) — `list_projects` and look for `status: "INACTIVE"`. Only the
user can click Restore in the dashboard; the `restore_project` MCP tool is
blocked by Claude Code's own safety classifier (misfires as "irreversible
deletion" even though restoring un-pauses, not deletes).

## Stack

| Concern | Approach |
|---|---|
| Backend | FastAPI (`apps/api`), containerized, Cloud Run |
| DB / Auth / Storage | Supabase — Postgres + `pgvector`, Auth, Storage |
| Frontend | Next.js App Router (`apps/web`), Vercel |
| AI | OpenAI (`gpt-4o-mini` default) for candidate insights only |
| Billing | Stripe Checkout + billing portal + webhook |
| Email | stdlib `smtplib` (no email SDK dependency) |

## Architecture

### Tenant isolation is Postgres RLS, not app code

Every request carries the caller's own Supabase JWT through to
PostgREST/Storage (`apps/api/app/deps.py::get_scoped_client`). A bug in a
service function can't leak another tenant's rows, because the database
itself refuses them regardless of what the query asks for. **When adding a
new table, add its RLS policy in the same migration** — nothing reads as
"tenant-scoped" by default; it's opt-in per table.

### The `service_role` key is deliberately rare

`apps/api/app/services/admin_client.py::get_admin_client()` is the **only**
way to get one, and there are exactly two callers, both server-triggered
(no user session to scope a normal client with):
`billing_service.handle_stripe_event` (trust = Stripe's HMAC signature) and
`report_service.run_weekly_reports` (trust = the `X-Report-Token`
shared-secret header on `/internal/run-weekly-reports`). If you're reaching
for `get_admin_client()` anywhere else, you almost certainly want
`get_scoped_client(user.token)` instead — that's the actual security
boundary in this codebase, and widening service_role usage widens it back
to "app code has to get it right," which is the thing RLS exists to avoid.

### Plan limits (`apps/api/app/services/usage_service.py`)

Everything gated by plan reads `tenants.plan` (`'trial'` / `'pro'` — a
Phase A hook, `supabase/migrations/0002`) through one shared
`get_tenant_plan()`. Three independent limits, each a plan→value dict in
this one file: `PLAN_TOKEN_LIMITS` (OpenAI tokens/month, backed by the
append-only `usage_events` ledger — deliberately separate from
`candidate_insights`, which upserts and so can't answer "how much was
spent"), `PLAN_CANDIDATE_LIMITS`, `PLAN_JOB_LIMITS` (row counts, `None` =
unlimited). Stripe's webhook only ever updates `tenants.plan` — adding a
real paid tier later means editing these three dicts, not touching billing
code. All three raise `PermissionError` on the caller, which every router
maps to **402**.

### Ranking pipeline

`apps/api/talent_ai_core/` is the vendored, storage-agnostic pipeline
(parse → anonymize → extract → embed → rank) from the original single-user
capstone — reused close to unchanged. Semantic ranking itself runs as a
single indexed Postgres query (`match_candidates` RPC,
`supabase/migrations/0009`, `<=>` + the `candidates_embedding_idx` HNSW
index) rather than loading candidates into the API process. The weekly
report path needs a tenant-explicit twin, `match_candidates_for_tenant`
(`0012`) — it runs under `get_admin_client()`, which bypasses RLS, so it
can't rely on RLS to scope the search the way the normal request path does.

### Anonymization is best-effort, not a guarantee

`talent_ai_core/extraction/anonymize.py` strips emails/phones reliably via
regex, and names via a resume-header heuristic + spaCy NER — it is **not**
a guaranteed PII scrubber, especially for non-Western names or unusual
resume layouts (its own docstring says so, and a live test once caught a
real name reaching OpenAI before the header heuristic was added). Only
`anonymized_text`, never `raw_text`, is ever sent to OpenAI — but don't
upgrade any comment to claim names are *never* sent; that was true once and
was wrong.

### Resume upload guardrails

10MB size cap + a `%PDF-` magic-byte check (`routers/candidates.py`) —
`Content-Type` is client-supplied and trivially spoofed, so it's checked
but not trusted alone. Both single (`/candidates/upload`) and bulk
(`/candidates/upload/bulk`) paths go through `process_and_store_resume`,
which itself starts with `ensure_can_add_candidate` (fail fast on the plan
cap, before the expensive parse/embed work).

### Favicon / app icon set (`apps/web/app/`)

All code-generated via `next/og`'s `ImageResponse`, sharing one visual
(`app/_lib/icon-badge.tsx::IconBadge` — indigo `#4f46e5` rounded square,
white "T") so the mark can't drift between sizes:

| File | Purpose | Size |
|---|---|---|
| `icon.tsx` | Browser tab favicon (Next's special `icon` convention) | 32×32 |
| `apple-icon.tsx` | iOS "Add to Home Screen" (special `apple-icon` convention) | 180×180 |
| `icon-192/route.tsx`, `icon-512/route.tsx` | Plain route handlers, **not** the special convention (that only supports one size per file) — exist so `manifest.ts` has fixed-size PNGs to point at | 192×192, 512×512 |
| `manifest.ts` | PWA manifest — `theme_color`/`background_color` must match `globals.css`'s `--accent`/`--background` if either ever changes | — |

No static `favicon.ico` — deliberately skipped. `icon.tsx` already covers
the tab favicon via Next's generated `<link rel="icon">`, and the special
`favicon.ico` convention can't be code-generated anyway (Next's own docs:
"You cannot generate a `favicon` icon"). If the mark itself ever changes,
edit `IconBadge` once — every size picks it up.

### Custom 404 (`apps/web/app/not-found.tsx`)

A single root-level `not-found.tsx` — since v13.3.0 Next.js also uses the
root one for any unmatched URL app-wide, not just an explicit `notFound()`
call, so one file is enough here (this app has a single root layout, no
need for the experimental `global-not-found.js`). Renders inside
`app/layout.tsx`, so it picks up `globals.css`'s light/dark theming for
free. Styled to match `app/page.tsx` (the landing page) — same `Logo`,
same plain-`<a>`-styled-as-button pattern (this app doesn't use
`next/link` anywhere; matching that here is deliberate, not a missed
lint fix). "Go home" always points at `/`, not the dashboard — a 404 can be
hit by a signed-out visitor, and `/` is the one destination that's correct
either way.

### Loading states

Two layers, don't conflate them:

- **Route-level `loading.tsx`** (`app/loading.tsx`, `app/dashboard/loading.tsx`)
  — Next.js's Suspense-boundary convention, shown while a route segment is
  being rendered on the server (matters most for `candidates/[id]` and
  `jobs/[id]`, which are dynamic/server-rendered per request, not
  pre-built) and before the page's own client JS has mounted. Both are
  intentionally the exact same markup as `dashboard/layout.tsx`'s own
  `!ready` auth-check spinner (`<main class="flex min-h-screen
  items-center justify-center"><Spinner .../></main>`) so there's no
  visual jump between "route loading" and "layout mounted, checking auth" —
  keep them in sync if that markup ever changes.
- **Per-page data-loading state** — every page that fetches its own data
  client-side (`useEffect` + `apiFetch`) tracks its own `loading` boolean
  and renders a centered `<Spinner className="h-6 w-6 text-muted" />` (list
  pages: `h-6 w-6` in a `py-8`/`py-12` block; full-page: centered in a
  `min-h-screen`/`py-16` block). **Always reuse `Spinner` from
  `components/ui.tsx` for this — don't reach for `animate-pulse` or a
  bespoke dot.** Two list pages did that until 2026-09-25 and it read as an
  inconsistent second loading language next to every other page's Spinner;
  fixed by switching them to the same component.

## Known platform gotchas (not this project's bugs, still worth knowing)

- **Vercel env var type**: `NEXT_PUBLIC_*` vars must be **Config** type, not
  **Secret** — Secret-type vars aren't visible to `next build`, so an edit
  silently does nothing and the old value stays baked into the bundle
  forever. Vercel won't convert in place; delete and recreate.
- **Next.js 16**: `middleware.ts` → `proxy.ts` isn't just a rename — the old
  convention runs on the Edge runtime (`__dirname is not defined` crash
  from the Supabase SSR bundle), the new one defaults to Node.js.
- **Windows temp paths**: a natively-run Python process's `/tmp` doesn't
  resolve the way you'd expect from this Bash tool — use a real Windows
  temp path for scratch files (PDF generation, etc.), not `/tmp`.
