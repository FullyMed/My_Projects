# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Three Frogs is a static HTML + PHP website for a boardgame café in Surabaya, Indonesia. It lets visitors browse games, create accounts, and book table time.

**Live domain:** `threefrogsboardgame.com` (hosted on Hostinger)

## ⚠ Pending / Next Steps (as of 2026-09-29)

Read this before assuming recent work (security hardening, 404 page, loading states, legal pages, image compression, the 2026-09-29 bug-fix pass) is live — it isn't yet. It **has** been verified end-to-end against a real local database (see [Local development](#local-development)). Check items off or delete them as they're actually completed:

- [ ] **Run `Data/schema.sql` on the production DB** (phpMyAdmin → SQL tab). It's `CREATE TABLE IF NOT EXISTS` only, so it just adds whatever is missing — `rate_limits` and/or `password_reset_tokens` are unknown on production. If `password_reset_tokens` is missing, **forgot-password is currently broken on the live site**.
- [ ] **Confirm production `bookings` has an `id` column** (`SHOW COLUMNS FROM bookings;`). `get_bookings.php`/`cancel_booking.php` now identify bookings by `id`. If it's missing: `ALTER TABLE bookings ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;` — do this **before** uploading the new PHP.
- [ ] **Deploy to Hostinger.** Upload all changed files via FTP/File Manager (see Deployment below). Don't upload the local `Assets/PHP/db_config.php` — production keeps its own (a copy of the Hostinger one is at `C:\CSIE\db_config.hostinger.php`, outside the repo).
- [ ] **After deploying, make one real booking + one password reset on the live site** and confirm both emails arrive (PHP `mail()` on Hostinger; locally it only reaches a test mail catcher). Check spam too — if they land there, the `noreply@threefrogsboardgame.com` sender may need SPF/DKIM set up in Hostinger.
- [ ] **Have a lawyer review `Terms-of-Use.html` / `Privacy-Policy.html`** before treating them as final/binding. They were written to accurately describe what the site actually does, but have not been reviewed against Indonesia's UU PDP or any other applicable law.

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — no build step, no bundler, no JS libraries (jQuery was loaded from a CDN but never used; removed 2026-09-29 along with its CSP allowance)
- **Backend:** PHP with MySQLi (OOP style)
- **Database:** MySQL on Hostinger (`u181047418_threefrogs`)
- **Deployment:** Upload files directly to Hostinger; no CI/CD pipeline

## Local development

Set up and verified on this machine 2026-09-29:

