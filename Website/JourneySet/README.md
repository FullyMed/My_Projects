# JourneySet

A personal productivity planner built with React, TypeScript, and Supabase. Plan your week, track goals, and manage events — all in one elegant workspace.

**Live demo**: [journeyset.vercel.app](https://journeyset.vercel.app/)

## Features

- **Weekly Planner** — schedule tasks by day with optional time slots; weekly-recurring tasks carry forward automatically
- **Goal Tracker** — set numeric targets with any unit, track progress with gradient bars, lock or allow exceeding the target
- **Event Calendar** — full monthly calendar with category colour-coding and time-conflict detection
- **Export & Print** — generate print-ready views of the planner (the week you're viewing), goals, or calendar (the month you're viewing); only the report prints, not the app around it
- **Five themes** — Light, Dark, Sky, Gold, Forest (each a light/dark base + accent); persisted per-device, respects `prefers-color-scheme` on first visit
- **Compact sidebar** — toggle to an icon-only sidebar for more screen real estate
- **Offline-resilient** — all reads fall back to a per-user localStorage cache when Supabase is unreachable (the planner cache is per week); failed saves show a dismissible error instead of silently doing nothing
- **Private on shared devices** — signing out clears that user's cached data from the browser
- **Password reset** — "Forgot password?" in the sign-in window emails a link to `/reset-password`, where you choose a new password
- **Delete your account** — Settings → Delete account permanently removes the account and all its data (you confirm by typing your email)
- **Safe deletes** — deleting a task, goal or event asks for confirmation first
- **Custom 404 page** — themed not-found page for unmatched routes, both public and inside the app
- **Per-page meta** — each route sets its own `<title>` and meta description for SEO
- **Link previews** — Open Graph / Twitter tags and a 1200×630 preview image, so shared links show a card with the logo
- **Fast first load** — pages and the print view are code-split and load on demand
- **Loading states** — a themed full-page loader while auth resolves, plus per-feature spinners so the Planner, Goals, and Calendar lists never flash an empty state while their data is still loading
- **Terms of Use & Privacy Policy** — dedicated pages at `/terms` and `/privacy`, linked from the landing footer, the sign-up form, and Settings
- **Full favicon set** — SVG favicon, ICO fallback, Apple touch icon, and a web manifest with Android/PWA icons, all redrawn from the in-app logo mark (`npm run icons` regenerates them and the preview image)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 (Plus Jakarta Sans; CSS-variable accent — 5 themes) |
| Backend | Supabase (PostgreSQL + Auth + Row Level Security) |
| Routing | react-router-dom v7 |
| Icons | lucide-react |
| Dates | date-fns |

## Getting started

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 2. Clone and install

```bash
git clone https://github.com/FullyMed/My_Projects.git
cd My_Projects/Website/JourneySet
npm install
```

### 3. Configure environment

Create `.env` at the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Apply database migrations

Run the SQL files in order against your Supabase project (via the Supabase Dashboard → SQL editor, or the Supabase CLI):

```
supabase/migrations/
  20260404061233_create_profiles_table.sql
  20260405053918_create_planner_tasks_table.sql
  20260405053928_create_goals_table.sql
  20260405053937_create_events_table.sql
  20260930063000_add_updated_at_triggers.sql   # keeps updated_at current on every UPDATE
  20261006090000_add_delete_my_account.sql     # lets a user delete their own account (Settings → Delete account)
```

> **Free-tier note**: Supabase pauses free projects after about a week without activity. While paused, nobody can sign in. Restore it from the Supabase dashboard.

All tables have Row Level Security enabled — users can only read and write their own data.

### 5. Run locally

```bash
npm run dev        # http://localhost:5173
npm run typecheck  # TypeScript check (tsc --noEmit)
npm run build      # typecheck + production build (fails on type errors)
npm run preview    # preview production build
npm run lint       # ESLint
npm run icons      # regenerate favicons + og-image.png from SVG
```

> **WSL users**: if Vite errors with `Cannot find module @rollup/rollup-linux-x64-gnu`, run `npm install @rollup/rollup-linux-x64-gnu --no-save` once.

## Project structure

```
src/
├── api/              # Supabase CRUD + localStorage cache fallback
│   ├── plannerApi.ts
│   ├── goalsApi.ts
│   └── eventsApi.ts
├── components/       # Shared UI components
│   ├── AppLayout.tsx         # Sidebar + header shell
│   ├── WeeklyPlanner.tsx     # Planner feature
│   ├── GoalTracker.tsx       # Goals feature
│   ├── EventCalendar.tsx     # Calendar feature
│   ├── AuthModal.tsx         # Login / register (shows "check your email" when confirmation is required)
│   ├── ErrorBanner.tsx       # Dismissible error shown when a save fails
│   ├── ConfirmDialog.tsx     # "Delete …?" confirmation for tasks, goals, events
│   ├── DeleteAccountDialog.tsx # Type-your-email confirmation for account deletion
│   ├── LandingPage.tsx       # Marketing page
│   ├── NotFoundPage.tsx      # Custom 404 (standalone or embedded in AppLayout)
│   ├── LoadingScreen.tsx     # Full-page loading state (auth resolving)
│   ├── LegalPageLayout.tsx   # Shared nav/footer + prose chrome for Terms/Privacy
│   └── PrintView.tsx         # Print-ready layout (portalled to <body>)
├── contexts/         # React contexts (Auth, Theme, CompactMode)
├── pages/            # Route-level wrappers (thin, delegate to components), incl. ResetPasswordPage
├── hooks/            # useModalFocus (trap + Escape handling), usePageMeta (per-route title/description)
├── constants/        # EVENT_CATEGORIES, THEMES (the 5 theme definitions), shared messages
├── data/             # Static quotes array
├── types/            # Shared TypeScript interfaces
└── utils/            # storage.ts (localStorage), supabaseClient.ts
scripts/
└── generate-icons.mjs  # favicons + Open Graph image (sharp + png-to-ico)
supabase/
└── migrations/       # SQL schema files
```

## Themes

Five fixed themes, chosen in **Settings** or from the sidebar swatch row:

| Theme | Base | Accent |
|---|---|---|
| Light | light | indigo / violet |
| Dark | dark | indigo / violet |
| Sky | light | sky / blue |
| Gold | light | yellow-gold |
| Forest | dark | emerald / green |

Each theme is a light-or-dark base **plus** an accent hue. The accent is a set of
CSS variables (`--accent-*` / `--accent2-*`) that `tailwind.config.js` maps onto the
`indigo` / `violet` class names, so every existing `indigo-*` class follows the theme
with no per-component work. `ThemeContext` writes `data-theme` on `<html>` and stores
the theme name in `localStorage`; a tiny script, `public/theme-init.js` (external
because the Content Security Policy forbids inline scripts), applies it before first
paint to avoid a flash. Definitions live in `src/constants/themes.ts`; the
per-theme variable blocks are in `src/index.css`.

## Responsive design

The app is designed to work across all device sizes:

| Breakpoint | Target |
|---|---|
| < 475px | Small Android phones, iPhone SE |
| 475px (`xs`) | iPhone 14 / Pixel 8 |
| 640px (`sm`) | Landscape phone, small tablet |
| 768px (`md`) | iPad mini / iPad Air |
| 1024px (`lg`) | iPad Pro / laptop |
| 1280px+ | Desktop |

On mobile, modals render as **bottom sheets** with a drag handle. All interactive elements meet the 44 × 44 pt minimum touch target. `viewport-fit=cover` and `env(safe-area-inset-*)` utilities handle notch / Dynamic Island / home indicator on iOS and modern Android devices.

## Database schema overview

```
profiles          — user display name, linked to auth.users
planner_tasks     — day_key (weekday name: Monday–Sunday), week_key (YYYY-Www), recurring
goals             — target_value, current_value, unit, allow_exceed_target
events            — date_iso (YYYY-MM-DD), time (HH:MM), category, title
```

Every table enforces `auth.uid() = user_id` through RLS policies, and a shared trigger keeps `updated_at` current.

## Deployment

Hosted on Vercel; every push to `main` auto-deploys to production. `vercel.json` rewrites every route to `index.html`, so deep links and page refreshes (`/app/planner`, `/terms`, ...) load the app instead of Vercel's 404. It also sets the security headers (CSP, HSTS, etc.). The CSP is mirrored in a `<meta>` tag in `index.html`, so change both together.

## Roadmap / possible next steps

Nothing here is broken — these are known gaps, noted so they aren't lost between sessions:

- **Email provider** — emails go out through custom SMTP (Gmail) since 2026-10-06. That's fine at this scale; switch to a dedicated provider (e.g. Resend) if sign-ups grow past Gmail's daily sending limits.
- **Supabase hardening** — leaked-password protection is off (it needs a paid plan). Optionally rewrite RLS policies to `(select auth.uid())` for performance at scale.
- **Legal page review** — Terms of Use and Privacy Policy exist (`/terms`, `/privacy`) but were drafted, not lawyer-reviewed; revisit before any real/paying user base, and consider explicit GDPR/CCPA language if that becomes relevant.
- **Tooling upgrades** — `npm audit` flags dev-only tooling (Vite 5, Tailwind 3); the shipped app has no known vulnerabilities. Fixing them means upgrading to Vite 8 / Tailwind 4.

## License

MIT
