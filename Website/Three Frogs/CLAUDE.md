# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Three Frogs is a static HTML + PHP website for a boardgame café in Surabaya, Indonesia. It lets visitors browse games, create accounts, and book table time.

**Live domain:** `threefrogsboardgame.com` (hosted on Hostinger)

## Stack

- **Frontend:** Vanilla HTML/CSS/JS + jQuery (CDN) — no build step, no bundler
- **Backend:** PHP with MySQLi (OOP style)
- **Database:** MySQL on Hostinger (`u181047418_threefrogs`)
- **Deployment:** Upload files directly to Hostinger; no CI/CD pipeline

There is no local dev server configuration in this repo. To test PHP endpoints locally you need a PHP + MySQL environment (XAMPP/Laragon/etc.) and update `db_connect.php` with local credentials.

## File Layout

| Path | Purpose |
|---|---|
| `*.html` | One file per page (index, Booking, Collection, Dashboard, Login, Signup, About, Forgot-password) |
| `Assets/CSS/Boardgame.css` | Single stylesheet shared across all pages |
| `Assets/JS/Navbar.js` | Shared navbar + hamburger toggle; included on every page |
| `Assets/JS/Boardgame.js` | Handles **both** `index.html` and `Collection.html` by branching on `window.location.pathname` |
| `Assets/JS/<Page>.js` | Per-page JS for Booking, Dashboard, Login, Signup, Forgot-password |
| `Assets/PHP/db_connect.php` | Shared DB connection; include with `require_once` |
| `Assets/PHP/*.php` | JSON API endpoints (all respond with `Content-Type: application/json`) |
| `Assets/Images/` | Game cover images (mixed formats: jpg/png/webp/avif) |
| `Data/Three Frogs.xlsx` | Offline reference spreadsheet for the game catalogue |

## Architecture

### Authentication flow

Every page calls `Assets/PHP/check_session.php` (GET or POST) before rendering auth-sensitive content. It returns `{ loggedIn: bool, user: { name, email, avatar } }`. The navbar is always injected by `Navbar.js` after this fetch; HTML pages ship with only a hamburger `<button>` and an empty `<ul id="navLinks"></ul>` — never static `<li>` items.

### Session-gating pattern

- `index.html` — shows 10 random games; prompts login for the full list
- `Collection.html` — redirects to `Login.html` if not logged in
- `Booking.html` — hides the form and shows `#authPopup` if not logged in
- `Dashboard.html` — redirects to `Login.html` if not logged in

### Database tables (inferred from PHP)

| Table | Key columns |
|---|---|
| `users` | id, name, email, password (bcrypt), avatar |
| `bookings` | name, email, date, start_time, end_time, people, status ('active') |
| `cancellations` | email, date, start, end, cancel_time |

Cancellations are capped at **2 per user per calendar month** (checked in both `get_bookings.php` and `cancel_booking.php`). Booking hours are enforced client- and server-side as **12:00–22:00**.

### Boardgame catalogue

All game data is a hardcoded JavaScript array in `Assets/JS/Boardgame.js` (not stored in the database). Adding a game means appending an object with `{ name, category, players, duration, image, description, tags[] }` to that array and placing the image in `Assets/Images/`.

### PHP endpoint conventions

- Every endpoint begins with `session_start()` and sets `Content-Type: application/json`
- All use `require_once("db_connect.php")`
- A local `respond($status, $data)` helper echoes JSON and calls `exit`
- Booking/cancellation endpoints accept JSON body (`php://input`); auth endpoints accept form POST
- Passwords use `password_hash` / `password_verify` (bcrypt)

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
- **Avatar values** — stored as relative file paths (e.g. `Assets/Images/Avatars/Clam.jpg`). The allowed set is validated server-side in `update_avatar.php`.
- **`[...]boardgames` shuffle** — index page uses `[...boardgames].sort(...)` (spread to avoid mutating the source array). Collection page re-sorts with `localeCompare`. Both branches read from the same module-level array.
