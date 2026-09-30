# Three Frogs Boardgame Café — Website

Website for **Three Frogs**, a boardgame café in Surabaya, Indonesia. Visitors can browse the game catalogue, create an account, and book table time.

**Live site:** [threefrogsboardgame.com](https://threefrogsboardgame.com)

---

## ⚠ Pending / Next Steps (as of 2026-09-29)

Recent work (security hardening, 404 page, loading states, legal pages, image compression, the 2026-09-29 bug-fix pass) is **not yet live**. It **has** been tested end-to-end against a real local database (66 API checks + a full browser run-through of every page). Check items off or remove them as they're actually completed:

- [ ] **Run `Data/schema.sql` on the production DB** (phpMyAdmin → SQL). It only creates missing tables — `rate_limits` / `password_reset_tokens` status on production is unknown, and if `password_reset_tokens` is missing, **forgot-password is currently broken on the live site**.
- [ ] **Confirm production `bookings` has an `id` column** (`SHOW COLUMNS FROM bookings;`). The new cancel flow identifies bookings by `id`. If missing, run `ALTER TABLE bookings ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;` **before** uploading the new PHP.
- [ ] **Deploy to Hostinger** — upload the changed files via FTP/File Manager (see [Deployment](#deployment)). Do **not** upload the local `Assets/PHP/db_config.php`.
- [ ] **After deploying, make one real booking and one password reset on the live site** and confirm both emails arrive (check spam; the `noreply@threefrogsboardgame.com` sender may need SPF/DKIM in Hostinger).
- [ ] **Get a lawyer to review `Terms-of-Use.html` / `Privacy-Policy.html`** before relying on them as final/binding — written to be accurate to the site's actual behavior, but not reviewed against Indonesia's UU PDP or any other law.

---

## Recent Changes (2026-09-29 bug-fix pass — not yet deployed)

**Bugs fixed:**
- **Logged-in users saw a blank Booking page.** `Booking.js` revealed the `<form>`, but the `hidden` class sits on the wrapping `<section>`.
- **Login, signup and password reset crashed** (empty 500) if the `rate_limits` table was missing, even though the docs said this "fails open". Strict mysqli mode threw an exception nobody caught; the helpers now catch it.
- **The first login or signup in a fresh browser could fail with "Your session expired".** Two parallel session checks started separate sessions, so the token is now re-fetched at submit time.
- **Duplicate bookings, and cancels that deleted both.** A user could book the same slot twice, and a cancel then deleted both rows while counting only one cancellation. Cancels are now by booking `id` and ownership-checked, and self-overlapping bookings are blocked.
- **Dashboard "Booking history" was always empty.** The server now returns the last 90 days too.
- **Start times that had already passed today** could be booked.
- **Cancelling an already-started booking** was allowed.
- **A DB error message was sent to the browser** by `get_bookings.php`.
- **Dates and times depended on the server's timezone.** They are now pinned to Surabaya time (UTC+7).
- **Smaller fixes:**
  - Login email matching now ignores letter case.
  - All game categories are filterable.
  - Collection search matches tags.
  - The home page no longer renders all 218 cards before showing 10.
  - Output is HTML-escaped.
  - The unused jQuery CDN script was removed, and the CSP tightened to `script-src 'self'`.

**New behaviour (owner's decisions):**
- 4 bookable tables, max 8 people per booking.
- Emailed booking confirmations.
- Terms of Use and Privacy Policy updated to match.

**Tooling:**
- `Data/schema.sql` (all tables, idempotent).
- Optional `DB_PORT`/`SITE_URL` in `db_config.php`.
- A working local dev DB (see [Local Setup](#local-setup)).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no libraries) |
| Backend | PHP 8 with MySQLi (OOP style) |
| Database | MySQL (Hostinger) |
| Hosting | Hostinger shared hosting |
| Deployment | Manual file upload (no CI/CD) |

No build step, no bundler, no npm. Every page is a plain `.html` file.

---

## Local Setup

**Requirements:** PHP 8+, MySQL/MariaDB, a local server (XAMPP / Laragon / Herd).

1. Serve the project folder **as the document root** (e.g. an Apache vhost on port 8080 with `AllowOverride All`) — not as a subfolder of `htdocs`, or `.htaccess`/`404.html` won't behave like production.
2. Create a database and run **`Data/schema.sql`** against it.
3. Copy `Assets/PHP/db_config.example.php` → `Assets/PHP/db_config.php` and fill in your local credentials. Optional extras: `DB_PORT` (if not 3306) and `SITE_URL` (e.g. `http://localhost:8080`, so emailed reset links point at your local site). This file is gitignored and must never be committed.
4. Open the site in your browser.

**This machine's setup (2026-09-29):** XAMPP's MariaDB runs on **port 3307** (a separate `MySQL80` service holds 3306; `my.ini` and phpMyAdmin's `config.inc.php` were updated to match), with database `threefrogs_local` and user `threefrogs_dev`. Start MariaDB from the XAMPP Control Panel.

> `db_config.php` is the single source of DB credentials. `db_connect.php` requires it at runtime — do not hardcode credentials anywhere else.
>
> Locally, PHP `mail()` has no mail server to talk to, so booking-confirmation and reset emails aren't delivered — the requests still succeed. Read reset tokens straight from the `password_reset_tokens` table when testing.

---

## File Structure

```
/
├── .htaccess                       HTTPS redirect, security headers/CSP, ErrorDocument 404, file lockdown
├── .gitignore                      Excludes db_config.php
├── robots.txt                      Disallows /Assets/PHP/ and /Data/
├── index.html                      Home — 10 random games, login prompt for full list
├── Collection.html                 Full A–Z game catalogue (login-gated)
├── Booking.html                    Table booking form (login-gated)
├── Dashboard.html                  User account & booking history (login-gated)
├── Login.html
├── Signup.html
├── Forgot-password.html            Two-step password reset (email → token link → new password)
├── About.html
├── 404.html                        Custom error page — see Security Hardening below for the <base> tag gotcha
├── Terms-of-Use.html                Legal — linked from every page's footer
├── Privacy-Policy.html              Legal — linked from every page's footer
│
├── Assets/
│   ├── CSS/
│   │   └── Boardgame.css           Single shared stylesheet
│   ├── JS/
│   │   ├── Navbar.js               Shared navbar — injected dynamically on every page
│   │   ├── Loading.js              Shared button loading-state helpers (setButtonLoading/clearButtonLoading)
│   │   ├── Boardgame.js            Game data array (~218 games) + index & collection page logic
│   │   ├── Booking.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Forgot-password.js
│   ├── PHP/
│   │   ├── db_config.php           GITIGNORED — holds DB credentials (copy from example)
│   │   ├── db_config.example.php   Credential template (safe to commit)
│   │   ├── db_connect.php          Opens MySQLi via db_config.php; Surabaya timezone; JSON error handler
│   │   ├── security.php            CSRF tokens, hardened sessions, rate limiting, email helper — shared by every endpoint below
│   │   ├── check_session.php       Returns { loggedIn, user, csrfToken } — called on every page load
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── signup.php
│   │   ├── request_reset.php       Step 1 of password reset: generates token, sends email
│   │   ├── forgot_password.php     Step 2 of password reset: validates token, updates password
│   │   ├── booking.php
│   │   ├── get_bookings.php
│   │   ├── cancel_booking.php
│   │   └── update_avatar.php
│   └── Images/                     Game covers (jpg/png/webp/avif) + UI assets
│       └── Avatars/                13 selectable user avatars
│
└── Data/
    ├── .htaccess                   Denies all direct web access to this folder
    ├── schema.sql                  Full DB schema (all 5 tables), safe to re-run
    └── Three Frogs.xlsx            Offline reference spreadsheet for the game catalogue
```

---

## Architecture

### Authentication

Every page POSTs to `Assets/PHP/check_session.php` on load. It returns:

```json
{ "loggedIn": true, "user": { "name": "...", "email": "...", "avatar": "..." } }
```

The navbar is injected by `Navbar.js` after this response — HTML pages ship with only an empty `<ul id="navLinks"></ul>`. **Never add static `<li>` elements to HTML pages.**

### Session-gating

| Page | Behaviour when logged out |
|---|---|
| `index.html` | Shows 10 random games; prompts login for the full list |
| `Collection.html` | Redirects to `Login.html` |
| `Booking.html` | Hides the form; shows `#authPopup` |
| `Dashboard.html` | Redirects to `Login.html` |

Note the phrasing above: the form/dashboard content is **hidden by default** (`class="hidden"` in the HTML, alongside a `.loading-state` spinner shown in its place) and only revealed by JS once `check_session.php` confirms the right state — not shown-then-hidden reactively. See [Loading States](#loading-states) below.

### Loading States

| Where | What |
|---|---|
| Any async-submitting button | `Assets/JS/Loading.js`'s `setButtonLoading(button, text)` swaps in a spinner + disables the button; `clearButtonLoading(button)` restores it. Used by `Login.js`, `Signup.js`, `Booking.js`, `Dashboard.js`, `Forgot-password.js`. |
| `Booking.html` / `Dashboard.html` | Real content ships `class="hidden"`; a sibling `.loading-state` is visible by default. Revealed only once `check_session.php` resolves — prevents a flash of the real form/dashboard before the login gate kicks in. |
| `Collection.html` | `Boardgame.js` renders a `.loading-state` into `#boardgame-list` instead of the full unfiltered game array while the login check is pending — prevents an unauthenticated visitor from briefly seeing the entire ~218-game collection before the redirect fires. |
| Dashboard bookings list | `#upcomingBookings`/`#bookingHistory` show a `.loading-state` while `get_bookings.php` is in flight. |
| Navbar | `#navLinks` shows a single spinner `<li>` (JS-injected, not part of the HTML source) until `check_session.php` resolves. |

All loading UI reuses the existing `.spinner`/`.loading-state`/`.btn-loading` classes in `Boardgame.css` — no new colors or fonts.

### Legal Pages

`Terms-of-Use.html` and `Privacy-Policy.html` are linked from a `.footer-links` line in every page's footer (added right after the copyright notice). They reuse the `.about-section` card styling already used by `About.html` — no new content styling was introduced.

> **Not a substitute for legal advice.** The Terms of Use and Privacy Policy text was written to honestly describe what this Site actually does (the real fields collected at signup/booking, the real security measures documented under [Security Hardening](#security-hardening), the real booking/cancellation rules) rather than generic template text. It has **not** been reviewed by a lawyer, including against Indonesia's Personal Data Protection Law (UU PDP). Have it reviewed before treating it as your business's final legal terms — and if you change how the Site collects or handles data, update these pages to match, since letting them drift from reality is worse than not having them.

### Password Reset Flow

Two-step, token-based — no unauthenticated password changes:

1. User enters email → `request_reset.php` generates a 64-char random token, stores it in `password_reset_tokens` with a 1-hour expiry, and emails a link (`Forgot-password.html?token=...`).
2. User clicks the link → JS reads `?token=` from the URL and shows the "set new password" form → `forgot_password.php` validates the token, resets the password, and deletes the used token.

### Game Catalogue

All ~218 boardgame entries are a **hardcoded JavaScript array** in `Boardgame.js` — they are not stored in the database. `Boardgame.js` branches on `window.location.pathname` to run either the index (10 random games, shuffled with a spread copy) or the Collection (full A–Z grouping) logic.

To add a game: append an object to the `boardgames` array and drop the cover image in `Assets/Images/`.

```js
{
  name: "Game Name",
  category: "Strategy",       // must match a value in the Collection.html filter dropdown
  players: "2–4",
  duration: "60–120 min",
  image: "Assets/Images/Game Name.jpg",
  description: "...",
  tags: ["tag1", "tag2"]
}
```

**Resize new cover images to ~900px max dimension before adding them.** There's no build step or image pipeline here — whatever you commit is exactly what ships to visitors. See [Image Optimization](#image-optimization) below.

### Image Optimization

Every image in `Assets/Images/` was resized to a 900px max dimension and recompressed in place (same filenames/extensions, so no code changes were needed) — the folder went from ~96MB to ~24MB (~75% smaller) with no visible quality loss at actual display sizes. `Avatars/`, `favicon_io/`, and the `.avif` files were already small and were left untouched.

`ThreeFrogsPlace.jpg` (the homepage hero background, `background: url(...) cover` in `Boardgame.css`) is sized to 1920px wide instead of 900px, since it's displayed full-bleed across the page rather than as a small card — check for `background: url(` in the CSS before assuming every image is a card thumbnail if you ever bulk-process this folder again.

Both card-rendering templates in `Boardgame.js` also carry `loading="lazy" decoding="async"` on their `<img>` tags, so `Collection.html` (which renders all ~218 cards into the DOM at once) doesn't download every image up front — only the ones actually scrolled into view.

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR | Letters and spaces only |
| email | VARCHAR UNIQUE | Lowercased on insert |
| password | VARCHAR | bcrypt via `password_hash` |
| avatar | VARCHAR | Relative path, e.g. `Assets/Images/Avatars/Clam.jpg`; validated against a server-side whitelist |

### `bookings`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | Used to identify a booking when cancelling |
| name | VARCHAR | |
| email | VARCHAR | Always the logged-in user's email (taken from the session) |
| date | DATE | Must not be in the past |
| start_time | TIME | Must be ≥ 12:00 (and not already passed, if today) |
| end_time | TIME | Must be ≤ 22:00, after start_time |
| people | INT | 1–8 |
| status | VARCHAR | `'active'` |

**Booking rules** (constants at the top of `booking.php`, mirrored in `Booking.js`, `Booking.html`, and Terms of Use §4 — change them together):

- **4 tables**, one booking = one table, **max 8 people** per booking. A new booking is rejected only if all 4 tables are in use at *some moment* inside its window (back-to-back bookings don't count as overlapping).
- A user can't hold two overlapping bookings.
- Check + insert run under a MySQL lock, so simultaneous requests can't overbook the last table.
- A plain-text confirmation email is sent on success; the page only says "a confirmation has been sent" if it actually was.
- Everything uses Surabaya time (`Asia/Jakarta`, UTC+7) for both PHP and MySQL, whatever the server's own timezone.

### `cancellations`

| Column | Type | Notes |
|---|---|---|
| email | VARCHAR | |
| date | DATE | |
| start | TIME | |
| end | TIME | |
| cancel_time | DATETIME | Set to `NOW()` on insert |

Cancellations are capped at **2 per user per calendar month**, enforced in `cancel_booking.php` (and reported by `get_bookings.php`). A booking can only be cancelled before its start time.

### `password_reset_tokens`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| email | VARCHAR | |
| token | VARCHAR(64) UNIQUE | 64-char hex string from `random_bytes` |
| expires_at | DATETIME | 1 hour from creation; stale tokens are rejected and deleted |

Required for the forgot-password flow (created by `Data/schema.sql`).

### `rate_limits`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| action | VARCHAR(50) | e.g. `login_ip`, `login_email`, `signup_ip`, `reset_request_ip` |
| identifier | VARCHAR(255) | IP address or email being throttled |
| created_at | DATETIME | Set to `NOW()` on each recorded attempt |

Backs the brute-force/abuse throttling described below (created by `Data/schema.sql`). Rate limiting **fails open** — i.e. does nothing, not "locks everyone out" — if this table is missing.

> All five tables are defined in **`Data/schema.sql`**. It uses `CREATE TABLE IF NOT EXISTS` throughout, so it's safe to run on a database that already has some of them.

---

## PHP API Endpoints

All endpoints set `Content-Type: application/json`, `ini_set('display_errors', 0)`, and use a local `respond($status, $data)` helper that echoes JSON and exits. Session endpoints call `secure_session_start()` (never raw `session_start()`). Any uncaught database error is logged and returned as a generic JSON 500 by the handler in `db_connect.php`.

| Endpoint | Method | Auth required | Description |
|---|---|---|---|
| `check_session.php` | POST | — | Returns current session state |
| `login.php` | POST (form) | — | Validates credentials, sets `$_SESSION['user']` |
| `logout.php` | POST | — | Destroys session and clears cookie |
| `signup.php` | POST (form) | — | Creates user, validates avatar against whitelist, sets session; 409 if email taken |
| `request_reset.php` | POST (form) | — | Generates password-reset token and emails link; always returns 200 to prevent email enumeration |
| `forgot_password.php` | POST (form) | — | Validates token from DB, resets password, deletes token |
| `booking.php` | POST (JSON body) | Yes | Creates booking; enforces date/time rules, 4-table capacity, 8-person limit, no self-overlap; emails a confirmation |
| `get_bookings.php` | POST | Yes | Returns the user's upcoming + last-90-days bookings (with `id`) and remaining cancel count |
| `cancel_booking.php` | POST (JSON body: `id`) | Yes | Cancels the user's own not-yet-started booking; enforces the monthly limit |
| `update_avatar.php` | POST (form) | Yes | Updates avatar; validates against allowed set |

---

## Security Hardening

| Measure | Where |
|---|---|
| CSRF tokens on every state-changing request | `Assets/PHP/security.php` (`csrf_token()`/`verify_csrf_token()`); enforced in `login.php`, `signup.php`, `booking.php`, `cancel_booking.php`, `update_avatar.php` |
| Brute-force / abuse rate limiting | `security.php` (`rate_limit_exceeded()`/`record_attempt()` against the `rate_limits` table); applied to `login.php`, `signup.php`, `request_reset.php`, `forgot_password.php` |
| Hardened session cookies (`HttpOnly`, `Secure`, `SameSite=Lax`) | `security.php`'s `secure_session_start()` — used everywhere instead of raw `session_start()` |
| Session fixation prevention | `session_regenerate_id(true)` in `login.php` and `signup.php` after authentication |
| No internal error leakage | DB/statement errors are `error_log()`'d server-side, never echoed in JSON responses |
| Security headers, forced HTTPS, no directory listing | root `.htaccess` (CSP with `script-src 'self'` only — no third-party scripts, `X-Frame-Options`, HSTS, etc. — skips the HTTPS redirect when `HTTP_HOST` is `localhost`/`127.0.0.1`, with or without a port, for local dev) |
| Sensitive files blocked from direct web access | `.htaccess` denies `db_config.php`, `*.xlsx`/`*.sql`/`*.log`/`*.md`, `.git*`; `Data/.htaccess` denies the whole folder |
| Reverse-tabnabbing protection | `rel="noopener noreferrer"` on all `target="_blank"` links |

New state-changing endpoints should follow the same pattern: `require_once("security.php")`, call `secure_session_start()` instead of `session_start()`, and validate a CSRF token before doing anything.

### 404 page

`404.html` is served via `ErrorDocument 404 /404.html` in the root `.htaccess`. Two things make this work correctly:

1. **The project must be the server's document root** — not nested inside some other `htdocs` folder — since Apache resolves `/404.html` from the server/vhost root, not from wherever the missing URL happened to be. This is already what the [Local Setup](#local-setup) instructions above tell you to do.
2. **`404.html` has `<base href="/" />` in its `<head>`.** Apache serves the page's content under the visitor's original (bogus) URL without redirecting, so without a `<base>` tag every relative link/script/fetch on the page would resolve against that bogus path instead of the site root. Every other page in this project deliberately omits a `<base>` tag and uses plain relative paths — `404.html` is the one intentional exception.

---

## Design System

### CSS Custom Properties

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1a3c2e` | Navbar, headings, buttons, footer |
| `--color-accent` | `#c9a227` | Highlights, tags, borders, hover states |
| `--color-bg` | `#faf8f2` | Page background (warm cream) |
| `--color-surface` | `#ffffff` | Cards, form panels |
| `--color-surface-alt` | `#f3ede1` | Read-only inputs, card image backgrounds |
| `--color-text-muted` | `#6b7280` | Secondary text |
| `--navbar-height` | `68px` / `60px` mobile | Used for sticky offset calculations |
| `--alphabet-nav-w` | `48px` | Fixed side rail width on Collection page |
| `--page-padding-x` | `clamp(1rem, 4vw, 3rem)` | Horizontal gutter |

### Typography

- **Headings:** `Righteous` (Google Fonts)
- **Body:** `Poppins` (Google Fonts)

### Responsive Grid (game cards)

| Viewport | Columns |
|---|---|
| ≤ 360 px | 1 |
| 361–480 px | 2 |
| 481–768 px | 3 |
| 769–1024 px | 3 |
| 1025–1400 px | 4 |
| ≥ 1401 px | 5 |

---

## Key Conventions

- **Inputs stay at `font-size: 1rem`** — prevents iOS auto-zoom on focus. Don't override with sub-16 px values.
- **Touch targets use `min-height: 44px`** — maintain this on any new interactive element.
- **Hover effects use `@media (hover: hover)`** — so they only apply to pointer devices; touch devices get static details.
- **Fixed/sticky elements include `env(safe-area-inset-*)`** — for notch / Dynamic Island / home bar support.
- **`Collection.html` requires `<body class="page-collection">`** — CSS uses this to apply `padding-left` that clears the fixed alphabet nav.
- **Alphabet nav is desktop-only** — hidden via `display: none` below 769 px.

---

## Deployment

1. Upload changed files to Hostinger via FTP or the File Manager.
2. There is no build or compilation step — what's in the repo is what runs.
3. `Assets/PHP/db_config.php` must exist on the server with production credentials. It is gitignored and is **not** uploaded from the repo — create or edit it directly on the server.
