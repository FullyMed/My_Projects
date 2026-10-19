# CLAUDE.md

Guidance for Claude Code (and future you) working in this repository. The
README explains what the product is and why; this file is about not breaking
things while you change the code. Keep both up to date: this file whenever a
convention or gotcha changes, the README whenever a feature or phase changes.

## Commands

```bash
# Backend (apps/api)
cd apps/api
python -m venv .venv && .venv\Scripts\activate      # Windows
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8010
pytest tests/                                         # full suite, ~80 tests, no network

# Frontend (apps/web)
cd apps/web
npm install
npm run dev                                            # http://localhost:3000
npm run build                                           # tsc + production build
npx eslint <changed files>                              # lint just what you touched
```

There's no CI yet (Phase F hasn't started), so `pytest`, `tsc --noEmit`,
`npm run build` and a targeted `eslint` are the whole local check before a
deploy. Two eslint issues are known and left alone: a
`react-hooks/set-state-in-effect` on the jobs and candidates list pages'
`load*(offset)` calls, and `@next/next/no-html-link-for-pages` on a few plain
`<a>` links. Don't fix them as a drive-by. They're old, not new breakage, and
touching them is out of scope for unrelated changes.

The owner commits and pushes himself. Leave changes in the working tree and
list the changed files.

## Environment

There are two `.env` files: `apps/api/.env` (`.env.example` lists every key:
Supabase, OpenAI, Stripe, service_role, SMTP and the report secret) and
`apps/web/.env.local` (`.env.local.example`: the Supabase publishable config
and `NEXT_PUBLIC_API_URL`).

**`CORS_ORIGINS` and `FRONTEND_URL` are production overrides that only ever
get set directly on Cloud Run. Never copy them from the local `.env`.** The
local `.env` points both at `http://localhost:3000`; Cloud Run's copies
include the live Vercel URL (`https://my-projects-zeta-three.vercel.app`).
This broke production once (2026-09-25): a deploy that replaced every env var
with the local `.env` set both back to localhost only, which broke the live
site's CORS and Stripe's checkout redirect until someone noticed. **Never
deploy this service with a full env replacement (`--env-vars-file` built from
the local `.env`, or `--set-env-vars` with the complete set). Use
`gcloud run services update --update-env-vars` (or `deploy
--update-env-vars`) with only the keys that changed.** If a value contains
spaces (a Gmail app password, say), skip the shell-quoting fight: write a
small YAML with only the new or changed keys and deploy with
`--env-vars-file=that-file.yaml`. Never build that file from the whole
`.env`.

## Deployment

Only the Vercel frontend deploys on push, and even Vercel needs a manual
**Redeploy** click when only an env var changed (see the Vercel gotcha at the
end). The backend needs this command after every `apps/api` change:

```bash
cd apps/api
gcloud run deploy talent-ai-api --source . --region us-central1 \
  --project talent-ai-saas-app --memory 2Gi --cpu 2 --timeout 300 \
  --allow-unauthenticated
```

`gcloud` isn't on PATH by default. Prepend
`C:\Users\felix\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin` each
session, or call `gcloud.cmd` by its full path if PowerShell's execution
policy blocks `gcloud.ps1`. The owner's VS Code terminal is cmd, not
PowerShell, so a command for him to paste must not start with PowerShell's
`&`.

Adding or removing database objects needs a new numbered file in
`supabase/migrations/`, applied with the Supabase `apply_migration` MCP tool
to project `ljtjlvyezkyakayetlod` (`TalentAI`). Migrations only add; never
rewrite an old one. Claude Code's auto-mode check can refuse
`apply_migration` as a production deploy (it did for `0014`). If that
happens, the owner applies it, either by pasting the file into the Supabase
SQL editor or by approving the tool call.

**Before you blame the code for a database failure, check whether the
Supabase project paused itself** (free tier, after about a week without use):
run `list_projects` and look for `status: "INACTIVE"`. Only the owner can
click Restore in the dashboard. Claude Code's safety check blocks the
`restore_project` MCP tool, reading it as an "irreversible deletion" when
restoring only un-pauses the project.

