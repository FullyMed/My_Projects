# CLAUDE.md — My Projects Root

This file provides orientation for Claude Code when working anywhere inside this monorepo-style project directory.

---

## Quick Navigation

```
My Projects/
├── App/
│   └── Taiwan_Fare_Finder/     Flutter app — Taiwan transit fare search
├── Data_Science/
│   ├── BoardGames_Analyzer/    Python/Streamlit — board game recommender
│   └── Talent_AI/              FastAPI/Next.js/Supabase — multi-tenant AI resume-ranking SaaS
└── Website/
    ├── JourneySet/             React/TypeScript/Supabase — productivity planner
    ├── Prambanan_Batik/        PHP/MySQL — Indonesian batik product catalog
    ├── PX_Mart_Finder/         React/TypeScript — retail product finder prototype
    └── Three Frogs/            Vanilla HTML/PHP — boardgame café website
```

Each project has its own `CLAUDE.md` with project-specific commands, architecture details, and coding rules. Always read the project-level `CLAUDE.md` before making changes.

---

## Entering a Project (WSL)

```bash
cd /mnt/c/CSIE/My\ Projects/"Folder Name"/"Project Name"
```

Then run `claude` to start Claude Code in that project.

- `/init` — use on first entry if the project has no `CLAUDE.md` yet
- `/model` — switch model (Sonnet = default, Opus = more advanced)

---

## Project Summaries

### App / Taiwan Fare Finder
- **Type:** Flutter (Dart), cross-platform mobile/desktop app
- **Purpose:** Search and compare public transit fares across Taiwan (HSR, TRA, MRT, Bus, YouBike)
- **Key traits:** live HSR/TRA fares via TDX (through a Cloudflare Worker proxy in `proxy/`), offline LRU cache, English / Traditional Chinese / Indonesian (no Simplified), responsive layout. A 2026-10-01 fix pass (separate Search/Compare state, "not served" modes, real concession fares, re-run fixes, layout fixes, ~30 tests) passed analyze, tests and a live web run, and was committed + pushed by the owner (`7b9e6f6`); not yet run on a phone. A 2026-10-15 writing pass ran all app strings (en / zh / id), the store listings and the docs through the Humanizer and Stop Slop skills in a plain, friendly voice that's honest about which fares are estimates (rules under "Writing style" in its `CLAUDE.md`); it's committed (`8b7f424`). A 2026-10-22 design pass (UI/UX Pro Max, taste-skill redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes, not a redesign) found that every font weight rendered as Regular (Flutter ignores `FontWeight` on a variable font) and now ships five static weights. It also fixed a 2.2:1 "Live" badge, cards that blended into the page, ripples hidden under cards, a cut-off route name, layouts that broke at 200% text, sub-48 dp touch targets and missing screen-reader states. It added keyboard focus rings and reduced-motion support (rules under "Design rules" in its `CLAUDE.md`). Every text pair passes WCAG AA in light and dark; analyze and 32 tests pass. All three passes are committed (latest `a385eb7`). On 2026-10-24 it ran on the Android emulator for the first time (release build, Pixel 6). That run found that release builds had no `INTERNET` permission, so live fares failed in every Play Store build; that's fixed now. It also fixed TalkBack on the location fields, the place picker sitting above the nav bar, prices cut off at 200% text, and some Indonesian wording. Analyze and 32 tests pass; these fixes are not committed yet. Also on 2026-10-24 the proxy got rate limits (60 requests a minute per IP, 120 TDX calls a minute in total, Wrangler 3 → 4, 6 Worker tests via `npm test` in `proxy/`). They're not deployed or committed yet; the owner deploys with `npx wrangler deploy` and checks `/health` for `"rateLimit": true`. Also on 2026-10-24 a cleanup removed dead code (`TffFareTable`, the unreachable `api_not_ready` error, seven unused strings) and the stale `architecture.md` / `design_system.md` / `ui_components_notes.md` (not committed yet). Still open: deploying those limits, a real phone, release signing and the store submission items; see "Open items" in its `CLAUDE.md`.
- **Run:** `flutter run --dart-define-from-file=tdx.env.json` · `flutter test`

