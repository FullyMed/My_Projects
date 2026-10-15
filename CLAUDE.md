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
- **Key traits:** live HSR/TRA fares via TDX (through a Cloudflare Worker proxy in `proxy/`), offline LRU cache, English / Traditional Chinese / Indonesian (no Simplified), responsive layout. A 2026-10-01 fix pass (separate Search/Compare state, "not served" modes, real concession fares, re-run fixes, layout fixes, ~30 tests) passed analyze, tests and a live web run, and was committed + pushed by the owner (`7b9e6f6`); not yet run on a phone. A 2026-10-15 writing pass ran all app strings (en / zh / id), the store listings and the docs through the Humanizer and Stop Slop skills in a plain, friendly voice that's honest about which fares are estimates (rules under "Writing style" in its `CLAUDE.md`). Analyze and tests pass; uncommitted, for the owner to review. See "Open items" in its `CLAUDE.md`.
- **Run:** `flutter run --dart-define-from-file=tdx.env.json` · `flutter test`

### Data Science / BoardGames Analyzer
- **Type:** Python data science + Streamlit app
- **Purpose:** Explainable hybrid board game recommendation system (undergraduate research project)
- **Key traits:** TF-IDF + MiniLM embeddings + DistilBERT sentiment, three recommendation modes, IEEE paper included. A 2026-10-01 fix pass rebuilt sentiment and embeddings for the whole catalog (both had covered only 20 games) and re-ran the evaluation, where a popularity baseline wins and the paper says so. A 2026-10-15 writing pass ran the app text, legal pages, README, CLAUDE.md and the paper through the Humanizer and Stop Slop skills (plain, friendly app voice; formal paper; rules under "Writing style" in its `CLAUDE.md`). The writing pass is uncommitted, for the owner to review.
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
  others. Roadmap detail in its own `README.md`.
- **Run:** `apps/api`: `uvicorn app.main:app --reload --port 8010` · `apps/web`: `npm run dev`

### Website / JourneySet
- **Type:** React 18 + TypeScript + Supabase SPA
- **Purpose:** Personal productivity planner (weekly tasks, goal tracker, event calendar)
- **Key traits:** Supabase auth + RLS, localStorage offline fallback, 5 themes, Tailwind CSS. Live at https://journeyset.vercel.app/. Vercel auto-deploys on push to `main` (verified 2026-09-30). The Supabase project is free tier and **pauses after ~1 week idle**, which breaks sign-in; if login fails everywhere, restore it first. A 2026-09-30 fix pass is committed, pushed and deployed. A 2026-10-06 improvement pass (password reset, self-serve account deletion, delete confirmations, OG preview image, code-splitting) is uncommitted, for the owner to review. Its DB migration is already applied to the live project, and both passes were browser-verified end to end on 2026-10-06 (owner signs in; Claude drives Chrome via the Claude in Chrome extension). Custom SMTP and Auth URLs are set. See "Known gaps" in its `CLAUDE.md`.
- **Run:** `npm run dev` (`npm run build` type-checks first) · `npm run icons` regenerates favicons + OG image

### Website / Prambanan Batik
- **Type:** PHP 7.4 + MySQL, no build step
- **Purpose:** Product catalog and admin panel for Indonesian batik
- **Key traits:** PDO prepared statements, CSRF protection, brute-force login protection, preview mode, Open Graph tags. The 2026-09-30 fix pass is committed. A 2026-10-15 writing pass ran all visitor-facing text, the admin messages, the legal pages, the sample products and both docs through the Humanizer and Stop Slop skills in a plain, friendly shop voice (rules under "Writing style" in its `CLAUDE.md`). It passed a 74-check run and browser checks, and it's uncommitted, for the owner to review. See "Still to do" in its `CLAUDE.md`.
- **Run:** `http://localhost/Prambanan_Batik/` via XAMPP Apache. `htdocs\Prambanan_Batik` is a junction to the project folder. The DB is XAMPP MariaDB on **port 3307** (`prambanan_batik`); credentials are in the project's gitignored `.env`, which `config.php` loads.

### Website / PX Mart Finder
- **Type:** React + TypeScript + Vite SPA
- **Purpose:** Retail product discovery prototype for PX Mart (全聯) — single-branch demo
- **Key traits:** Fuse.js fuzzy search, Framer Motion, shadcn/ui, Traditional Chinese + English, dark mode, route-level code-splitting, build-generated sitemap. Live at https://px-mart-finder.netlify.app/, but **pushing does not deploy**. The 2026-09-30 fix pass is committed and pushed (`9a0f4a3`), yet as of 2026-10-15 the live site still serves a pre-09-21 build without `netlify.toml`'s headers; see "Deployment" in its `CLAUDE.md`. Read query params with wouter's `useSearch()`, never `window.location.search`.
- **Run:** `npm run dev:client` (use WSL2 for `npm ci`)

### Website / Three Frogs
- **Type:** Vanilla HTML/CSS/JS (no libraries) + PHP 8 + MySQL, no build step
- **Purpose:** Boardgame café website (live: threefrogsboardgame.com) — game browsing, accounts, bookings
- **Key traits:** Session-based auth with CSRF and rate limiting, email verification (required before booking), and token-based password reset. Booking system: 4 tables, max 8 people, up to 30 days ahead, max 3 upcoming per account, emailed confirmations, 2 self-cancellations/month. A staff page (`users.is_staff`) shows all bookings and lets staff cancel with a customer email. On-page toasts instead of `alert()`. All visitor-facing text, the 218 game descriptions and both docs were rewritten with the Humanizer and Stop Slop skills in a friendly café voice (see "Writing style" in its `CLAUDE.md`). The café is open every day, 12:00–22:00. The 2026-09-29 fix pass, the 2026-10-15 improvement pass and the writing pass are tested locally (171 checks + browser) but **not yet deployed**. Production needs a one-time migration first; follow the ordered Pending checklist at the top of its `CLAUDE.md`.
- **Run:** `bash tests/dev-server.sh` (site on :8080, emails caught locally) · `bash tests/run-tests.sh` (full test run on a throwaway DB). Both need XAMPP MariaDB on **port 3307** started. Requires `Assets/PHP/db_config.php` (gitignored). If a dev DB user gets "Access denied" after a MariaDB restart, check `CHECK TABLE mysql.db;` (it was corrupt and was repaired 2026-10-15).

---

## General Rules Across All Projects

- Always read the project-level `CLAUDE.md` before editing any file.
- **The owner commits and pushes himself.** Never run `git commit`/`git push`, and don't offer to; leave changes in the working tree and list the changed files. Only do it if he explicitly asks in that moment.
- Update the project's `CLAUDE.md` and `README.md` in the same turn as any code change.
- Never commit secrets or credentials (`db_config.php`, `.env` files, API keys).
- Match the existing code style of each project — they differ significantly across the stack.
- Do not add cross-project dependencies or shared abstractions; each project is fully self-contained.