- **Database:** XAMPP's bundled MariaDB, on **port 3307** (`C:\xampp\mysql\bin\my.ini` was changed from 3306 because a separate `MySQL80` Windows service already owns 3306; XAMPP phpMyAdmin's `config.inc.php` was pointed at 3307 too). Database `threefrogs_local`, user `threefrogs_dev` (password only in the local `db_config.php`), schema from `Data/schema.sql`. Start it from the XAMPP Control Panel. (An older `threefrogs` DB in that MariaDB has an obsolete, incompatible schema — ignore it.)
- **`Assets/PHP/db_config.php` (local)** defines `DB_PORT` 3307 and `SITE_URL` `http://localhost:8080` in addition to the four standard constants — both optional, see `db_config.example.php`. Production omits them.
- **Web server:** must serve the project folder as the **document root** (for `.htaccess`/`404.html` — see [404 page](#404-page)), e.g. an XAMPP Apache vhost on port 8080 with `AllowOverride All`.
- **Email:** XAMPP's PHP has no working mail server, so `mail()` fails locally unless something listens on the SMTP host/port — booking/reset requests still succeed (`send_site_email()` just logs the failure), and reset tokens can be read from `password_reset_tokens` directly.

## File Layout

| Path | Purpose |
|---|---|
| `*.html` | One file per page (index, Booking, Collection, Dashboard, Login, Signup, About, Forgot-password) |
| `404.html` | Custom error page, served by `.htaccess`'s `ErrorDocument 404 /404.html` — see [404 page](#404-page) below |
| `Terms-of-Use.html`, `Privacy-Policy.html` | Legal pages, linked from every page's footer — see [Legal pages](#legal-pages) below |
| `.htaccess` | Root-level Apache/LiteSpeed config — HTTPS redirect, security headers/CSP, directory-listing lockdown, `ErrorDocument 404` |
| `.gitignore` | Excludes `Assets/PHP/db_config.php` from version control |
| `Assets/CSS/Boardgame.css` | Single stylesheet shared across all pages |
| `Assets/JS/Navbar.js` | Shared navbar + hamburger toggle; included on every page |
| `Assets/JS/Loading.js` | Shared `setButtonLoading()`/`clearButtonLoading()` helpers — included on every page with an async-submitting form (see [Loading states](#loading-states)) |
| `Assets/JS/Boardgame.js` | Handles **both** `index.html` and `Collection.html` by branching on `window.location.pathname` |
| `Assets/JS/<Page>.js` | Per-page JS for Booking, Dashboard, Login, Signup, Forgot-password |
| `Assets/PHP/db_config.php` | **Gitignored** — holds DB credentials; copy from `db_config.example.php` to create |
| `Assets/PHP/db_config.example.php` | Template with placeholder credentials; safe to commit |
| `Assets/PHP/db_connect.php` | Shared DB connection; `require_once`s `db_config.php`, pins PHP + MySQL to Surabaya time (`Asia/Jakarta` / `+07:00`), opens MySQLi, and installs a JSON exception handler (see [PHP endpoint conventions](#php-endpoint-conventions)) |
| `Assets/PHP/*.php` | JSON API endpoints (all respond with `Content-Type: application/json`) |
| `Assets/Images/` | Game cover images (mixed formats: jpg/png/webp/avif) |
| `Data/schema.sql` | Full DB schema (all 5 tables), idempotent — the single source of truth for table definitions |
| `Data/Three Frogs.xlsx` | Offline reference spreadsheet for the game catalogue |

## Architecture

### Authentication flow

Every page calls `Assets/PHP/check_session.php` (POST) before rendering auth-sensitive content. It returns `{ loggedIn: bool, user: { name, email, avatar } }`. The navbar is always injected by `Navbar.js` after this fetch; HTML pages ship with only a hamburger `<button>` and an empty `<ul id="navLinks"></ul>` — never static `<li>` items.

### Session-gating pattern

- `index.html` — shows 10 random games; prompts login for the full list
- `Collection.html` — redirects to `Login.html` if not logged in
- `Booking.html` — hides the form and shows `#authPopup` if not logged in
- `Dashboard.html` — redirects to `Login.html` if not logged in

### Database tables

| Table | Key columns |
|---|---|
| `users` | id, name, email (lowercased), password (bcrypt), avatar |
| `bookings` | **id**, name, email, date, start_time, end_time, people, status ('active') |
| `cancellations` | email, date, start, end, cancel_time |
| `password_reset_tokens` | id, email, token (64-char hex, unique), expires_at (1-hour TTL) |
| `rate_limits` | id, action, identifier (IP or email), created_at — brute-force/abuse throttling |

Full definitions live in **`Data/schema.sql`** (idempotent — run it on any DB to create whatever tables are missing). Without `password_reset_tokens`, forgot-password fails (clean JSON 500); without `rate_limits`, throttling silently doesn't engage (fails open) — see [Security hardening](#security-hardening).

### Booking rules

Enforced server-side in `booking.php` (constants at the top — `TABLE_COUNT`, `MAX_PEOPLE`, `OPEN_TIME`, `CLOSE_TIME`) and mirrored client-side in `Booking.js`/`Booking.html` and in `Terms-of-Use.html` §4. **Change all of them together.**

- Hours **12:00–22:00**; date not in the past; if the date is today, the start time must not have passed. Times are normalized to `HH:MM`.
- **4 tables**, one booking = one table, **max 8 people** per booking. A booking is rejected if the *peak* number of simultaneous bookings anywhere in its window is already 4 — back-to-back bookings (one ends 15:00, next starts 15:00) don't count as overlapping.
- A user can't hold two overlapping bookings (this also prevents exact duplicates).
- The availability check + insert run under a MySQL `GET_LOCK('threefrogs_booking')` so two simultaneous requests can't overbook the last table.
- The booking's email always comes from the session, never the request body.
- On success, a plain-text confirmation email is sent via `send_site_email()` (`security.php`). The response includes `emailSent`; `Booking.js` only claims an email was sent when it's `true`.
- **Cancellation** (`cancel_booking.php`) is by booking `id` + session email (another user's id gets a 404), only **before the booking's start time**, capped at **2 per calendar month** (per-user `GET_LOCK` so parallel requests can't exceed it). The delete + `cancellations` insert run in one transaction.
- `get_bookings.php` returns upcoming bookings plus the last 90 days of past ones; `Dashboard.js` splits them into "Upcoming" (end time in the future — Cancel button only if not started) and "Booking History".
- All dates/times are Surabaya time: `db_connect.php` sets PHP to `Asia/Jakarta` and the MySQL session to `+07:00`, so `date()`, `NOW()`, and `CURDATE()` agree regardless of the server's own timezone.

### 404 page

`404.html` is wired up via `ErrorDocument 404 /404.html` in the root `.htaccess`. This only works correctly when **the project itself is the server's document root** (true for the live Hostinger deployment, and for local dev if you follow the setup instructions and point your local server directly at this folder — not at a subfolder inside some other `htdocs`). If you ever see a plain unstyled Apache "Not Found" page instead of the custom one, or a second 404 nested inside the first, the project is being served from a subdirectory of some other document root — fix the vhost/alias rather than the app.

`404.html` carries `<base href="/" />` in its `<head>`. This is required: Apache's `ErrorDocument` serves this file's content under whatever bogus URL the visitor actually requested (no redirect, address bar unchanged), so without a `<base>` tag every relative path on the page — the stylesheet, `Navbar.js`, and the `fetch()` calls inside it — would resolve against that bogus path instead of the site root and silently fail. Every other page in this project intentionally uses root-relative paths without a leading `/` (see below); `404.html` is the one deliberate exception, and the `<base>` tag is why it can still use the same relative-path style as everywhere else.

### Loading states

Two kinds, both built from the same CSS in `Boardgame.css` (`.spinner`, `.spinner-sm`, `.loading-state`, `.btn-loading`, `.nav-loading`) — no new colors/fonts, all existing design tokens:

1. **Button loading state** — `Assets/JS/Loading.js` provides `setButtonLoading(button, loadingText)` / `clearButtonLoading(button)`. Call `setButtonLoading` right before an async `fetch` that a button triggers, and `clearButtonLoading` in every branch afterwards (success, failure, and the `catch`) — except when success immediately navigates away (see `Login.js`), where there's nothing left to restore. Used in `Login.js`, `Signup.js`, `Booking.js`, `Dashboard.js` (avatar update + cancel-confirm), and `Forgot-password.js`. Include `Loading.js` via `<script>` on any page you add a new async-submitting button to — it must load before that page's own script.
2. **Section/page-gating loading state** — a `.loading-state` block (spinner + short message) shown while a page's own `check_session.php` gate is pending, swapped out once the real content is known:
   - **`Booking.html`** — `#bookingLoadingState` is visible by default; `.booking-form` ships with `class="hidden"`. `Booking.js` hides the loading state and reveals either the form (logged in) or `#authPopup` (not) — never both, never neither.
   - **`Dashboard.html`** — `#dashboardLoadingState` is visible by default; `.dashboard-container` ships with `class="hidden"`. `Dashboard.js` only reveals the container after `checkSession()` confirms a logged-in user (the not-logged-in path redirects away instead, so the container is never revealed there).
   - **`Collection.html`** — `Boardgame.js`'s "3. Initial load" step renders a `.loading-state` into `#boardgame-list` instead of the unfiltered game array when `window.location.pathname.includes("Collection.html")`; the session-check branch further down replaces it with the grouped view once login is confirmed.
   - **Dashboard bookings** — `fetchBookingsFromServer()` writes a `.loading-state` into `#upcomingBookings` before its `fetch`, replaced by `renderBookings()`'s real output once the response arrives.
   - **Navbar** — `Navbar.js` fills `#navLinks` with a single `<li class="nav-loading">` spinner immediately on `DOMContentLoaded`, before its own `check_session.php` fetch. This one JS-injected placeholder doesn't violate "never add static `<li>` items to HTML pages" below — that rule is about what ships in the HTML source, not what `Navbar.js` itself writes at runtime.

**Why this exists:** before this pattern, `Booking.html`/`Dashboard.html` briefly rendered their real (empty) content and `Collection.html` briefly rendered the *entire* ungated ~218-game list before each page's login check resolved and hid/redirected — a real flash of content a logged-out visitor should never see. Any new page or endpoint gated by `check_session.php` should follow the same hide-by-default-then-reveal pattern rather than hiding content reactively after the fact.

### Legal pages

`Terms-of-Use.html` and `Privacy-Policy.html` follow the same page boilerplate as every other page and reuse `.about-section` (the same card styling as `About.html`) for their content — no new CSS classes for the content itself, just a small `.footer-links` rule (see below) for the links that point to them.

**Every page's footer links to both**, via:
```html
<p class="footer-links"><a href="Terms-of-Use.html">Terms of Use</a> · <a href="Privacy-Policy.html">Privacy Policy</a></p>
```
placed directly after the `&copy; 2025 ...` line. **Any new page must include this too** — it's not injected dynamically like the navbar, so it has to be copy-pasted into each new page's footer.

**Content is a starting draft, not reviewed by a lawyer.** It was written to accurately describe what the Site actually does (the real data fields collected, the real security measures in `security.php`/`.htaccess`, the real booking rules) rather than generic boilerplate, but it has not been reviewed against Indonesia's Personal Data Protection Law (UU PDP) or any other applicable law by legal counsel. If the content of either page is edited, keep it truthful to the current implementation — e.g. don't claim a security measure, cookie behavior, or data-sharing practice that isn't actually true of the code at the time.

### Forgot-password flow

Two-step, token-based:
1. User submits email → `request_reset.php` generates a 64-char token, stores it with a 1-hour expiry, and emails a reset link (`Forgot-password.html?token=...`).
2. User clicks the link → JS reads `?token=` from the URL, shows the "set new password" form → `forgot_password.php` validates the token against the DB, resets the password, and deletes the token.

This flow is entirely in `Forgot-password.html` / `Forgot-password.js` / `request_reset.php` / `forgot_password.php`.

### Boardgame catalogue

All game data is a hardcoded JavaScript array in `Assets/JS/Boardgame.js` (~218 games — not stored in the database). Adding a game means appending an object with `{ name, category, players, duration, image, description, tags[] }` to that array and placing the image in `Assets/Images/`.

Valid categories — **every category used in the array must have an `<option>` in `Collection.html`'s filter dropdown**, or its games can't be filtered to: Party, Family, Abstract, Strategy, Dexterity, Thematic, Word Game, Cooperative, Card Game, Bluffing, Deduction, Social Deduction, Puzzle, Kids, Horror, plus the 1-game categories Adventure, Casual, City Building, Classic, Duel, Memory, Negotiation, Storytelling. Collection search matches game names **and tags**.

**New game cover images should be resized to a max dimension of ~900px on the longest side before committing** (matches every existing image after the optimization pass below). There's no build step and no image pipeline in this project — whatever file you commit is served as-is, so an uncompressed 3000px phone photo will genuinely ship to every visitor's browser.

### Image optimization

As of this pass, every file in `Assets/Images/` (except `Avatars/`, `favicon_io/`, and the 5 `.avif` files, which were already small) has been resized to a **900px max dimension** and re-encoded (JPEG quality 82, PNG `optimize=True`, WebP quality 82, via Pillow) — filenames and extensions are unchanged, so `Boardgame.js`'s `image:` paths needed no edits. This took the folder from ~96MB to ~24MB (~75% smaller) with no visible quality loss at the sizes these images are actually displayed (card thumbnails, per the breakpoints table below).

**`ThreeFrogsPlace.jpg` is the one deliberate exception** — it's used as a full-bleed `background: url(...) cover` hero image (see `.hero` in `Boardgame.css`), not a card thumbnail, so it's sized to a 1920px-wide cap instead of 900px. If you ever re-run a bulk image pass, exclude this file from the generic card-image treatment or it will look upscaled/blurry on wide screens — check `Boardgame.css` for `background: url(` before assuming every image in this folder is a card thumbnail.

Both `<img>` tags in `Boardgame.js` (`renderBoardgames()` and the Collection page's grouped-view renderer) carry `loading="lazy" decoding="async"` — meaningful here since `Collection.html` renders all ~218 game cards into the DOM at once (see [Loading states](#loading-states)); lazy-loading defers fetching images that are off-screen instead of downloading all of them upfront.

### PHP endpoint conventions

- Every endpoint sets `ini_set('display_errors', 0)` and `error_reporting(E_ALL)` — errors go to the server log, never to the browser
- Every endpoint sets `Content-Type: application/json`
- Auth/session endpoints call `secure_session_start()` from `Assets/PHP/security.php` — **never call raw `session_start()`** (it sets `HttpOnly`/`Secure`/`SameSite=Lax` cookie params first)
- All use `require_once("db_connect.php")`
- A local `respond($status, $data)` helper echoes JSON and calls `exit`
- Booking/cancellation endpoints accept JSON body (`php://input`); auth endpoints accept form POST
- Passwords use `password_hash` / `password_verify` (bcrypt)
- Avatar values are validated against a hardcoded whitelist in both `signup.php` and `update_avatar.php`
- Never echo `$conn->error` / `$stmt->error` (or any exception message) into a JSON response — log it with `error_log()` and return a generic message instead
- **`db_connect.php` enables `MYSQLI_REPORT_STRICT`, so every DB error is thrown as a `mysqli_sql_exception`** — `if (!$stmt)` checks after `prepare()` never fire. Catch exceptions where you need a fallback (as `security.php`'s rate-limit helpers do); anything uncaught hits `db_connect.php`'s `set_exception_handler`, which logs it and returns a generic JSON 500 instead of an empty body the frontend can't parse.
- Outgoing email goes through `security.php`'s `send_site_email($to, $subject, $body)` (plain text, from `noreply@threefrogsboardgame.com`); emailed links use `site_url()` (optional `SITE_URL` in `db_config.php`, default `https://threefrogsboardgame.com`) — never build links from the `Host` header.
- Frontend: any server- or user-provided text inserted via `innerHTML` goes through the page's `escapeHtml()` helper (see `Booking.js`/`Dashboard.js`).

### Security hardening

- **CSRF protection** — `Assets/PHP/security.php` provides `csrf_token()` / `verify_csrf_token()`. `check_session.php` hands every page a `csrfToken` in its JSON response; the frontend JS (`Login.js`, `Signup.js`, `Booking.js`, `Dashboard.js`) caches it from that same call and resends it (`Login.js`/`Signup.js` re-fetch it right before submitting: on a cookieless first visit their page-load call and `Navbar.js`'s run in parallel and can each start a different session, so the token cached at load may belong to the session whose cookie lost) as `csrf_token` (form field, JSON body field, or `X-CSRF-Token` header) on every state-changing request. `login.php`, `signup.php`, `booking.php`, `cancel_booking.php`, and `update_avatar.php` all reject requests that don't present a valid token. When adding a new state-changing endpoint, wire it into this pattern.
- **Rate limiting** — `security.php`'s `rate_limit_exceeded()` / `record_attempt()` back onto the `rate_limits` table, keyed by `action` + identifier (IP and/or email). Applied to `login.php` (per-IP and per-email), `signup.php` (per-IP), `request_reset.php` (per-IP and per-email), and `forgot_password.php` (per-IP). Fails **open** (i.e. does not block) if the table doesn't exist, so a missed migration can't lock out every user — create the table (`Data/schema.sql`) to actually enforce limits. (Before 2026-09-29 this claim was false: strict mysqli mode threw on the missing table and crashed login/signup/reset — the helpers now catch it. Verified locally by renaming the table.)
- **Session fixation** — `login.php` and `signup.php` call `session_regenerate_id(true)` immediately after establishing `$_SESSION['user']`.
- **Server-level hardening** — the root `.htaccess` forces HTTPS in production (skipped when `HTTP_HOST` is `localhost`/`127.0.0.1`, with or without a port, so local dev isn't broken even on a non-default port), sets security headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS), disables directory listing, serves `404.html` via `ErrorDocument`, and denies direct web access to `db_config.php` and `*.xlsx`/`*.sql`/`*.log`/`*.md`/`.git*`. `Data/.htaccess` denies all access to that folder outright. The CSP's `script-src` is just `'self'` — no third-party scripts are loaded. Keep it free of `unsafe-inline`/`unsafe-eval` — if you need a new inline `<script>` or an `onclick=` attribute, wire it up as an external listener instead (see `Booking.js` for the pattern used to replace the old `authPopup` button `onclick`s).
- External links using `target="_blank"` must include `rel="noopener noreferrer"` (reverse-tabnabbing protection) — see `About.html`.

## Design System

### Tokens (CSS custom properties in `Boardgame.css`)

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1a3c2e` | Navbar, headings, buttons, footer |
| `--color-accent` | `#c9a227` | Highlights, tags, borders, hover states |
| `--color-bg` | `#faf8f2` | Page background (warm cream) |
| `--color-surface` | `#ffffff` | Cards, form panels |
| `--color-surface-alt` | `#f3ede1` | Input read-only, card image bg |
| `--color-text-muted` | `#6b7280` | Secondary text |
| `--navbar-height` | `68px` desktop / `60px` mobile | Used for alphabet nav `top` offset |
| `--alphabet-nav-w` | `48px` | Width of the fixed side nav on Collection page |
| `--page-padding-x` | `clamp(1rem, 4vw, 3rem)` | Horizontal gutter across all sections |

### Typography

- **Headings:** `Righteous` (Google Fonts)
- **Body:** `Poppins` (Google Fonts)
- Google Fonts are loaded via `@import` in the CSS; every HTML page has `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com`

### Breakpoints

| Range | Grid columns (game cards) |
|---|---|
| ≤ 360 px | 1 |
| 361–480 px | 2 |
| 481–768 px | 3 |
| 769–1024 px | 3 |
| 1025–1400 px | 4 |
| ≥ 1401 px | 5 |

## Key behaviours to preserve

- **Navbar is fully dynamic** — `Navbar.js` injects all `<li>` elements after the session check. Never add static `<li>` items to HTML pages. Every page must have `<button class="nav-toggle" id="navToggle" ...>` and `<ul class="nav-links" id="navLinks"></ul>` inside `.navbar`.
- **Hamburger menu** — `Navbar.js` handles open/close via `.nav-open` on `#navLinks` and `aria-expanded` on `#navToggle`. Close-on-outside-click and close-on-Escape are both wired up.
- **`Boardgame.js` page detection** — branches on `window.location.pathname` to run either the index (10 random games) or Collection (grouped A–Z) logic. Do not move or nest these branches.
- **`Collection.html` body class** — `<body class="page-collection">` is required so CSS can apply `padding-left` to the grid and search bar to clear the fixed alphabet nav. No other page has this class.
- **Alphabet nav** — only visible on `≥769 px`; hidden on mobile via `display: none`. The side rail is `position: fixed; left: 0; width: var(--alphabet-nav-w)`.
- **Input font sizes** — all inputs/selects must stay at `font-size: 1rem` (16 px) to prevent iOS auto-zoom on focus. The global reset in `Boardgame.css` enforces this; don't override it with sub-16px values.
- **Touch targets** — all interactive elements use `min-height: 44px` and `touch-action: manipulation`. Maintain this when adding new controls.
- **Hover vs touch** — card `.details` and hover lifts use `@media (hover: hover)` so they only apply to pointer devices. Touch devices show details statically via `@media (hover: none)`. Follow this pattern for any new hover effects.
- **Safe-area insets** — navbar, footer, popups, and the scroll-to-top button use `env(safe-area-inset-*)` to respect notch / Dynamic Island / home bar. Keep these on any new fixed/sticky elements.
- **Avatar values** — stored as relative file paths (e.g. `Assets/Images/Avatars/Clam.jpg`). The allowed set is validated server-side in both `signup.php` and `update_avatar.php`.
- **`[...]boardgames` shuffle** — index page uses `[...boardgames].sort(...)` (spread to avoid mutating the source array). Collection page re-sorts with `localeCompare`. Both branches read from the same module-level array.
- **Booking email field** — set server-side from session on page load (`readOnly = true`). After a successful booking `bookingForm.reset()` is called, followed immediately by re-populating the email field so back-to-back bookings work.
- **`db_config.php` is gitignored** — never commit real credentials. The file must exist on the server (and locally for dev) but is excluded from version control. Use `db_config.example.php` as the template.
- **Hide-then-reveal for session-gated content** — `Booking.html`/`Dashboard.html` ship with their real content wrapped in `class="hidden"` and a `.loading-state` sibling shown by default; the page's JS only removes `hidden` once `checkSession()` confirms the right state (see [Loading states](#loading-states)). Don't revert to showing real content immediately and hiding it reactively after the fetch resolves — that's the flash-of-ungated-content bug this pattern replaced.
- **Footer legal links on every page** — every page's footer must include the `.footer-links` paragraph linking to `Terms-of-Use.html` and `Privacy-Policy.html` (see [Legal pages](#legal-pages)). Copy it from an existing page's footer when creating a new one.
- **`404.html`'s `<base href="/" />`** — every other page uses relative asset paths with no leading `/` because they're all served from the document root anyway; `404.html` is the one page that must keep its `<base>` tag (see [404 page](#404-page)), since `ErrorDocument` serves it under an arbitrary, possibly-nested URL. Don't remove it, and don't "fix" the other pages to match — they're intentionally different.
