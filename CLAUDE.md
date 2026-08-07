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
- **Key traits:** TDX API integration, offline LRU cache, multilingual (EN/ZH-Hant/ZH/ID), responsive layout
- **Run:** `flutter run`

### Data Science / BoardGames Analyzer
- **Type:** Python data science + Streamlit app
- **Purpose:** Explainable hybrid board game recommendation system (undergraduate research project)
- **Key traits:** TF-IDF + MiniLM embeddings + DistilBERT sentiment, three recommendation modes, IEEE paper included
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
  through to PostgREST/Storage. Phase A (signup → upload → rank → RLS-proven
  isolation) is built and live-verified against a real Supabase project, reusing the
  original pipeline's storage-agnostic logic (parsing/anonymize/extract/embed/rank,
  now in `apps/api/talent_ai_core/`) unchanged. AI insights, billing, and dashboard
  feature parity with the original are later phases — see its own `README.md`.
- **Run:** `apps/api`: `uvicorn app.main:app --reload --port 8010` · `apps/web`: `npm run dev`

### Website / JourneySet
- **Type:** React 18 + TypeScript + Supabase SPA
- **Purpose:** Personal productivity planner (weekly tasks, goal tracker, event calendar)
- **Key traits:** Supabase auth + RLS, localStorage offline fallback, dark mode, Tailwind CSS
- **Run:** `npm run dev`

### Website / Prambanan Batik
- **Type:** PHP 7.4 + MySQL, no build step
- **Purpose:** Product catalog and admin panel for Indonesian batik
- **Key traits:** PDO prepared statements, CSRF protection, brute-force login protection, preview mode
- **Run:** Serve via XAMPP/WAMP — `http://localhost/Prambanan_Batik/`

### Website / PX Mart Finder
- **Type:** React + TypeScript + Vite SPA
- **Purpose:** Retail product discovery prototype for PX Mart (全聯) — single-branch demo
- **Key traits:** Fuse.js fuzzy search, Framer Motion, shadcn/ui, Traditional Chinese + English, dark mode
- **Run:** `npm run dev:client` (use WSL2 for `npm ci`)

### Website / Three Frogs
- **Type:** Vanilla HTML/CSS/JS + PHP 8 + MySQL, no build step
- **Purpose:** Boardgame café website (live: threefrogsboardgame.com) — game browsing, accounts, bookings
- **Key traits:** Session-based auth, token-based password reset, booking system with cancellation limits
- **Run:** Serve via XAMPP/Laragon — requires `Assets/PHP/db_config.php` (gitignored)

---

## General Rules Across All Projects

- Always read the project-level `CLAUDE.md` before editing any file.
- Never commit secrets or credentials (`db_config.php`, `.env` files, API keys).
- Match the existing code style of each project — they differ significantly across the stack.
- Do not add cross-project dependencies or shared abstractions; each project is fully self-contained.
