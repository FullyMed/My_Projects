# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, http://localhost:5173)
npm run build     # TypeScript check + production build
npm run lint      # ESLint (0 errors expected; 3 context-file warnings are pre-existing and acceptable)
npm run preview   # Serve the production build locally
```

**WSL / Linux note**: `node_modules` is installed on Windows. If Vite fails with `Cannot find module @rollup/rollup-linux-x64-gnu`, run:
```bash
npm install @rollup/rollup-linux-x64-gnu --no-save
```

There is no test suite — verify changes by running the dev server and exercising the affected flow.

## Environment

Requires a `.env` file at the project root:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Stack

| Concern | Library / approach |
|---|---|
| UI framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 — dark mode via `dark:` class on `<html>` |
| Icons | lucide-react only — do **not** add other icon packages |
| Routing | react-router-dom v7 |
| Backend / auth | Supabase (`@supabase/supabase-js`) |
| Date utilities | date-fns |
| Font | Plus Jakarta Sans (loaded from Google Fonts in `index.html`) |

## Routing

```
/           → LandingPage (redirects to /app/planner if authenticated)
/app/*      → ProtectedRoute → AppLayout (persistent sidebar)
  /app/planner   → PlannerPage  → WeeklyPlanner
  /app/goals     → GoalsPage    → GoalTracker
  /app/calendar  → CalendarPage → EventCalendar
  /app/settings  → SettingsPage
  /app/*         → NotFoundPage (fullPage={false}, rendered inside AppLayout)
/terms      → TermsPage (public, works whether authenticated or not)
/privacy    → PrivacyPage (public, works whether authenticated or not)
*               → NotFoundPage (fullPage={true}, standalone with its own nav/footer)
```

## Architecture

### Contexts (`src/contexts/`)

| Context | Exports | Persisted to |
|---|---|---|
| `AuthContext` | `user`, `login`, `register`, `logout`, `isLoading` | Supabase session |
| `ThemeContext` | `theme`, `setTheme`, `toggleTheme`, `isDark`, `themes` | `localStorage` (`journeyset:v1:theme`) |
| `CompactModeContext` | `isCompact`, `toggleCompact` | `localStorage` (`journeyset_compact_mode`) |

### Data layer (`src/api/`)

Each API file (`plannerApi`, `goalsApi`, `eventsApi`) follows the same pattern:
1. Reads from / writes to Supabase (primary source of truth).
2. On successful fetch, writes to a user-scoped localStorage cache.
3. On network failure, falls back to the cache so the UI still renders.

`plannerApi` also exports `recordSync` / `getLastSync` used by `SettingsPage` to display the last-sync timestamp.

### Loading states

- **`LoadingScreen`** (`src/components/LoadingScreen.tsx`): the single full-viewport loading UI (logo + `Loader2` spinner) shown while auth is resolving. Used by both `App.tsx` (top-level `isLoading` from `useAuth`) and `ProtectedRoute`. Don't reintroduce a bespoke spinner in either place — route any new "waiting on auth" case through this component so the loading UI stays visually consistent and on-theme.
- **Per-feature data fetches**: `WeeklyPlanner`, `GoalTracker`, and `EventCalendar` each track their own `[tasks|goals|events]Loading` boolean around their initial Supabase fetch (and, for `WeeklyPlanner`, each week change) and render a centered `Loader2` block (`h-8 w-8 text-indigo-500 animate-spin` + a muted caption) in place of the grid while `true`. This matters because these lists start empty — without a loading flag, the "no data yet" empty state flashes before the real data arrives. `PrintView` already had this pattern (`isLoading` + `Loader2`); the other three follow the same convention. When adding a new data-fetching feature component, follow this pattern rather than leaving the empty state to double as a loading state.
- **`AuthModal`** shows a `Loader2` spin icon next to "Please wait…" on its submit button while `loading` is true, matching the same icon+text convention.

### Legal pages (`src/pages/TermsPage.tsx`, `src/pages/PrivacyPage.tsx`)

Both are thin content components wrapped in `LegalPageLayout` (`src/components/LegalPageLayout.tsx`), which owns the shared nav/footer chrome and the prose styling (descendant-selector classes for `h2`/`p`/`ul`/`a`/`strong`/`code` — write page content as plain semantic HTML inside a `<section>` per clause, don't add per-element classes). `LegalPageLayout` reads `useAuth()` itself to point its back link at `/app/planner` or `/`, same pattern as `NotFoundPage`. Routed at `/terms` and `/privacy` — public, top-level routes outside `/app/*`, so they render for both signed-in and signed-out users. Linked from the `LandingPage` footer, the register form in `AuthModal` (consent line, register mode only), `SettingsPage` (small legal-links row), and cross-linked in `LegalPageLayout`'s own footer. When editing the copy, keep the "Last updated" date in sync with actual content changes.

### Per-page meta (`src/hooks/usePageMeta.ts`)

This is a client-rendered SPA with no SSR, so there's no head-management library (react-helmet, etc.) — `usePageMeta(title, description)` sets `document.title` and the `<meta name="description">` content directly in a `useEffect`, restoring the previous values on unmount. Every route-level component calls it once near the top of the component body: `LandingPage`, `NotFoundPage`, and each page in `src/pages/` (`PlannerPage`, `GoalsPage`, `CalendarPage`, `SettingsPage`). When adding a new route, add a `usePageMeta` call with a distinct title/description rather than leaving the previous page's meta in place.

### Storage (`src/utils/storage.ts`)

Typed `localStorage` wrapper. Fixed keys are in the `StorageKey` union type. User-scoped cache keys are generated by `storage.getUserKey(feature, userId)` — which returns `StorageKey` via a cast — and look like `journeyset:v1:planner:{userId}`.

### DB ↔ TypeScript naming

Supabase columns are `snake_case`; TypeScript types are `camelCase`. The mapping is done entirely inside the API layer (e.g. `day_key` → `dayKey`, `created_at` → `createdAt`). Never pass raw DB column names into components.

### Database schema (`supabase/migrations/`)

All four tables have **Row Level Security** enabled. Every policy enforces `auth.uid() = user_id`.

| Table | Key fields |
|---|---|
| `profiles` | `user_id` (FK → `auth.users`), `email`, `name` |
| `planner_tasks` | `day_key` (day name: `Monday`–`Sunday`), `week_key` (YYYY-Www), `recurring` (`'none'`\|`'weekly'`) |
| `goals` | `target_value`, `current_value`, `unit`, `allow_exceed_target` |
| `events` | `date_iso` (YYYY-MM-DD), `time` (HH:MM, optional), `category` (`work`\|`personal`\|`health`\|`social`\|`other`) |

## Design system

The UI uses an **indigo/violet Enterprise SaaS** palette by default.

| Token | Value |
|---|---|
| Primary | `indigo-600` (#4F46E5) |
| Accent | `violet-600` (#7C3AED) |
| Background | `slate-50` / dark: `slate-950` |
| Surface | `white` / dark: `slate-900` |
| Muted text | `slate-500` |
| Border | `slate-200` / dark: `slate-800` |
| Success | `emerald-500/600` |
| Destructive | `rose-500/600` |
| Card shadow | `shadow-card` (`0 2px 12px rgb(var(--accent-600)/0.07)`) |
| Primary button | `bg-gradient-to-r from-indigo-600 to-violet-600` |

### Themes

Five **fixed** themes: `light`, `dark`, `sky`, `gold`, `forest` (defined in `src/constants/themes.ts`).

- Each theme = a base (light or dark) **+** an accent hue. The base is still the `.dark` class (`dark` and `forest` set it); the accent is a set of CSS variables.
- `ThemeContext` writes `data-theme="<name>"` on `<html>` and persists the theme **name** to `localStorage` (`journeyset:v1:theme`; the old `'light'`/`'dark'` values are still valid). `index.html` has a pre-paint script that applies the saved theme before React mounts to avoid a flash.
- `tailwind.config.js` remaps the `indigo` scale → `--accent-*` and `violet` → `--accent2-*` (space-separated R G B triplets, so `/60` opacity modifiers still work). `src/index.css` holds one `[data-theme=…]` block per non-default theme. **Never hardcode a hex accent** — use `indigo-*` / `violet-*` classes and they follow the theme.
- Text/icons that sit on an accent-filled surface use **`text-on-accent`** (not `text-white`) — it is white for every theme except Gold, where it is near-black for contrast.
- Adding a theme: add an entry to `THEMES`, add a `[data-theme='…']` block in `index.css`, add its name to the allow-list in `index.html`. Keep filled-accent (`--accent-600`) at ≥4.5:1 against `--accent-contrast`.
- The picker lives in `SettingsPage` (full) and the `AppLayout` sidebar (swatch row / cycle button when compact). The `PrintView` `@media print` CSS is intentionally still hardcoded indigo — printouts are always light.

**Custom Tailwind additions** (see `tailwind.config.js`):
- Breakpoint `xs: 475px` — fills the gap between 320 px phones and the standard `sm: 640px`.
- `shadow-card` and `shadow-card-hover` tinted with the live accent (`rgb(var(--accent-600) / …)`).
- `fontFamily.sans` set to Plus Jakarta Sans.
- `minHeight.dvh` / `height.dvh` = `100dvh`.

**Safe-area utilities** (see `src/index.css`): `.pt-safe`, `.pb-safe`, `.pl-safe`, `.pr-safe` — wraps `env(safe-area-inset-*)` for notch / Dynamic Island / home indicator support. Apply to sidebar, sticky headers, modal backdrops, and footers.

## Responsive design

| Breakpoint | Target devices |
|---|---|
| base (< 475px) | Small Android / iPhone SE / iPhone 14 |
| `xs:` (475px+) | Large phones (iPhone 14 Pro Max, Pixel 8) |
| `sm:` (640px+) | Landscape phone / small tablet |
| `md:` (768px+) | iPad mini / iPad Air |
| `lg:` (1024px+) | iPad Pro / laptop |
| `xl:`+ | Desktop |

**Key responsive patterns**:
- Modals (`AuthModal`, `EventCalendar` event modal, `EditTaskModal`) render as **bottom sheets** on mobile (`items-end`, `rounded-t-2xl`, `sheet-enter` animation) and centred cards on `xs:+`.
- All interactive elements have `min-h-[44px]` (Apple HIG minimum touch target).
- `min-h-dvh` replaces `min-h-screen` everywhere — `100vh` on iOS Safari includes the retractable URL bar.
- `viewport-fit=cover` in `index.html` enables safe-area CSS on notched devices.

## Auth initialisation pattern

`AuthContext` uses **only** `onAuthStateChange` to determine the initial auth state. Do **not** re-introduce `supabase.auth.getSession()` inside a `useEffect`.

**Why**: `getSession()` silently attempts to refresh an expired token over the network. If that request hangs (Supabase project paused, flaky network, cold-start), the `await` never resolves, the `finally` block never runs, and `setLoading(false)` is never called — causing a permanent loading spinner.

`onAuthStateChange` fires `INITIAL_SESSION` synchronously from `localStorage` on mount (no network call), so `setLoading(false)` is called in the same JS tick. Any token refresh happens in the background via subsequent events (`TOKEN_REFRESHED`, `SIGNED_OUT`).

The profile name is fetched with a fire-and-forget `.then()` after setting the user from session data — so a slow or failing profile query never blocks the initial render.

## Key behaviours to preserve

- **Recurring tasks**: when advancing to the next week (`handleNextWeek` in `WeeklyPlanner`), tasks marked `recurring: 'weekly'` are created via `createPlannerTask` in Supabase for the new week before the week state changes. Do not revert to client-only UUID generation. `handleNextWeek` first fetches the target week and skips any recurring task already present (matched on `dayKey|time|title`) so navigating forward → back → forward doesn't create duplicates — keep that guard.
- **Event delete in modal**: the Delete button inside the event edit modal must call `deleteEventHandler` (closes modal + updates state), not the raw `deleteEvent` API import.
- **localStorage fallback**: API functions catch Supabase errors and return the cached value — don't remove the catch blocks.
- **Dynamic Tailwind classes**: never build class strings by interpolation (e.g. `` `gap-${n}` ``). Tailwind's scanner can't detect them at build time; use full static class names in ternaries instead.
- **404 handling**: `NotFoundPage` (`src/components/NotFoundPage.tsx`) is used at both catch-alls in `App.tsx` — the top-level `*` route (`fullPage={true}`, renders its own nav/footer since there's no layout wrapping it) and the nested `/app/*` catch-all inside `AppLayout` (`fullPage={false}`, renders just the centered content since the sidebar/header are already provided). It reads `useAuth()` itself to point "back home" at `/app/planner` when signed in or `/` when signed out — don't hardcode the home link.