## Stack

| Concern | Approach |
|---|---|
| Backend | FastAPI (`apps/api`), in a container on Cloud Run |
| DB, auth, storage | Supabase: Postgres with `pgvector`, Auth, Storage |
| Frontend | Next.js App Router (`apps/web`) on Vercel |
| AI | OpenAI (`gpt-4o-mini` by default), for candidate reviews only |
| Billing | Stripe Checkout, the billing portal and a webhook |
| Email | stdlib `smtplib` (no email SDK) |

## Architecture

### Postgres RLS isolates tenants, not app code

Every request carries the caller's own Supabase JWT through to PostgREST and
Storage (`apps/api/app/deps.py::get_scoped_client`). A bug in a service
function can't leak another tenant's rows, because the database refuses them
whatever the query asks for. **When you add a table, add its RLS policy in
the same migration.** Nothing is tenant-scoped by default; each table opts
in.

**Any signed-in user can also call PostgREST directly** with the publishable
key and their own JWT, skipping FastAPI entirely. So an RLS policy is the
whole rule, and the API's checks don't back it up. Two policies got this
wrong until `0013` (2026-09-28). Users could update their own `profiles` row
with no `WITH CHECK`, so a user could change their `tenant_id` and land
inside another tenant, since every isolation policy looks up the caller's
tenant through that column. And `usage_events` was `for all`, so a tenant
could delete its own ledger rows to reset its OpenAI budget. Now `profiles`
is read-only for users (only the signup trigger writes it) and `usage_events`
allows only SELECT and INSERT. Before you write a `for all` or `for update`
policy, work out what a user could do by writing that row by hand. Known,
accepted gap: the trial candidate and job caps are checked in app code only,
so a direct insert can go past them. That costs nothing, unlike the token
budget.

### Single-row reads: `fetch_one`, never `.single()`