### Data Science / BoardGames Analyzer
- **Type:** Python data science + Streamlit app
- **Purpose:** Explainable hybrid board game recommendation system (undergraduate research project)
- **Key traits:** TF-IDF + MiniLM embeddings + DistilBERT sentiment, three recommendation modes, IEEE paper included. A 2026-10-01 fix pass rebuilt sentiment and embeddings for the whole catalog (both had covered only 20 games) and re-ran the evaluation, where a popularity baseline wins and the paper says so. A 2026-10-15 writing pass ran the app text, legal pages, README, CLAUDE.md and the paper through the Humanizer and Stop Slop skills (plain, friendly app voice; formal paper; rules under "Writing style" in its `CLAUDE.md`). The writing pass is committed. A 2026-10-20 design pass (UI/UX Pro Max, taste-skill redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes, not a redesign) added visible keyboard focus and a skip link, replaced Streamlit's red accent with the app's indigo, fixed Light-theme and spinner contrast, made the Home cards real links, swapped emoji icons for SVG/Material icons, and rebuilt the Analytics charts in Altair so they're readable on phones (rules under "Design rules" in its `CLAUDE.md`). Every page passes a WCAG AA audit in both themes with the OS in both modes. All passes are committed and pushed. On 2026-10-24 `App/requirements.txt` was pinned to the tested venv versions (pushed in `4596885`); the Cloud app must run Python 3.11 or 3.12, since numpy 1.26.4 has no 3.13 wheels. Live at https://boardgamediscovery.streamlit.app/; checked on 2026-10-26: it starts on the pinned packages, Title and Trait modes return sensible results, and Analytics draws its Altair charts. The live check also found Streamlit's red accent back, because Community Cloud reads `.streamlit/config.toml` only at the **repo root**. So on 2026-10-26 the repo got a root `.streamlit/config.toml`, a copy of the project's own (pushed in `6dd3f3e`; the live accent was confirmed indigo in light and dark the same day). It belongs to this app only (no other Streamlit app is in the repo), and **both copies must stay identical**. Open items for the next chat (a real-phone test; six optional upgrades waiting for his yes) are under "Open items / notes for next session" in its `CLAUDE.md`.
- **Run:** `streamlit run App/app.py`

### Data Science / Talent_AI
- **Type:** FastAPI backend + Next.js frontend + Supabase (Postgres/pgvector/Auth/Storage)
- **Purpose:** Multi-tenant AI Talent Intelligence Platform — parses resumes, extracts
  structured candidate data, and semantically ranks candidates against a job
  description, sellable to multiple companies with real tenant data isolation.
  Originally built as a single-user Streamlit capstone (4 phases, Precision@K
  evaluation vs. a TF-IDF baseline, OpenAI insights, Docker automation — see git
  history for that version); rebuilt from scratch on this stack once the goal became
  a real product rather than a portfolio demo. The old capstone's public Streamlit
  demo has been taken down.
