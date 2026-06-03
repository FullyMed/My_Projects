# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

There is no test suite — verify changes by running the dev server.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS (dark mode via `dark:` class), Supabase for auth and database, react-router-dom v7, lucide-react for icons. Do not add other UI or icon packages.

**Routing**:
- `/` → public LandingPage (unauthenticated) or redirect to `/app/planner` (authenticated)
- `/app/*` → protected by `ProtectedRoute`, wrapped in `AppLayout` with persistent sidebar
- Four app pages: `/app/planner`, `/app/goals`, `/app/calendar`, `/app/settings`

**State / Contexts** (`src/contexts/`):
- `AuthContext` — Supabase session, `user: User | null`, login/register/logout
- `ThemeContext` — dark/light mode toggled on `<html>`, persisted to `localStorage`
- `CompactModeContext` — compact sidebar/padding variant

**Data layer** (`src/api/`):
- `plannerApi.ts`, `goalsApi.ts`, `eventsApi.ts` — CRUD against Supabase, fall back to localStorage cache on failure
- `src/utils/storage.ts` — typed localStorage wrapper using `journeyset:v1:*` keys; user-scoped cache keys are `journeyset:v1:{feature}:{userId}`

**DB ↔ TS naming**: Supabase columns use `snake_case` (`day_key`, `week_key`, `user_id`, `created_at`); the API layer maps them to `camelCase` before returning TypeScript types.

**Database schema** (`supabase/migrations/`):
- `profiles` — user metadata (`user_id` FK → `auth.users`)
- `planner_tasks` — `day_key` (YYYY-MM-DD), `week_key` (YYYY-Www), `recurring: 'none'|'weekly'`
- `goals` — progress tracking with `currentValue`/`targetValue`/`allowExceedTarget`
- `events` — `category: 'work'|'personal'|'health'|'social'|'other'`, `dateISO`

All tables have Row Level Security enabled; every policy enforces `auth.uid() = user_id`.

**Types**: all shared types live in `src/types/index.ts`. Category config for events lives in `src/constants/categories.ts`.
