# JourneySet

A free weekly planner built with React, TypeScript and Supabase. You plan your week, count your way towards goals and keep your appointments on a monthly calendar.

**Live site**: [journeyset.vercel.app](https://journeyset.vercel.app/)

## What it does

- Weekly planner: add tasks to any day, with an optional time. Tasks marked "weekly" are copied into next week when you move forward.
- Goal tracker: set a target in any unit and press +1 as you go. A goal can stop at its target or be allowed to go past it.
- Event calendar: a monthly view with colour-coded categories. It warns you when two events share a time.
- Printing: print the week you're looking at, your goals or the month you're looking at, or save them as a PDF. Only the report prints, not the app around it.
- Five themes (Light, Dark, Sky, Gold, Forest). The browser remembers your choice and follows your system's dark mode on the first visit.
- A compact mode that shrinks the sidebar to icons.
- Offline copy: if Supabase can't be reached, the app shows your last-loaded data from the browser (the planner keeps each week separately). Failed saves show an error you can dismiss.
- Signing out removes your offline copy, so the next person on a shared computer can't see it.
- Password reset by email ("Forgot password?" in the sign-in window leads to `/reset-password`).
- Self-serve account deletion in Settings. You confirm by typing your email, and every task, goal and event goes with the account.
- Deleting a task, goal or event asks you to confirm first.
- A 404 page for unknown addresses, both on the public site and inside the app.
- Each page sets its own title and meta description, and shared links show a preview card with the logo (Open Graph and Twitter tags plus a 1200×630 image).
- Pages and the print view load on demand, which keeps the first download small.
- A full-page loader while sign-in resolves, plus a spinner per list, so an empty list never flashes before your data arrives.
- Terms of Use and Privacy Policy at `/terms` and `/privacy`, linked from the landing page footer, the sign-up form and Settings.
- A full favicon set (SVG, ICO, Apple touch icon, web manifest icons) drawn from the in-app logo. `npm run icons` regenerates them and the preview image.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 (Plus Jakarta Sans; CSS-variable accent colours for 5 themes) |
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

All tables have Row Level Security enabled, so users can only read and write their own data.

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
│   └── PrintView.tsx         # Print view (portalled to <body>)
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

Each theme is a light or dark base plus an accent colour. The accent is a set of
CSS variables (`--accent-*` / `--accent2-*`) that `tailwind.config.js` maps onto the
`indigo` / `violet` class names, so every existing `indigo-*` class follows the theme
with no per-component work. `ThemeContext` writes `data-theme` on `<html>` and stores
the theme name in `localStorage`; a tiny script, `public/theme-init.js` (external
because the Content Security Policy forbids inline scripts), applies it before first
paint to avoid a flash. Definitions live in `src/constants/themes.ts`; the
per-theme variable blocks are in `src/index.css`.

## Responsive design

The layout changes at these widths:

| Breakpoint | Target |
|---|---|
| < 475px | Small Android phones, iPhone SE |
| 475px (`xs`) | iPhone 14 / Pixel 8 |
| 640px (`sm`) | Landscape phone, small tablet |
| 768px (`md`) | iPad mini / iPad Air |
| 1024px (`lg`) | iPad Pro / laptop |
| 1280px+ | Desktop |

On phones, pop-up windows slide up from the bottom of the screen as sheets. All interactive elements meet the 44 × 44 pt minimum touch target. `viewport-fit=cover` and `env(safe-area-inset-*)` utilities handle notch / Dynamic Island / home indicator on iOS and modern Android devices.

## Database schema overview

```
profiles          user display name, linked to auth.users
planner_tasks     day_key (weekday name: Monday–Sunday), week_key (YYYY-Www), recurring
goals             target_value, current_value, unit, allow_exceed_target
events            date_iso (YYYY-MM-DD), time (HH:MM), category, title
```

Every table enforces `auth.uid() = user_id` through RLS policies, and a shared trigger keeps `updated_at` current.

## Deployment

Hosted on Vercel; every push to `main` auto-deploys to production. `vercel.json` rewrites every route to `index.html`, so deep links and page refreshes (`/app/planner`, `/terms`, ...) load the app instead of Vercel's 404. It also sets the security headers (CSP, HSTS, etc.). The CSP is mirrored in a `<meta>` tag in `index.html`, so change both together.

## Roadmap / possible next steps

Nothing here is broken. These are known gaps, written down so they don't get lost:

- Email provider: emails have gone out through custom SMTP (Gmail) since 2026-10-06. That's fine at this scale. Switch to a dedicated provider (e.g. Resend) if sign-ups grow past Gmail's daily sending limit.
- Supabase hardening: leaked-password protection is off (it needs a paid plan). If the tables grow, rewrite the RLS policies to use `(select auth.uid())`, which is faster at scale.
- Legal review: the Terms of Use and Privacy Policy (`/terms`, `/privacy`) were drafted, not written by a lawyer. Have someone check them before the app has paying users, and add GDPR or CCPA wording if those laws start to apply.
- Tooling upgrades: `npm audit` flags the build tools (Vite 5, Tailwind 3). The app that ships to users has no known vulnerabilities. Clearing the warnings means upgrading to Vite 8 and Tailwind 4.

## License

MIT