supabase-py's `.single()` **raises** when no row matches (PostgREST answers
406) instead of returning empty data. The `if not result.data: 404` that
usually follows it never runs, and a missing ID (or another tenant's, which
RLS makes look the same) becomes an unhandled 500. Use
`services/db_utils.fetch_one(query)`, which wraps `.maybe_single()` and
returns the row dict or `None`. In tests, mock
`...maybe_single.return_value.execute` and return `None` (not `_resp(None)`)
for "no row", because that's what the real client does. `main.py` also turns
any `postgrest.APIError` into a JSON response (Postgres `22P02`, a path ID
that isn't a UUID, becomes a 404; anything else a 500), so it's answered
inside `CORSMiddleware`. An unhandled exception is answered outside it, and
then the browser only sees "Failed to fetch".

### Error messages reach the user as written

The frontend shows an error response's `detail` to the user word for word:
`apiFetch` (`apps/web/lib/api.ts`) throws an `ApiError` carrying the status
and `detail`, and every page's `catch` calls `errorMessage(err)`. So every
`HTTPException` detail, and every `ValueError` / `PermissionError` /
`RuntimeError` message a router passes on as a detail, is a sentence for a
recruiter, written to the rules under "Writing style". Messages raised from
more than one place live in `apps/api/app/messages.py`. If a response has no
string `detail` (a 422 validation list, an HTML error page) or the server
can't be reached, the page shows a generic sentence instead of raw JSON. Code
that needs a specific status checks `err.status`, never the message text.
Supabase Auth errors on the login and signup pages go through
`friendlyAuthError()` (`apps/web/lib/authErrors.ts`); add a case there
instead of showing `error.message`.

### The `service_role` key stays rare

`apps/api/app/services/admin_client.py::get_admin_client()` is the **only**
way to get one, and it has exactly two callers, both started by a server
with no user session to scope a normal client with:
`billing_service.handle_stripe_event` (trusted because of Stripe's HMAC
signature) and `report_service.run_weekly_reports` (trusted because of the
`X-Report-Token` shared-secret header on `/internal/run-weekly-reports`). If
you're reaching for `get_admin_client()` anywhere else, you almost certainly
want `get_scoped_client(user.token)`. That's the real security boundary in
this codebase, and every extra service_role caller puts us back to "app code
has to get it right", which is what RLS exists to avoid.

### Plan limits (`apps/api/app/services/usage_service.py`)

Everything that depends on the plan reads `tenants.plan` (`'trial'` or
`'pro'`, a Phase A hook from `supabase/migrations/0002`) through one shared
`get_tenant_plan()`. There are three separate limits, each a plan-to-value
dict in this file: `PLAN_TOKEN_LIMITS` (OpenAI tokens a month, counted from
the append-only `usage_events` table, kept apart from `candidate_insights`
because that table upserts and so can't say how much was spent),
`PLAN_CANDIDATE_LIMITS` and `PLAN_JOB_LIMITS` (row counts, `None` meaning
unlimited). Stripe's webhook only ever changes `tenants.plan`, so a real paid
tier later means editing these three dicts, not the billing code. All three
raise `PermissionError`, which every router turns into a **402**. The
messages tell the user what to do next, which depends on the plan (only the
Trial message suggests upgrading) and on the limit (only candidates can be
deleted to make room).

### Ranking pipeline

`apps/api/talent_ai_core/` is the pipeline (parse, anonymize, extract,
embed, rank) copied from the original single-user capstone and reused almost
unchanged; it doesn't care where data is stored. Semantic ranking runs as a
single indexed Postgres query (the `match_candidates` RPC,
`supabase/migrations/0009`, using `<=>` and the `candidates_embedding_idx`
HNSW index) instead of loading candidates into the API process. The weekly
email needs a twin that takes the tenant explicitly,
`match_candidates_for_tenant` (`0012`), because it runs under
`get_admin_client()`, which bypasses RLS, so RLS can't limit its search the
way it does on the normal request path.

The HNSW index covers every tenant, and the tenant filter (RLS, or the
explicit `tenant_id` condition) applies to whatever the index scan returns.
Without pgvector's iterative scan, that's at most `hnsw.ef_search` (40) rows
across all tenants, so once there are many tenants a tenant could get fewer
than `top_k` results, or none. `0014` sets `hnsw.iterative_scan =
strict_order` on both functions, and any new vector-search function over a
shared index needs the same `SET` clause. That `SET` clause fails with
`42501: permission denied to set parameter` unless pgvector's library is
already loaded in the session (the `postgres` role isn't a superuser), so
start such a migration with a throwaway `select '[1]'::extensions.vector;`,
as `0014` does.

### Anonymization is best effort

`talent_ai_core/extraction/anonymize.py` removes emails and phone numbers
reliably with regexes, and names with a resume-header heuristic plus spaCy
NER. It is **not** a guaranteed PII scrubber, especially for non-Western
names or unusual layouts. Its own docstring says so, and a live test once
caught a real name reaching OpenAI before the header heuristic existed. Only
`anonymized_text`, never `raw_text`, goes to OpenAI. Don't change any comment
or page to claim names are *never* sent; that was once claimed and was
wrong. The candidate page and the Privacy Policy both say the removal can
miss things.

### Resume upload guardrails

A 10 MB size cap and a `%PDF-` magic-byte check (`routers/candidates.py`).
`Content-Type` comes from the client and is easy to fake, so it's checked but
not trusted on its own. The single (`/candidates/upload`) and bulk
(`/candidates/upload/bulk`) routes both go through `process_and_store_resume`,
which starts with `ensure_can_add_candidate` so a blocked upload fails before
the expensive parse and embed work.

### Favicon and app icons (`apps/web/app/`)

All generated in code with `next/og`'s `ImageResponse`, sharing one visual
(`app/_lib/icon-badge.tsx::IconBadge`: an indigo `#4f46e5` rounded square
with a white "T") so the mark can't drift between sizes:

| File | Purpose | Size |
|---|---|---|
| `icon.tsx` | Browser tab favicon (Next's special `icon` convention) | 32×32 |
| `apple-icon.tsx` | iOS "Add to Home Screen" (special `apple-icon` convention) | 180×180 |
| `icon-192/route.tsx`, `icon-512/route.tsx` | Plain route handlers, **not** the special convention (it allows one size per file); they give `manifest.ts` fixed-size PNGs to point at | 192×192, 512×512 |
| `manifest.ts` | PWA manifest. Its `theme_color` and `background_color` must match `globals.css`'s `--accent` and `--background` if either changes | |

There's no static `favicon.ico`, on purpose. `icon.tsx` already covers the
tab favicon through Next's generated `<link rel="icon">`, and the special
`favicon.ico` convention can't be generated in code anyway (Next's docs: "You
cannot generate a `favicon` icon"). If the mark changes, edit `IconBadge`
once and every size picks it up.

### Custom 404 (`apps/web/app/not-found.tsx`)

One root-level `not-found.tsx`. Since v13.3.0, Next.js also uses the root one
for any unmatched URL, not only an explicit `notFound()` call, so one file is
enough (this app has a single root layout and doesn't need the experimental
`global-not-found.js`). It renders inside `app/layout.tsx`, so it gets
`globals.css`'s light and dark theming for free. It matches `app/page.tsx`
(the landing page): same `Logo`, same plain `<a>` styled as a button. This app
doesn't use `next/link` anywhere, and matching that here is deliberate, not a
missed lint fix. "Back to home" always points at `/`, not the dashboard: a
signed-out visitor can hit a 404, and `/` is right either way.

### Loading states

There are two layers; don't mix them up.

- **Route-level `loading.tsx`** (`app/loading.tsx`, `app/dashboard/loading.tsx`):
  Next.js's Suspense-boundary convention, shown while the server renders a
  route segment (this matters most for `candidates/[id]` and `jobs/[id]`,
  which render per request) and before the page's client JS mounts. Both use
  exactly the same markup as `dashboard/layout.tsx`'s `!ready` auth-check
  spinner (`<main class="flex min-h-screen items-center
  justify-center"><Spinner .../></main>`), so nothing jumps between "route
  loading" and "layout mounted, checking auth". Keep them in step if that
  markup changes.
- **Per-page data loading**: every page that fetches its own data in the
  browser (`useEffect` plus `apiFetch`) tracks its own `loading` boolean and
  shows a centered `<Spinner className="h-6 w-6 text-muted" />` (list pages:
  `h-6 w-6` in a `py-8` or `py-12` block; full pages: centered in a
  `min-h-screen` or `py-16` block). **Always use `Spinner` from
  `components/ui.tsx`. Don't reach for `animate-pulse` or a custom dot.** Two
  list pages did until 2026-09-25, and it looked like a second loading style
  next to every other page's Spinner.

### Terms of Use and Privacy Policy (`apps/web/app/terms/`, `apps/web/app/privacy/`)

Public pages that share their layout and prose styling through
`components/LegalPageLayout.tsx`, the same idea as the icon and 404 sections
above: one file owns the look, and the page files are only content. The
content matches the product: the multi-tenant model, the
anonymize-then-send-to-OpenAI flow, Stripe billing, the list of
sub-processors and, importantly, that an uploaded candidate isn't a user of
the Service and the uploading company is the data controller for that
candidate's data. **Claude drafted them; a lawyer hasn't reviewed them.**
Both files have a `[PLACEHOLDER]` comment at the top for the legal entity name
and governing jurisdiction. Fill those in, and get a real legal review before
relying on them with paying customers whose candidate data might fall under
GDPR or CCPA.

They're plain English, but what they promise is binding, so change the code
and the pages together and bump `lastUpdated` when the wording changes. Keep
them true to the app. On 2026-10-16 they said you could delete "your data at
any time" from "the Candidates page", but only candidates can be deleted, from
each candidate's own page; jobs and accounts need an email. Button names
quoted in them (Manage billing, Delete) must match the real labels. If you
add a sub-processor (a different email provider, a second AI vendor), update
Privacy section 5 in the same change.

They're linked from the landing-page footer and, more importantly, from a
consent line on the signup form ("By signing up, you agree to our Terms of
Use and Privacy Policy"). That consent line is the link that matters for
enforceability, so don't remove it in a redesign without an equivalent.

## Writing style

On 2026-10-16 the owner had all user-facing text, the API's error messages,
the weekly email, the legal pages and both docs rewritten with the Humanizer
and Stop Slop skills. Keep new text in the same style.

- User-facing text (pages, buttons, messages, page titles, the weekly email)
  uses a plain, friendly voice for recruiters: "you" and "we", everyday
  words, short sentences. American spelling ("organization", "anonymized"),
  as the app already uses. Explain jargon or leave it out: the job page says
  what semantic and keyword ranking do instead of saying "TF-IDF". No hype
  words such as powerful, seamless, effortless, "AI-powered" or
  "intelligence".
- Headings, buttons, labels, nav items and page titles use sentence case:
  "Your jobs", "Show top", "Choose resume PDFs". Page titles read
  "Page not found | Talent AI". Document names (Terms of Use, Privacy
  Policy) and plan names (Trial, Pro) keep their capitals.
- "Log in", "Log out" and "Sign up" are the verbs; "login" is only a noun.
- Messages say what happened and what to do next, as full sentences ending
  with a full stop: "That file is over the 10 MB limit.", "We couldn't find
  that job.", "Your session has expired. Log in again." Don't add
  "successfully". Plan-limit messages name the limit and the way out.
- Delete confirmations read "<thing> will be deleted. You can't undo this."
- No em dashes anywhere: UI text, comments, docstrings, SQL or docs. Use a
  comma, a colon, parentheses or a new sentence. Code comments that already
  use `--` as a dash can stay.
- Don't claim what isn't true. The landing page's example says "led a team"
  *can count toward* management, not that it will rank first. The candidate
  page and the AI review panel say anonymization and AI reviews can be wrong.
  The weekly email checkbox says emails aren't being sent yet; remove that
  note (`dashboard/jobs/[id]/page.tsx`) once SMTP and Cloud Scheduler are
  live.
- The sample job descriptions (`apps/web/lib/sampleJds.ts`) are realistic job
  ads used as test input, so they keep a job-ad voice. Changing their wording
  changes which skills `extract_skills` finds.

## Design rules

On 2026-10-19 the owner had the UI reviewed and fixed with the UI/UX Pro Max,
taste-skill (redesign-existing-projects), Frontend Design and Emil Kowalski
skills. It was a fix pass, not a redesign: same Geist type, indigo accent and
zinc neutrals. Keep new UI to these rules.

- **Theme tokens live in `app/globals.css`.** Use the Tailwind names
  (`bg-surface`, `text-muted`, `border-border`, `border-border-strong`,
  `text-danger`, `text-success`), never raw hex. `color-scheme: light dark`
  is set so native controls (checkboxes, selects, number inputs, scrollbars)
  follow dark mode. Dark mode has its own `--danger` and `--success`,
  because the light ones fall under 4.5:1 on dark surfaces. Light `--muted` is
  `#66666e`, not zinc-500, so muted text keeps 4.5:1 on `--surface-hover`
  too. Every page passed a WCAG AA text-contrast audit in light and dark at
  375px and 1280px on 2026-10-19; re-run one if you change a token.
- **Focus**: `globals.css` gives every interactive element one visible
  `:focus-visible` ring (2px accent outline). Don't add `outline-none` to
  inputs or buttons; the shared `Input` / `Textarea` / `Select` don't. The
  dashboard layout has a "Skip to main content" link to `#main`.
- **Forms**: use `Field` (`components/ui.tsx`) for a visible label with
  optional hint text. A placeholder is only an example value, never the
  label. Inputs are 16px on phones (`text-base sm:text-sm`) so iOS doesn't zoom
  the page on focus. Login and signup set `autoComplete` (email,
  current-password, new-password, organization) so password managers work.
- **File upload**: the input is `sr-only`, never `display:none` or `hidden`,
  so keyboard users can reach it; the label around it shows the focus ring and
  accepts drag-and-drop. Dropped files skip the `accept` filter, so
  `pickFiles` checks for PDFs itself. Clear `fileInputRef` after an upload, or
  picking the same file again fires no change event.
- **Header** (`dashboard/layout.tsx`): two rows, brand and account on top,
  tabs and the AI-use meter below. One row overflowed a 375px phone and
  wrapped "Talent AI" and "Log out" even on desktop. Tabs are active by prefix
  (`/dashboard/jobs/<id>` still highlights Jobs) and set `aria-current`.
- **Phones**: nothing may scroll sideways at 375px. Page headers stack
  (`flex-col sm:flex-row`), the candidates table scrolls inside its card and
  drops the date column, and long titles and categories wrap instead of
  pushing controls off screen. Buttons are at least 40px tall (`min-h-10`).
- **Motion**: buttons and button-styled links scale to 0.97 on press over
  150ms with `ease-snappy` (`cubic-bezier(0.23, 1, 0.32, 1)`, registered in
  `@theme`), behind `motion-safe:` so reduced motion skips it. Content that
  appears because the user asked for it (an AI review, upload results, the
  "check your email" card) gets the `.reveal` class: a 200ms fade and 4px rise,
  fade only under reduced motion. Nothing animates on page load or on hover
  beyond color. Name the properties in a transition; never `transition: all`.
- **Screen readers**: a standalone `Spinner` announces "Loading"; pass
  `decorative` when the text beside it already says what's happening.
  `ErrorText` and the insights error are `role="alert"`. Matching skill badges
  add "(matches the job)" as `sr-only` text, so color isn't the only signal.
  Upload results use SVG icons with `sr-only` "Uploaded" / "Not uploaded".
- **Numbers**: scores, dates and usage figures use `tabular-nums`. Match
  scores go through `percent()` on the job page, which floors at 0 (a
  slightly negative cosine score used to read "-1.2% match").
- **"Show top" input** keeps the typed text and clamps (5 to 25) only when
  used. Clamping on every keystroke turned the "2" of "20" into 5.
- **Landing page**: a small example ranking, captioned "An example ranking".
  Its numbers are made up, so keep them plausible.
- **Plain `<a>` links** are this app's convention (no `next/link` anywhere);
  the new logo links follow it. They add more instances of the known
  `no-html-link-for-pages` lint error, which is expected.

To review the dashboard locally without a real login, run a throwaway mock
API on port 8010 (where `.env.local` points `NEXT_PUBLIC_API_URL`) that
returns sample JSON with CORS headers, and set a fake
`sb-ljtjlvyezkyakayetlod-auth-token` cookie (`base64-` plus a base64url
session whose `expires_at` is in the future) from a page on
`localhost:3000`. The dashboard only reads that cookie locally. Delete the
cookie and stop the mock afterwards. Don't use a real account for this.

## Known platform gotchas (not this project's bugs, but worth knowing)

- **Vercel env var type**: `NEXT_PUBLIC_*` vars must be the **Config** type,
  not **Secret**. `next build` can't see Secret vars, so editing one does
  nothing and the old value stays baked into the bundle. Vercel won't convert
  one in place; delete it and create it again.
- **Next.js 16**: `middleware.ts` to `proxy.ts` is more than a rename. The
  old convention runs on the Edge runtime (where the Supabase SSR bundle
  crashes with `__dirname is not defined`), and the new one defaults to
  Node.js.
- **Windows temp paths**: a natively run Python process doesn't resolve
  `/tmp` the way you'd expect from the Bash tool. Use a real Windows temp
  path for scratch files (PDF generation and so on), not `/tmp`.
- **PowerShell bulk replace**: in a `foreach` over a list of
  `@(old, new)` pairs, a list holding a single pair gets flattened, and the
  loop then replaces characters instead of strings. On 2026-10-16 that turned
  every "d" into "e" in two files, which had to be restored from Git. Write
  each pair as `,@(old, new)`, or use the Edit tool.
