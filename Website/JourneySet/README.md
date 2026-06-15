# JourneySet

A personal productivity planner built with React, TypeScript, and Supabase. Plan your week, track goals, and manage events — all in one elegant workspace.

**Live demo**: [journeyset.vercel.app](https://journeyset.vercel.app/)

## Features

- **Weekly Planner** — schedule tasks by day with optional time slots; weekly-recurring tasks carry forward automatically
- **Goal Tracker** — set numeric targets with any unit, track progress with gradient bars, lock or allow exceeding the target
- **Event Calendar** — full monthly calendar with category colour-coding and time-conflict detection
- **Export & Print** — generate print-ready views of the planner, goals, or calendar
- **Dark / Light mode** — persisted per-device, respects `prefers-color-scheme` on first visit
- **Compact sidebar** — toggle to an icon-only sidebar for more screen real estate
- **Offline-resilient** — all reads fall back to a localStorage cache when Supabase is unreachable

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 (Plus Jakarta Sans, indigo/violet palette) |
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
```

All tables have Row Level Security enabled — users can only read and write their own data.

### 5. Run locally

```bash
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
npm run lint       # ESLint
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
│   ├── AuthModal.tsx         # Login / register
│   ├── LandingPage.tsx       # Marketing page
│   └── PrintView.tsx         # Print-ready layout
├── contexts/         # React contexts (Auth, Theme, CompactMode)
├── pages/            # Route-level wrappers (thin, delegate to components)
├── hooks/            # useModalFocus (trap + Escape handling)
├── constants/        # EVENT_CATEGORIES colour/label config
├── data/             # Static quotes array
├── types/            # Shared TypeScript interfaces
└── utils/            # storage.ts (localStorage), supabaseClient.ts
supabase/
└── migrations/       # SQL schema files
```

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
planner_tasks     — day_key (YYYY-MM-DD), week_key (YYYY-Www), recurring
goals             — target_value, current_value, unit, allow_exceed_target
events            — date_iso (YYYY-MM-DD), time (HH:MM), category, title
```

Every table enforces `auth.uid() = user_id` through RLS policies.

## License

MIT