- **Key traits:** Postgres Row-Level Security (not app code) is the actual tenant
  isolation mechanism — every request carries the signed-in user's own Supabase JWT
  through to PostgREST/Storage. **Live in production** (Vercel + Cloud Run +
  Supabase). Phases A–D done (multi-tenant core, full API, pgvector-native
  ranking, AI insights, usage metering, Stripe billing) plus most of Phase E
  (dashboard parity + bulk upload + an opt-in weekly email digest). Reuses
  the original single-user capstone's storage-agnostic pipeline logic
  (parsing/anonymize/extract/embed/rank, `apps/api/talent_ai_core/`)
  largely unchanged. Has its own `CLAUDE.md` — read it before editing
  anything here, it covers a real deploy gotcha (prod-only env vars) among
  others. Roadmap detail in its own `README.md`. A 2026-10-16 writing pass
  ran all user-facing text, the API's error messages, the weekly email, the
  legal pages and both docs through the Humanizer and Stop Slop skills
  (plain, friendly voice for recruiters; pages now show the server's error
  sentence instead of raw JSON; rules under "Writing style" in its
  `CLAUDE.md`). Tests, tsc and a local browser check pass. It's committed
  (`ac936b9`), but as of 2026-10-19 the live API still returned the old
  messages, so the backend part still needs a Cloud Run redeploy.
  A 2026-10-19 design pass (UI/UX Pro Max, taste-skill
  redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes,
  not a redesign) fixed a header that made every dashboard page scroll
  sideways on phones, a keyboard-unreachable resume upload (now also
  drag-and-drop), light native controls and failing red text in dark mode,
  hidden focus rings, placeholder-only labels, an un-typeable "Show top" box
  and "-1.2%" scores; added a skip link, screen-reader announcements, press
  and reveal motion with reduced-motion support, and an example ranking on
  the landing page (rules under "Design rules" in its `CLAUDE.md`). Every page
  passes a WCAG AA contrast audit in light and dark; tsc and `next build`
  pass. It's committed (`abe9b4c`), pushed and live on Vercel (checked
  2026-10-24). A 2026-10-24 fix pass (not committed yet) moved every API
  route off the event loop (plain `def`, so one upload no longer stalls the
  server), made the AI usage total count past Supabase's 1000-row response
  cap, tracked `apps/web/.env.local.example` and stopped a failed button from
  blanking the candidate page; 86 tests pass and the page was checked in the
  browser. Still open: commit, then the Cloud Run redeploy, which ships both
  the writing pass and these fixes (the live API still said "Missing bearer
  token" on 2026-10-24), rotating the
  OpenAI key, switching on the weekly email (SMTP + Cloud Scheduler), the
  Supabase free-tier pause, and legal/Stripe go-live before paying customers.
  The full list for the next chat is under "Next steps" at the top of its
  `CLAUDE.md`.
- **Run:** `apps/api`: `uvicorn app.main:app --reload --port 8010` · `apps/web`: `npm run dev`

### Website / JourneySet
- **Type:** React 18 + TypeScript + Supabase SPA
- **Purpose:** Personal productivity planner (weekly tasks, goal tracker, event calendar)
- **Key traits:** Supabase auth + RLS, localStorage offline fallback, 5 themes, Tailwind CSS. Live at https://journeyset.vercel.app/. Vercel auto-deploys on push to `main` (verified 2026-09-30). The Supabase project is free tier and **pauses after ~1 week idle**, which breaks sign-in; if login fails everywhere, restore it first. A 2026-09-30 fix pass is committed, pushed and deployed. A 2026-10-06 improvement pass (password reset, self-serve account deletion, delete confirmations, OG preview image, code-splitting) is committed and deployed, with its DB migration applied. Both passes were browser-verified end to end on 2026-10-06 (owner signs in; Claude drives Chrome via the Claude in Chrome extension). Custom SMTP and Auth URLs are set. A 2026-10-16 writing pass ran all user-facing text, the legal pages, the preview card and both docs through the Humanizer and Stop Slop skills (plain, friendly voice; no false claims; rules under "Writing style" in its `CLAUDE.md`). The writing pass is committed. A 2026-10-19 design pass (UI/UX Pro Max, taste redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes, not a redesign) fixed a mis-imported credit-card Edit icon, a cut-off Repeat dropdown, unreadable calendar event labels, nested buttons, small touch targets, 2.6:1 grey text, iOS input zoom and a stray header button; merged the two export buttons into one Export menu; and added keyboard focus, skip links, short press/dialog motion with reduced-motion support (rules under "Design rules" in its `CLAUDE.md`). Every app screen passes a WCAG AA contrast audit in Light and Dark; build and lint pass. Everything is committed (`abe9b4c`), pushed and deployed: on 2026-10-23 the live site served the same bundle as the final local build. On 2026-10-24 a daily keep-alive ping was added so the Supabase project stops pausing: `.github/workflows/journeyset-keepalive.yml` (the monorepo's first GitHub Actions workflow, at the repo root) runs one read query with the anon key every day. On 2026-10-26 the project was found paused before the ping could run (no secrets yet) and was restored; the owner then added the two repository secrets (`JOURNEYSET_SUPABASE_URL`, `JOURNEYSET_SUPABASE_ANON_KEY`), both runs went green, and everything is committed and pushed (`526dba2`). The keep-alive is live (see "Environment" in its `CLAUDE.md`). See "Known gaps" in its `CLAUDE.md`.
- **Run:** `npm run dev` (`npm run build` type-checks first) · `npm run icons` regenerates favicons + OG image

### Website / Prambanan Batik
- **Type:** PHP 7.4 + MySQL, no build step
- **Purpose:** Product catalog and admin panel for Indonesian batik
- **Key traits:** PDO prepared statements, CSRF protection, brute-force login protection, preview mode, Open Graph tags. The 2026-09-30 fix pass is committed. A 2026-10-15 writing pass ran all visitor-facing text, the admin messages, the legal pages, the sample products and both docs through the Humanizer and Stop Slop skills in a plain, friendly shop voice (rules under "Writing style" in its `CLAUDE.md`). It's committed. A 2026-10-20 design pass (UI/UX Pro Max, taste-skill redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes, not a redesign) gave the admin panel a working phone menu (it had none) and styles for the reviews, images and import pages, which had about 40 unstyled classes. It also added an "Add review" button, espresso-on-gold buttons (white on gold was 2.8:1), one `<h1>` per page, a skip link and focus rings, 44px touch targets, hover only with a mouse, and short motion with reduced-motion support (rules under "Design rules" in its `CLAUDE.md`). Every page passes a WCAG AA contrast audit, and the 74-check run still passes. All three passes are committed (latest `bfbef64`); nothing is deployed yet. On 2026-10-24 a small fix pass stopped "Product deleted." showing for a product that was already gone and added length checks to the admin forms and the CSV import, so a strict production MySQL can't reject a save with a vague error (74 checks + 28 new checks pass; not committed yet). See "Still to do" in its `CLAUDE.md`.
- **Run:** `http://localhost/Prambanan_Batik/` via XAMPP Apache. `htdocs\Prambanan_Batik` is a junction to the project folder. The DB is XAMPP MariaDB on **port 3307** (`prambanan_batik`); credentials are in the project's gitignored `.env`, which `config.php` loads.

### Website / PX Mart Finder
- **Type:** React + TypeScript + Vite SPA
- **Purpose:** Retail product discovery prototype for PX Mart (全聯) — single-branch demo
- **Key traits:** Fuse.js fuzzy search, Framer Motion, shadcn/ui, Traditional Chinese + English, dark mode, route-level code-splitting, build-generated sitemap. Live at https://px-mart-finder.netlify.app/. The 2026-09-30 fix pass is committed (`9a0f4a3`) and **deployed and verified live on 2026-10-23**: security headers active, sitemap served, every page checked in the browser with zero console or CSP errors. The Netlify site is linked to the repo with base directory `Website/PX_Mart_Finder`, and on 2026-10-24 Netlify confirmed that **a push to `main` deploys on its own**: the production deploy was built from commit `dd29280`, wasn't manual, and started 43 seconds after the commit (see "Deployment" in its `CLAUDE.md`). A 2026-10-23 writing pass ran all app text (English and Chinese), the legal pages, the share text and both docs through the Humanizer and Stop Slop skills. The result is a plain, friendly voice that's honest about what's demo data, with "1 result" plurals fixed and no em dashes (rules under "Writing style" in its `CLAUDE.md`). tsc, the build and a browser check pass. A 2026-10-23 design pass (UI/UX Pro Max, taste-skill redesign-existing-projects, Frontend Design and Emil Kowalski skills; fixes, not a redesign) fixed buttons with no hover state (they used undefined Replit classes), 9 text colors below WCAG AA, double `<h1>`s and duplicate Back buttons, a 1px focus ring, 16 to 32px tap targets, 10px text, a cropped product photo and ALL-CAPS labels. It added a skip link, a deep-blue dark-mode header, a neutral "no aisle info" panel and reduced-motion support (rules under "Design rules" in its `CLAUDE.md`). Every page passes a WCAG AA contrast audit in light and dark; tsc and the build pass. Both passes are committed (`63dc39c`, `9341e68`) and deployed; the live bundle matched the local build on 2026-10-23. Open items for the next chat (real-phone test, optional content) are under "Next steps" in its `CLAUDE.md`. On 2026-10-29, at the owner's request, 1,325 real products (Chinese + English names, photos as WebP) were added in two passes from the Wufeng branch's public foodpanda listing, about 10 per subcategory; they have no aisle data. They're committed (`d7a00e9`) and live. On 2026-10-30 a third pass added 745 more (about 15 per subcategory, 2,126 in total; committed as `ca5b2b1`). The same day a fourth pass added 625 more (about 20 per subcategory, 2,751 products in total) and two code changes: the product data is now its own preloaded chunk (main chunk about 477 KB instead of 1,483 KB), and search shows 40 results at a time with a "Show more" button, so big categories load in about 2s instead of 5s on a slowed phone. It also fixed one older product's brand (紅茶花伝 is Coca-Cola's Kochakaden, not Kirin). That pass is committed (`c334153`). Later the same day a fifth pass added 512 more (about 25 per subcategory, 3,263 in total), with no code changes; tsc, the build and a browser check of every new product page passed, and it's committed (`f6a20db`). The product data then reached 1,549 KB, just under the 1,600 KB chunk limit, so later that day it became a fetched, minified, preloaded JSON file instead of a JS chunk (`data.ts`, `vite.config.ts`; the chunk limit is back at Vite's default 500 KB). Speed didn't change, and the catalog can now grow without a limit. tsc, the build and a browser check pass; that change isn't committed yet (see "Product data is a fetched JSON file" in its `CLAUDE.md`). Read query params with wouter's `useSearch()`, never `window.location.search`.
- **Run:** `npm run dev:client` (use WSL2 for `npm ci`)

### Website / Three Frogs
- **Type:** Vanilla HTML/CSS/JS (no libraries) + PHP 8 + MySQL, no build step
- **Purpose:** Boardgame café website (live: threefrogsboardgame.com) — game browsing, accounts, bookings
- **Key traits:** Session-based auth with CSRF and rate limiting, email verification (required before booking), and token-based password reset. Booking system: 4 tables, max 8 people, up to 30 days ahead, max 3 upcoming per account, emailed confirmations, 2 self-cancellations/month. A staff page (`users.is_staff`) shows all bookings and lets staff cancel with a customer email. On-page toasts instead of `alert()`. All visitor-facing text, the 218 game descriptions and both docs were rewritten with the Humanizer and Stop Slop skills in a friendly café voice (see "Writing style" in its `CLAUDE.md`). The café is open every day, 12:00–22:00. A 2026-10-19 design pass (UI/UX Pro Max, taste-skill, Frontend Design and Emil Kowalski skills; no redesign) fixed layout bugs (narrow panels, floating footer, hidden Collection headings), raised contrast to WCAG AA, added keyboard focus, skip link and accessible dialogs, swapped emoji icons for SVG plus the café's real frog logo, and calmed the motion (rules under "Design rules" in its `CLAUDE.md`). On 2026-10-22 every page's CSS/JS links got a shared `?v=YYYY-MM-DD` tag so returning visitors fetch fresh files after a deploy; bump it on every CSS/JS change (see "Behaviour to preserve" in its `CLAUDE.md`). On 2026-10-24 a password reset started logging the account out on every device: `forgot_password.php` bumps `users.session_version`, and `check_session.php` plus every endpoint that needs a login compare it through `session_user_is_current()` (see "Session versions" in its `CLAUDE.md`). The 2026-09-29 fix pass, the 2026-10-15 improvement pass, the writing pass, the design pass, the version tags and the session_version fix are tested locally (253 checks + browser) but **not yet deployed**. Everything up to 2026-10-23 is committed by the owner; the session_version fix isn't committed yet. Production needs two one-time migrations first; follow the ordered Pending checklist at the top of its `CLAUDE.md`. Open items for the next chat (commit, deploy, real-phone test) are under "Next steps" in its `CLAUDE.md`.
- **Run:** `bash tests/dev-server.sh` (site on :8080, emails caught locally) · `bash tests/run-tests.sh` (full test run on a throwaway DB). Both need XAMPP MariaDB on **port 3307** started. Requires `Assets/PHP/db_config.php` (gitignored). If a dev DB user gets "Access denied" after a MariaDB restart, check `CHECK TABLE mysql.db;` (it was corrupt and was repaired 2026-10-15).

---

## General Rules Across All Projects

- Always read the project-level `CLAUDE.md` before editing any file.
- **The owner commits and pushes himself.** Never run `git commit`/`git push`, and don't offer to; leave changes in the working tree and list the changed files. Only do it if he explicitly asks in that moment.
- Update the project's `CLAUDE.md` and `README.md` in the same turn as any code change.
- Never commit secrets or credentials (`db_config.php`, `.env` files, API keys).
- Match the existing code style of each project — they differ significantly across the stack.
- Do not add cross-project dependencies or shared abstractions; each project is fully self-contained.
