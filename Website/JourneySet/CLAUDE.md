# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, http://localhost:5173)
npm run typecheck  # tsc --noEmit on tsconfig.app.json + tsconfig.node.json (0 errors expected)
npm run build      # typecheck, then vite build — a type error fails the build (and the Vercel deploy)
npm run lint       # ESLint (0 errors, 0 warnings expected)
npm run preview    # Serve the production build locally
npm run icons      # Regenerate favicons + public/og-image.png (scripts/generate-icons.mjs; `-- og` / `-- favicons` for one set)
```

`vite build` alone does **not** type-check (esbuild just strips types). Before 2026-09-30 `build` was plain `vite build` and 4 type errors had piled up unnoticed — keep `typecheck` in the build.

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

**Supabase project**: `JourneySet` (ref `awpkrppcpdgrvnmnanjp`, region `ap-south-1`, free tier). Free-tier projects are **paused after ~1 week without activity**. A paused project means nobody can sign in on the live site and every read falls back to the localStorage cache. If sign-in suddenly fails everywhere, check the project status first (Supabase dashboard, or the Supabase MCP `get_project`) and restore it. It was found paused and restored on 2026-09-30.

## Deployment (Vercel)

Live at https://journeyset.vercel.app/ (Vercel project `journeyset`, team `fullymeds-projects`). **Pushing to `main` auto-deploys to production.** Verified on 2026-09-30: commit `e5fe82d` went to production READY within minutes, and the deep-link fix was then live. The owner commits and pushes himself. `vercel.json` has two parts:
- **`rewrites`**: every path → `/index.html`, so deep links and refreshes (`/app/planner`, `/terms`, …) reach the SPA router. Vercel serves real static files (`/assets/*`, favicons) before applying rewrites. **Don't remove this.** Without it Vercel returns its own plain-text 404 for every route except `/`. That was the live behaviour until 2026-09-30.
- **`headers`**: CSP + security headers. The CSP is **duplicated** as a `<meta http-equiv>` tag in `index.html` (the meta copy can't carry `frame-ancestors`). Allowing a new external host means editing **both**.

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
/reset-password → ResetPasswordPage (public; landing page for the password-reset email link)
*               → NotFoundPage (fullPage={true}, standalone with its own nav/footer)
```

**Code-splitting**: `App.tsx` loads every page except `LandingPage`/`NotFoundPage` with `React.lazy`. That covers the four app pages, Terms, Privacy and ResetPassword. Top-level routes fall back to `LoadingScreen`; in-app routes use a small `PageLoader` spinner inside `AppLayout`, so the sidebar stays put. `PrintView` is also lazy inside each page (`Suspense fallback={null}`). This took the main chunk from ~531 kB to ~432 kB (124 kB gzip) and cleared Vite's 500 kB warning. Add new routes the same way.

## Architecture

### Contexts (`src/contexts/`)

| Context | Exports | Persisted to |
|---|---|---|
| `AuthContext` | `user`, `login`, `register` (returns `needsConfirmation`), `logout`, `requestPasswordReset`, `updatePassword`, `passwordRecovery`, `deleteAccount`, `isLoading` | Supabase session |
| `ThemeContext` | `theme`, `setTheme`, `toggleTheme`, `isDark`, `themes` | `localStorage` (`journeyset:v1:theme`) |
| `CompactModeContext` | `isCompact`, `toggleCompact` | `localStorage` (`journeyset_compact_mode`) |

### Data layer (`src/api/`)

Each API file (`plannerApi`, `goalsApi`, `eventsApi`) follows the same pattern:
1. Reads from / writes to Supabase (primary source of truth). Each file has one row type (`PlannerTaskRow` / `GoalRow` / `EventRow`) and one mapper (`toTask` / `toGoal` / `toEvent`). All `snake_case` → `camelCase` conversion happens there, and DB `null`s become `undefined`.
2. On a successful fetch it writes a user-scoped localStorage cache. Successful create/update/delete calls also patch that cache, so the offline copy doesn't go stale after edits.
3. On network failure, reads fall back to the cache so the UI still renders. Writes return `null`/`false`, and the component shows an `ErrorBanner`.

**Planner cache holds every fetched week**, not just the last one. `getPlannerTasks(userId, weekKey)` replaces only that week's slice of `journeyset:v1:planner:{userId}`, and the fallback filters by `weekKey`. Before 2026-09-30 the cache was overwritten per fetch, so offline you'd see the last-loaded week's tasks under whatever week you navigated to.

**Clearing optional fields**: `updatePlannerTask`, `updateGoal` and `updateEvent` treat `time` / `description` as "touch only if the key is present" (`'time' in updates`). Passing `time: undefined` or `''` writes `NULL`, which clears it. Omitting the key leaves it alone. Every other field uses `!== undefined`. Keep this: before, "clear the time" and "clear the description" silently did nothing, and changing a task's **day** in `EditTaskModal` wasn't persisted either (`day_key` wasn't in the update payload).

`plannerApi` also exports `recordSync` / `getLastSync` / `clearLastSync`, which `SettingsPage` uses to show the last-sync timestamp. `logout` clears it.

### Write failures & in-flight guards

- **`ErrorBanner`** (`src/components/ErrorBanner.tsx`) is a dismissible rose alert. `WeeklyPlanner`, `GoalTracker` and `EventCalendar` each hold an `error` string and render `<ErrorBanner>` above their content when a write fails (message: `SAVE_ERROR` in `src/constants/messages.ts`). `EditTaskModal` and the event modal show their own inline error and **stay open** on failure, so the user's edits aren't lost.
- **Functional state updates**: after an `await`, always `setX(prev => ...)`, never `setX([...x, item])`. The captured array is stale if another write finished in the meantime.
- **Stale-response guard**: each feature's load effect keys on `user?.id` (not the `user` object) and sets a `cancelled` flag in its cleanup. A slow response for week A can't overwrite week B.
- **Double-submit guards**: `adding` (planner/goal forms), `saving` (event modal, `EditTaskModal`), `navigating` (planner next/prev), and `pendingIds` (GoalTracker, per goal). Goal +1/-1 computes the new value from the current one, so two quick clicks used to send the same value twice. The goal's controls are now disabled until its write settles. **Next week** is also disabled while the current week is loading, because recurring tasks are copied from the loaded week.

### Loading states

- **`LoadingScreen`** (`src/components/LoadingScreen.tsx`): the single full-viewport loading UI (logo + `Loader2` spinner) shown while auth is resolving. Used by both `App.tsx` (top-level `isLoading` from `useAuth`) and `ProtectedRoute`. Don't reintroduce a bespoke spinner in either place — route any new "waiting on auth" case through this component so the loading UI stays visually consistent and on-theme.
- **Per-feature data fetches**: `WeeklyPlanner`, `GoalTracker`, and `EventCalendar` each track their own `[tasks|goals|events]Loading` boolean around their initial Supabase fetch (and, for `WeeklyPlanner`, each week change) and render a centered `Loader2` block (`h-8 w-8 text-indigo-500 animate-spin` + a muted caption) in place of the grid while `true`. This matters because these lists start empty — without a loading flag, the "no data yet" empty state flashes before the real data arrives. `PrintView` already had this pattern (`isLoading` + `Loader2`); the other three follow the same convention. When adding a new data-fetching feature component, follow this pattern rather than leaving the empty state to double as a loading state.
- **`AuthModal`** shows a `Loader2` spin icon next to "Please wait…" on its submit button while `loading` is true, matching the same icon+text convention. The event modal, `EditTaskModal` and the add buttons follow the same icon convention while saving.

### Modals (`src/hooks/useModalFocus.ts`)

Every modal (`AuthModal`, `EditTaskModal`, the `EventCalendar` event modal, the `SettingsPage` reset dialog, `ConfirmDialog`, `DeleteAccountDialog`) uses `useModalFocus(isOpen, onClose)`: Escape closes it, Tab is trapped, and focus is restored on close. The dialog element gets `ref={modalRef}`, `role="dialog"`, `aria-modal` and `aria-labelledby`. Initial focus goes to an element marked **`data-autofocus`** if there is one (the event modal's Title input), else the first focusable element. Don't use React's `autoFocus` inside these, because the hook's focus call would override it. `onClose` is stored in a ref, so passing an inline arrow is fine. (Previously it was an effect dependency, so any parent re-render re-ran the effect and yanked focus back to the first field.)

### Delete confirmations (`src/components/ConfirmDialog.tsx`)

Deleting a task, goal or event always goes through `ConfirmDialog`. It is a small destructive-action `alertdialog`, **portalled to `<body>`** at `z-[60]`, so it can open on top of the event modal without either modal's native Escape/Tab listeners seeing the other's keys. Initial focus is on **Cancel** (`data-autofocus`). `onConfirm` may be async; the dialog shows a spinner until it settles and the caller then closes it. Each feature holds a `deleting{Task,Goal,Event}` state, and the trash buttons set it instead of deleting directly. Inside the event modal, Delete also goes through `ConfirmDialog` → `deleteEventHandler` (see Key behaviours).

### Print / export (`src/components/PrintView.tsx`)

`PrintView` is **portalled to `<body>`** and adds `print-view-open` to `<body>` while mounted. `index.css` has `@media print { body.print-view-open > #root { display: none } }`, so only the report prints, not the sidebar, header and page underneath it. Escape closes it. Props: `view`, `weekKey` (planner — `PlannerPage` tracks it via `WeeklyPlanner`'s `onWeekChange`), and `month` (calendar — `CalendarPage` tracks it via `EventCalendar`'s `onMonthChange`, so Export prints the month you're looking at, not always the current one). `weekKeyToMonday` uses `setISOWeek` + `startOfISOWeek`. Don't go back to adding `86400000` ms per day, which lands on Sunday 23:00 across a daylight-saving change.

### Favicon set (`public/`)

`favicon.svg` is the source of truth — a 32×32 vector redraw of the in-app logo badge (indigo-500→violet-600 gradient, `rounded-lg`-equivalent corners, white lucide `Compass` glyph at the exact same geometry used in `AppLayout`/`LandingPage`/etc.). `favicon.ico` (16/32/48 multi-res), `apple-touch-icon.png` (180×180), `icon-192.png`, and `icon-512.png` are all rasterized from it — don't hand-edit the PNGs/ICO directly; regenerate them from `favicon.svg` if the mark ever changes. `site.webmanifest` references the two PNG icons plus `theme_color` (`#4f46e5`, indigo-600) and `background_color` (`#f8fafc`, slate-50), matching the design system tokens above — update those two values together if the primary/background tokens ever change. All five files plus the manifest are linked from `index.html`'s `<head>`. Regenerate them with **`npm run icons -- favicons`** (`scripts/generate-icons.mjs`; `sharp` + `png-to-ico` are devDependencies since 2026-10-06). Run against the current `favicon.svg`, it reproduces the committed files visually; only the PNG compression differs, so the originals were kept to avoid binary churn.

### Link previews / Open Graph (`index.html`, `public/og-image.png`)

`index.html` has static `og:*` and `twitter:*` tags with **absolute** `https://journeyset.vercel.app/...` URLs. They're the same for every route: link-preview crawlers don't run JS, so `usePageMeta` can't change them. `og-image.png` (1200×630: logo badge, wordmark, the hero tagline, a feature line, the URL) is drawn from an inline SVG in `scripts/generate-icons.mjs` (`npm run icons -- og`). Its text uses system sans-serif fonts because librsvg can't load Google Fonts, so check it visually after regenerating. If the production domain changes, update the URLs in `index.html` and the URL text in the script.

### Legal pages (`src/pages/TermsPage.tsx`, `src/pages/PrivacyPage.tsx`)

Both are thin content components wrapped in `LegalPageLayout` (`src/components/LegalPageLayout.tsx`), which owns the shared nav/footer chrome and the prose styling (descendant-selector classes for `h2`/`p`/`ul`/`a`/`strong`/`code` — write page content as plain semantic HTML inside a `<section>` per clause, don't add per-element classes). `LegalPageLayout` reads `useAuth()` itself to point its back link at `/app/planner` or `/`, same pattern as `NotFoundPage`. Routed at `/terms` and `/privacy` — public, top-level routes outside `/app/*`, so they render for both signed-in and signed-out users. Linked from the `LandingPage` footer, the register form in `AuthModal` (consent line, register mode only), `SettingsPage` (small legal-links row), and cross-linked in `LegalPageLayout`'s own footer. When editing the copy, keep the "Last updated" date in sync with actual content changes.

### Per-page meta (`src/hooks/usePageMeta.ts`)

This is a client-rendered SPA with no SSR, so there's no head-management library (react-helmet, etc.) — `usePageMeta(title, description)` sets `document.title` and the `<meta name="description">` content directly in a `useEffect`, restoring the previous values on unmount. Every route-level component calls it once near the top of the component body: `LandingPage`, `NotFoundPage`, and each page in `src/pages/` (`PlannerPage`, `GoalsPage`, `CalendarPage`, `SettingsPage`). When adding a new route, add a `usePageMeta` call with a distinct title/description rather than leaving the previous page's meta in place.

### Storage (`src/utils/storage.ts`)

Typed `localStorage` wrapper. Fixed keys are in the `StorageKey` union type (add new keys there, or `tsc` rejects them — `last_sync` was missing until 2026-09-30). User-scoped cache keys are generated by `storage.getUserKey(feature, userId)` — which returns `StorageKey` via a cast — and look like `journeyset:v1:planner:{userId}`. `storage.clearUserCache(userId)` removes all three; it's called by `logout` (so a shared device doesn't keep the previous user's data) and by Settings → Reset all local data.

### DB ↔ TypeScript naming

Supabase columns are `snake_case`; TypeScript types are `camelCase`. The mapping is done entirely inside the API layer (e.g. `day_key` → `dayKey`, `created_at` → `createdAt`). Never pass raw DB column names into components.

### Database schema (`supabase/migrations/`)

All four tables have **Row Level Security** enabled. Every policy enforces `auth.uid() = user_id`. `20260930063000_add_updated_at_triggers.sql` adds `public.set_updated_at()` (with `search_path` pinned to `''`) and a `BEFORE UPDATE` trigger on all four tables. Before that, `updated_at` always equalled `created_at`. It is applied to the live project. The first four migrations were applied by hand (the live project's migration history is empty apart from this one), so `supabase db push` would try to re-run them. Apply new migrations individually.

`20261006090000_add_delete_my_account.sql` defines `public.delete_my_account()`, a `SECURITY DEFINER` function (`search_path=''`) that deletes `auth.users` where `id = auth.uid()`. All four tables `ON DELETE CASCADE` from `auth.users`, so it removes everything the user owns. EXECUTE is granted to `authenticated` only (revoked from `PUBLIC`/`anon`). Verified beforehand: the migration role `postgres` has DELETE on `auth.users`, and all four FKs are cascade (`confdeltype = 'c'`). **Applied to the live project on 2026-10-06** with the owner's OK, then verified: `prosecdef = true`, `search_path=""`, anon can't execute, authenticated can. The Supabase security advisor lists it under "Signed-In Users Can Execute SECURITY DEFINER Function" (lint 0029). That's intended here: the function can only ever delete the caller's own row.

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
- `ThemeContext` writes `data-theme="<name>"` on `<html>` and persists the theme **name** to `localStorage` (`journeyset:v1:theme`; the old `'light'`/`'dark'` values are still valid). A pre-paint script, **`public/theme-init.js`** (loaded by a `<script src>` in `index.html`'s `<head>`; it's external because the CSP's `script-src 'self'` forbids inline scripts), applies the saved theme before React mounts to avoid a flash.
- `tailwind.config.js` remaps the `indigo` scale → `--accent-*` and `violet` → `--accent2-*` (space-separated R G B triplets, so `/60` opacity modifiers still work). `src/index.css` holds one `[data-theme=…]` block per non-default theme. **Never hardcode a hex accent** — use `indigo-*` / `violet-*` classes and they follow the theme.
- Text/icons that sit on an accent-filled surface use **`text-on-accent`** (not `text-white`) — it is white for every theme except Gold, where it is near-black for contrast.
- Adding a theme: add an entry to `THEMES`, add a `[data-theme='…']` block in `index.css`, add its name to the allow-list in `public/theme-init.js`. Keep filled-accent (`--accent-600`) at ≥4.5:1 against `--accent-contrast`.
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
- Modals (`AuthModal`, `EventCalendar` event modal, `EditTaskModal`; the Settings reset dialog is a centred card at every size) render as **bottom sheets** on mobile (`items-end`, `rounded-t-2xl`, `sheet-enter` animation) and centred cards on `xs:+`.
- All interactive elements have `min-h-[44px]` (Apple HIG minimum touch target).
- `min-h-dvh` replaces `min-h-screen` everywhere — `100vh` on iOS Safari includes the retractable URL bar.
- `viewport-fit=cover` in `index.html` enables safe-area CSS on notched devices.

## Auth initialisation pattern

`AuthContext` uses **only** `onAuthStateChange` to determine the initial auth state. Do **not** re-introduce `supabase.auth.getSession()` inside a `useEffect`.

**Why**: `getSession()` silently attempts to refresh an expired token over the network. If that request hangs (Supabase project paused, flaky network, cold-start), the `await` never resolves, the `finally` block never runs, and `setLoading(false)` is never called — causing a permanent loading spinner.

`onAuthStateChange` fires `INITIAL_SESSION` synchronously from `localStorage` on mount (no network call), so `setLoading(false)` is called in the same JS tick. Any token refresh happens in the background via subsequent events (`TOKEN_REFRESHED`, `SIGNED_OUT`).

The profile name is fetched with a fire-and-forget `.then()` after setting the user from session data — so a slow or failing profile query never blocks the initial render. It is deferred with `setTimeout(..., 0)` because Supabase warns against calling other `supabase` methods inside the `onAuthStateChange` callback (the auth lock is held).

A **5 s safety timer** also ends the loading state if `INITIAL_SESSION` never arrives.

**Stable `user` identity**: the callback also fires on `TOKEN_REFRESHED` and on tab re-focus. It only calls `setUser` (and refetches the profile) when the user **id** changes. Otherwise every refresh would create a new `user` object and make every data effect refetch and flash its spinner.

**Sign-up**: `register` returns `needsConfirmation: true` when `signUp` succeeds without a session (email confirmation enabled). `AuthModal` then shows a "Check your email" panel instead of silently closing. `emailRedirectTo` is `window.location.origin`. Supabase only honours it if that origin is in the project's Auth → URL Configuration redirect allow-list (otherwise it falls back to the Site URL).

**Sign-in form**: the 8-character `minLength` applies to **register only**. On login it would block existing accounts created under Supabase's 6-character default.

**Sign-out**: `logout` falls back to `signOut({ scope: 'local' })` if the server call errors (offline / paused project), then clears the user's cache and the last-sync stamp.

**Password reset**:
1. `AuthModal` login mode has a "Forgot password?" link, which opens an internal `forgot` sub-step (not a third `mode` prop) that calls `requestPasswordReset(email)` → `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`. The "check your email" message is deliberately neutral ("If an account exists…"), so it doesn't reveal which emails are registered.
2. The email link gives the user a short-lived recovery session, and Supabase fires `PASSWORD_RECOVERY`. `AuthContext` sets `passwordRecovery`, and `AppContent` redirects to `/reset-password` from **any** path. That covers the case where Supabase falls back to the Site URL because `/reset-password` isn't in the redirect allow-list.
3. `ResetPasswordPage` has the new-password + confirm fields (8+ characters) → `updatePassword` → `/app/planner`. With no session, it shows "This reset link isn't valid" plus Supabase's `error_description` from the URL hash. **`initialUrlHash`** (exported by `utils/supabaseClient.ts`) captures that hash at module load, before supabase-js parses and clears it.

Testing note: the error text only appears on a real page load. Changing just the `#hash` in an open tab doesn't reload the page.

**Account deletion**: Settings → Danger zone → **Delete account** opens `DeleteAccountDialog`. The user must type their email to enable the button. `deleteAccount()` calls `supabase.rpc('delete_my_account')`, then signs out locally, clears the cache and goes to `/`. The SQL function is in `20261006090000_add_delete_my_account.sql` (see Database schema; applied).

**Expected console noise on delete**: right after the RPC, `signOut({ scope: 'local' })` still POSTs `/auth/v1/logout`. The user is already gone, so Supabase answers **403 `user_not_found`** ("User from sub claim in JWT does not exist"). supabase-js deliberately ignores 401/403/404 there and removes the local session anyway. The browser still prints the failed request in red. There's no public API to drop the session without that call, so leave it; it is not a bug.

## Key behaviours to preserve

- **Recurring tasks**: when advancing to the next week (`handleNextWeek` in `WeeklyPlanner`), tasks marked `recurring: 'weekly'` are created via `createPlannerTask` in Supabase for the new week before the week state changes. Do not revert to client-only UUID generation. `handleNextWeek` first fetches the target week and skips any recurring task already present (matched on `dayKey|time|title`) so navigating forward → back → forward doesn't create duplicates — keep that guard.
- **Event delete in modal**: the Delete button inside the event edit modal opens `ConfirmDialog`, whose confirm must call `deleteEventHandler` (closes modal + updates state), not the raw `deleteEvent` API import.
- **No one-click deletes**: tasks, goals and events are deleted only through `ConfirmDialog`; the account only through `DeleteAccountDialog` (type-your-email). Keep new destructive actions behind a confirmation too.
- **Parsing `YYYY-MM-DD`**: use date-fns `parseISO(dateISO)` (local midnight), never `new Date(dateISO)` (UTC midnight — the previous day for anyone west of UTC). Or compare the strings directly, as `PrintView` does.
- **localStorage fallback**: API functions catch Supabase errors and return the cached value — don't remove the catch blocks.
- **Dynamic Tailwind classes**: never build class strings by interpolation (e.g. `` `gap-${n}` ``). Tailwind's scanner can't detect them at build time; use full static class names in ternaries instead.
- **404 handling**: `NotFoundPage` (`src/components/NotFoundPage.tsx`) is used at both catch-alls in `App.tsx` — the top-level `*` route (`fullPage={true}`, renders its own nav/footer since there's no layout wrapping it) and the nested `/app/*` catch-all inside `AppLayout` (`fullPage={false}`, renders just the centered content since the sidebar/header are already provided). It reads `useAuth()` itself to point "back home" at `/app/planner` when signed in or `/` when signed out — don't hardcode the home link.

## Known gaps / possible next steps

Not broken, not asked for yet — flagged here so a future session (or a fresh chat) has the context without re-deriving it:

- **Both passes browser-verified end to end on 2026-10-06**, with a throwaway account on `localhost:5173`, each step checked against the live DB. Covered:
  - planner: add (timed + weekly), edit day / set time / clear time, complete + duplicate clicked back-to-back
  - delete confirmations: Escape cancels; confirm deletes; stacked on top of the event modal, Escape closes only the confirm
  - weekly task copied into the next week exactly once after forward → back → forward
  - goals: target 0 rejected, 2.5-hour target, same-tick +1 burst → 1, clamps at target, +1 disables
  - calendar: correct local date on edit, time/description cleared to NULL, search shows dates
  - `updated_at` trigger moves on edit only
  - print CSS hides `#root` and leaves only the report
  - sign-out clears the three per-user caches + `last_sync`
  - real password-reset email → `/reset-password` → new password
  - Delete account: button gated on exact email (case-insensitive); user + profile + tasks cascade-deleted (users 7 → 6)

  How it was run: Claude can't type passwords into the real Supabase sign-in, so the owner signed in, and set the new password, in Chrome; Claude drove the Claude in Chrome extension. That tab was in the background, which blocks real keystrokes and clicks, so most steps used in-page `.click()` and React-compatible value setters. Re-test on a real device before relying on touch details.

- **Email delivery** — the owner set up custom SMTP (Gmail) on 2026-10-06. Confirmation and reset emails both reached a non-team Gmail address that day. Gmail SMTP has its own daily sending limits, so a dedicated provider (Resend, etc.) is worth it if the user base grows. Supabase's built-in sender only reaches the Supabase team and is not an option for real users.
- **Per-route link previews** — the OG tags are site-wide (see Link previews above). Per-route cards would need prerendering/SSR; not worth it for this app.
- **Legal pages content review** — `TermsPage`/`PrivacyPage` (see above) were drafted by Claude, grounded in what the app actually does (Supabase, RLS, localStorage caching), but are not a substitute for actual legal review. Worth a human pass before treating them as binding, especially if the app ever gets real paying users or handles data from EU/UK users (GDPR) or California users (CCPA) — neither is addressed explicitly.
- **Landing-page stats are product facts** (`3-in-1` / `5` themes / `$0`), replacing the fake "10K+ / 95% / 5K+" on 2026-10-06. Keep them true; there's a comment on the array.
- **Dev-tooling advisories** — `npm audit` reports 9 issues (as of 2026-10-06), all in build/dev tooling (Vite 5's esbuild/dev server, Tailwind 3's chokidar/micromatch/postcss-selector-parser). `npm audit --omit=dev` is clean, so nothing ships to users. Clearing them needs major upgrades (Vite 8, Tailwind 4 — Tailwind 4 changes the config format), which is a separate project.
- **Supabase advisors (as of 2026-09-30)** — Security: *Leaked password protection disabled* (Auth → Password settings; may need a paid plan). Performance: all 15 RLS policies call `auth.uid()` directly instead of `(select auth.uid())`, so it's re-evaluated per row. Harmless at this data size; fix by recreating the policies with the `select` wrapper if tables grow. The remaining "unused index" infos just mean there's barely any traffic yet.
- **Auth URL configuration** — the owner set it on 2026-10-06 (Site URL `https://journeyset.vercel.app`; Redirect URLs `https://journeyset.vercel.app/**` and `http://localhost:5173/**`). The localhost redirect is proven, since the reset test landed on `localhost:5173/reset-password`. The production redirect will be proven by the first real reset after deploy. The Supabase MCP can't read these settings, so changes there must be checked by hand.
