# Three Frogs Boardgame Café — Website

Website for **Three Frogs**, a boardgame café in Surabaya, Indonesia. Visitors can browse the game catalogue, create an account, and book table time.

**Live site:** [threefrogsboardgame.com](https://threefrogsboardgame.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript + jQuery (CDN) |
| Backend | PHP 8 with MySQLi (OOP style) |
| Database | MySQL (Hostinger) |
| Hosting | Hostinger shared hosting |
| Deployment | Manual file upload (no CI/CD) |

No build step, no bundler, no npm. Every page is a plain `.html` file.

---

## Local Setup

**Requirements:** PHP 8+, MySQL, a local server (XAMPP / Laragon / Herd).

1. Clone the repo and serve the project root from your local server's `htdocs` (or equivalent).
2. Create a MySQL database and import the schema (see below).
3. Copy `Assets/PHP/db_config.example.php` → `Assets/PHP/db_config.php` and fill in your local credentials. This file is gitignored and must never be committed.
4. Open `http://localhost/` in your browser.

> `db_config.php` is the single source of DB credentials. `db_connect.php` requires it at runtime — do not hardcode credentials anywhere else.

---

## File Structure

```
/
├── .gitignore                      Excludes db_config.php
├── index.html                      Home — 10 random games, login prompt for full list
├── Collection.html                 Full A–Z game catalogue (login-gated)
├── Booking.html                    Table booking form (login-gated)
├── Dashboard.html                  User account & booking history (login-gated)
├── Login.html
├── Signup.html
├── Forgot-password.html            Two-step password reset (email → token link → new password)
├── About.html
│
├── Assets/
│   ├── CSS/
│   │   └── Boardgame.css           Single shared stylesheet
│   ├── JS/
│   │   ├── Navbar.js               Shared navbar — injected dynamically on every page
│   │   ├── Boardgame.js            Game data array (~218 games) + index & collection page logic
│   │   ├── Booking.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Forgot-password.js
│   ├── PHP/
│   │   ├── db_config.php           GITIGNORED — holds DB credentials (copy from example)
│   │   ├── db_config.example.php   Credential template (safe to commit)
│   │   ├── db_connect.php          Opens MySQLi connection via db_config.php
│   │   ├── check_session.php       Returns { loggedIn, user } — called on every page load
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
| name | VARCHAR | |
| email | VARCHAR | |
| date | DATE | Must not be in the past |
| start_time | TIME | Must be ≥ 12:00 |
| end_time | TIME | Must be ≤ 22:00, after start_time |
| people | INT | |
| status | VARCHAR | `'active'` |

Overlap is checked server-side before every insert. Date and time rules are enforced both client- and server-side.

### `cancellations`

| Column | Type | Notes |
|---|---|---|
| email | VARCHAR | |
| date | DATE | |
| start | TIME | |
| end | TIME | |
| cancel_time | DATETIME | Set to `NOW()` on insert |

Cancellations are capped at **2 per user per calendar month**, enforced in both `get_bookings.php` and `cancel_booking.php`.

### `password_reset_tokens`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| email | VARCHAR | |
| token | VARCHAR(64) UNIQUE | 64-char hex string from `random_bytes` |
| expires_at | DATETIME | 1 hour from creation; stale tokens are rejected and deleted |

Create this table before the forgot-password flow will work:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(64)  NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  INDEX idx_token (token),
  INDEX idx_email (email)
);
```

---

## PHP API Endpoints

All endpoints set `Content-Type: application/json`, `ini_set('display_errors', 0)`, and use a local `respond($status, $data)` helper that echoes JSON and exits. Auth-gated endpoints call `session_start()`.

| Endpoint | Method | Auth required | Description |
|---|---|---|---|
| `check_session.php` | POST | — | Returns current session state |
| `login.php` | POST (form) | — | Validates credentials, sets `$_SESSION['user']` |
| `logout.php` | POST | — | Destroys session and clears cookie |
| `signup.php` | POST (form) | — | Creates user, validates avatar against whitelist, sets session; 409 if email taken |
| `request_reset.php` | POST (form) | — | Generates password-reset token and emails link; always returns 200 to prevent email enumeration |
| `forgot_password.php` | POST (form) | — | Validates token from DB, resets password, deletes token |
| `booking.php` | POST (JSON body) | Yes | Creates booking; enforces date/time rules and slot overlap |
| `get_bookings.php` | POST (JSON body) | Yes | Returns user's active upcoming bookings + remaining cancel count |
| `cancel_booking.php` | POST (JSON body) | Yes | Cancels booking; enforces monthly limit |
| `update_avatar.php` | POST (form) | Yes | Updates avatar; validates against allowed set |

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
