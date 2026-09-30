# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prambanan Batik is a PHP/MySQL product catalog and review website for authentic Indonesian batik. No build step — plain PHP served by Apache/Nginx (XAMPP/WAMP locally, shared hosting in production).

## Known Gaps / Next Steps

Check here first when starting a new session on this project. A full bug-fix pass on 2026-09-30 (README v2.10.0) closed the 2026-09-29 items (Open Graph tags, static-asset cache headers). It was verified against a real local DB with a 67-check scripted run of every admin/public flow, a DB-down run, an empty-catalog run, and browser checks. Still open:

- **`CONTACT_EMAIL` is still the placeholder default** (`hello@prambananbatik.com`) — the owner hasn't given a real address yet. Set it via the `CONTACT_EMAIL` env var / `.env` before production.
- **Seed/sample photos are stock images** — free Unsplash photos that genuinely show batik, chosen and checked visually on 2026-09-30 (the old Pexels URLs were unrelated photos plus one dead link). They're placeholders for the owner's real product photos. Avoid `plus.unsplash.com` (Unsplash+ is paid-license) if they're ever swapped for other stock images.
- **Production deploy**: set `BASE_URL` to the real domain (drives canonical/OG URLs, `robots.txt`, the sitemap) and switch `.htaccess`'s `ErrorDocument 404` to `/404.php` at the domain root.
- **Logout is a GET link** (`admin/logout.php`, linked twice on every admin page) — low-risk logout-CSRF, deliberately left alone. Converting it means a small POST form + CSRF check on every admin page.

## Local Development

1. Install XAMPP or WAMP and start Apache + MySQL.
2. Copy `.env.example` to `.env` and fill in credentials — or set `SetEnv` directives in Apache config. **Do not hard-code credentials in `config.php`.** `config.php` parses `.env` itself (no library) into `$_ENV`, and `config_env($key, $default)` resolves real env var → `.env` → default. It deliberately doesn't use `putenv()`, which isn't thread-safe under XAMPP's threaded Apache. `DB_PORT` is supported (default 3306).

**This PC's local setup (as of 2026-09-30):**
- `C:\XAMPP\htdocs\Prambanan_Batik` is a **directory junction** to this project folder. It used to be a stale June 6 *copy*, which is why `http://localhost/Prambanan_Batik/` was showing none of the September work; that copy is kept at `C:\XAMPP\htdocs\Prambanan_Batik.bak-2026-06-06`.
- The DB is **XAMPP MariaDB on port 3307** (the `MySQL80` Windows service owns 3306 and rejects `root` without a password). Database `prambanan_batik`, dedicated user `prambanan_dev`; credentials are in the gitignored `.env` (`DB_HOST=127.0.0.1`, `DB_PORT=3307`).
- A local-only test admin's credentials are in `.env` as `LOCAL_ADMIN_EMAIL` / `LOCAL_ADMIN_PASSWORD`.
- XAMPP's MariaDB and Apache may need starting (XAMPP Control Panel).
- XAMPP's `php.ini` hides `E_DEPRECATED`. For a strict check, run the built-in server with `-d error_reporting=-1`, and set `BASE_URL=http://localhost:<port>` as a real env var so links resolve at the root (a real env var overrides `.env`).
- `.claude/launch.json` attaches the preview to Apache on port 80. The old `php -S localhost:8091` config was broken: every link pointed at `/Prambanan_Batik/...`.
3. Create the database and run the schema:
   ```sql
   CREATE DATABASE prambanan_batik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   ```bash
   mysql -u root prambanan_batik < schema.sql
   mysql -u root prambanan_batik < seed.sql  # optional sample data
   ```
4. Access via `http://localhost/Prambanan_Batik/`.

To create the **first** admin user, the admin panel login is impossible until at least one account exists. Use a one-off PHP script or insert directly:

```php
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', '$hash');
```

Once the first account exists, additional admins can be managed through **Admin Panel → Admins** (`/admin/admins.php`).

Always use `password_hash()` / `password_verify()` (bcrypt, cost 12). Never use SHA2.

There is no test suite and no linter configured.

## Architecture

### Request Flow

Every public page follows the same pattern:
```
require config.php → require functions.php → $db = require db_connect.php → query DB → include header.php → HTML output → include footer.php
```

`db_connect.php` returns `$pdo` via `require` (not `include`), so callers do `$db = require __DIR__ . '/db_connect.php'`. When the DB is unavailable it returns `null` — pages must handle `$db === null`.

`footer.php` includes `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`. This is **required**: CSS sets `.reveal` and `.product-card` to `opacity: 0` by default, and `main.js` adds the `is-visible` class via IntersectionObserver to make them appear. Never remove this script tag. (`header.php` has a `<noscript><style>` override so content still shows with JS disabled.)

**Static asset URLs:** link the site's own CSS/JS with `asset_url('assets/...')` (`functions.php`). It returns `SITE_PATH` + path + `?v=<filemtime>`. `.htaccess` caches `.css`/`.js` for a year (`immutable`), so an un-versioned stylesheet/script link would serve stale files after a deploy. Admin pages link `admin/admin.css` and `main.js` the same way. Images/icons have no version and get 30 days.

### Preview Mode

Pages fall back to the hardcoded sample data in `get_sample_batik_products()` (`functions.php`) and set `$_ENV['PREVIEW_MODE'] = true` before including `header.php` **only** when:
- `$db` is null or a query throws, or
- the `products` table is completely empty (checked with `SELECT 1 FROM products LIMIT 1`).

`is_preview_mode()` checks both the `PREVIEW_MODE` constant and `$_ENV['PREVIEW_MODE']`, so the preview banner in `header.php` ("Preview Mode (no live product data)") shows when the DB is down at runtime.

A category with no products, or an out-of-range page, is **not** preview mode. `products.php` renders a `.empty-state` block instead. In preview mode, `products.php` applies the category filter to the sample data (`slugify($sample['category'])` equals the DB slugs).

`product.php` with an unknown `id` `require`s `404.php` and exits, giving a real 404 status. The exception is preview mode, where the 8 sample ids (1–8) resolve to sample products, because the preview cards link to them.

### SEO Meta Tags — $page_title and $meta_description

Every public page sets `$page_title` and `$meta_description` **before** `include header.php`; `header.php` renders them into `<title><?php echo escape($page_title) . ' - ' . SITE_NAME; ?></title>` and `<meta name="description" content="...">`. If a page omits `$meta_description`, `header.php` falls back to `DEFAULT_META_DESCRIPTION` (defined in `config.php`) — so it's optional but should always be set on real content pages for unique, non-generic descriptions.

- `index.php` — static, hand-written copy.
- `products.php` — dynamic: resolves the `category` query param against `$categories_for_filter` and titles/describes the page after the active category, falling back to a generic "Batik Collection" description when no filter is applied. Set **after** `$categories_for_filter` is populated (order matters), right before the `header.php` include.
- `product.php` — dynamic: `$meta_description` is `truncate_text($product['description'], 155)` when the product has a description, else a templated fallback using the product name and category.
- `404.php` — static.

**Rule:** When adding a new public page, set both `$page_title` and `$meta_description` before including `header.php` — don't rely on the sitewide `DEFAULT_META_DESCRIPTION` fallback for real content pages.

### Social Previews — Open Graph / Twitter Card / canonical

`header.php` reuses the same title/description for `og:title`/`og:description`/`twitter:*` and also reads three optional page variables (all set before `include header.php`):

- `$canonical_url` — absolute URL, built from `BASE_URL`. When set, `header.php` emits `<link rel="canonical">` + `og:url`. It's set on every indexable page: index, products (keeps only a recognised `category` and `page` > 1), product, terms, privacy. `404.php` deliberately has none.
- `$og_image` — defaults to `SITE_PATH . '/assets/images/og-image.png'`. `product.php` sets it to the product's own image URL when it has one. It's passed through `absolute_url()` because crawlers need absolute URLs.
- `$og_type` — defaults to `website`; `product.php` sets `product`.

`assets/images/og-image.png` (1200×630) is rendered from `assets/images/og-image-source.html` with headless Edge. The exact command is in the comment at the top of that file; re-run it after editing the HTML. It uses the same palette + kawung motif as the favicon.

**Rule:** New public content pages set `$canonical_url = BASE_URL . '/page.php';` alongside `$page_title`/`$meta_description`.

### Product Images — placeholder + dead-link fallback

Always render product images with `product_image_url($url)` (returns the local `assets/images/product-placeholder.svg` when the URL is empty) plus `data-fallback="<?php echo SITE_PATH; ?>/assets/images/product-placeholder.svg"`. `initImageLoading()` in `main.js` swaps to `data-fallback` once if the external URL fails to load, so a dead image host shows the placeholder instead of a broken-image icon.

The first image by `ORDER BY sort_order, id` is the product's main photo; its `alt_text` is used on the detail page when set.

### Favicon Set — assets/favicon/

The site icon is a simple four-petal "flower" motif (a simplified batik kawung pattern) in the site's own palette — espresso background (`#2a1a0e`), copper-gold petals (`#c4872c`), pale-gold center dot (`#e8c47a`). **`assets/favicon/favicon.svg` is the canonical, hand-authored source** — it's plain SVG (4 `<ellipse>`s rotated 0/90/180/270 around a center `<circle>`), so it can be edited directly in any text or vector editor. Every raster file in that folder (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`) is an exported copy of the same design — if you change the SVG, regenerate these from it (e.g. re-export at each size from a vector tool; no build tooling is committed to this repo for it). `safari-pinned-tab.svg` is a monochrome (black-on-transparent) copy of the same shapes, used as-is by Safari's `mask-icon` (the browser recolors it using the `color` attribute on the `<link>` tag, so its own fill color doesn't matter).

`header.php` links the full set (SVG first, then ICO/PNG fallbacks, `apple-touch-icon`, `mask-icon`, and `site.webmanifest` + a `theme-color` meta tag) for every public page. Every `admin/*.php` page (each has its own standalone `<head>`, not `header.php`) links a lighter subset — just the SVG, ICO, and `apple-touch-icon` — since the admin panel doesn't need PWA manifest/mask-icon treatment (it's `Disallow`'d in `robots.txt` anyway). There's also a plain copy of `favicon.ico` at the project root, purely as a fallback for browsers that ignore `<link>` tags and request `/favicon.ico` directly — only effective when deployed at the domain root, same caveat as the `404.php` `ErrorDocument` path.

**Rule:** When adding a new admin page, copy the same 3-line favicon `<link>` block (SVG, ICO, apple-touch-icon) used in the other `admin/*.php` heads.

### Legal Pages — terms.php and privacy.php

Static content pages using the same `header.php`/`footer.php` request flow as every other public page (no `$db`, no preview mode). Linked from `footer.php` in both the "Quick Links" list and a compact `.footer-legal-links` row next to the copyright line, and listed in `sitemap.php`.

`privacy.php`'s "Information We Collect" section is a factual description of what this codebase actually stores:
- customer reviews (`reviews` table). These are **entered by staff in the admin panel — there is no public review form**, and the policy says so.
- outbound marketplace click logs (`outbound_clicks`: product, platform, IP, user agent, referrer; written by `go.php`).
- the strictly-necessary session cookie set in `config.php`.
- third-party requests to Google Fonts and external image hosts.

Both pages show a hard-coded "Last updated" month. Bump it when the policy text changes; don't use `date()`, which made it always show the current month.

**Rule:** If a future change adds a new place personal data is collected or a new cookie/tracking mechanism, update `privacy.php`'s "Information We Collect" section in the same change — don't let the policy drift from what the code actually does.

Both pages use the `CONTACT_EMAIL` constant (`config.php`, env-overridable like `BASE_URL`) for their contact links — update the env var on deployment rather than editing the pages directly.

### Loading States — main.js is shared by public and admin pages

`assets/js/main.js` is loaded on every public page via `footer.php`, **and** is also included directly (`<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`) at the bottom of every `admin/*.php` page, right before any page-specific inline `<script>` block there. Its public-only init functions (`initHeader`, `initScrollReveal`, `initProductCards`, `initSelectMenus`) all guard on selectors that don't exist in admin markup, so they no-op safely on admin pages.

Three behaviors live in `main.js`:
- `initImageLoading()` — adds `is-img-loading` to `.product-image` / `.product-image-section` containers (shimmer CSS) until their `<img>` fires `load`/`error`, then adds `img-loaded` to fade it in. On `error` it first swaps to the img's `data-fallback` URL (once — see Product Images above). Selector-driven — adding a new product image block needs no JS changes as long as it reuses one of those two container classes and carries `data-fallback`.
- `initFormLoadingStates()` — on every form's `submit` event, disables the submit button and adds `is-loading` (spinner via `::after`), deferred with `setTimeout(fn, 0)` so the browser has already captured the submitted button's value first. This is also why admin delete-confirm buttons (`onclick="return confirm(...)"`) get a spinner: `confirm()` runs first, and if cancelled, no `submit` event fires at all. On a back/forward-cache restore (`pageshow` with `persisted`), `initNavProgressBar` re-enables any `.is-loading` buttons so the restored page isn't stuck.
- `initNavProgressBar()` — a single fixed-position `.nav-progress-bar` div appended to `<body>`, animated toward (not to) 100% width on same-tab link clicks and form submits. Every navigation here is a full page reload (no SPA router), so the bar never needs to "complete" — the browser's own navigation replaces the document.

**Rule:** `.btn.is-loading` and `.nav-progress-bar` CSS are defined **twice** — once in `assets/css/styles.css` (public, `--color-*` vars) and once in `admin/admin.css` (admin, `--admin-*` vars) — because the two stylesheets don't share `:root` variables. `admin/login.php`'s `.btn-login` button doesn't use the shared `.btn` class, so it carries its own `.btn-login.is-loading` rule in its inline `<style>` block. When restyling buttons or the progress bar, update all three places.

Also: `products.php`'s category filter `<select>` is auto-submitted **only** by `initSelectMenus()` in `main.js`, via `form.requestSubmit()` (falling back to `.submit()`). `.submit()` does not fire a `submit` event, so the nav progress bar wouldn't trigger. There used to be an inline `onchange="this.form.submit()"` as well, which double-submitted; it's gone, and a `<noscript>` Filter button covers no-JS visitors.

### URL Construction — SITE_PATH and BASE_URL

Two constants handle all URL generation:

| Constant | Use case | Example (local) | Example (production root) |
|----------|----------|-----------------|--------------------------|
| `SITE_PATH` | HTML `href` / `src` attributes | `/Prambanan_Batik` | `` (empty string) |
| `BASE_URL` | PHP `header('Location: ...')` redirects | `http://localhost/Prambanan_Batik` | `https://yourdomain.com` |

`SITE_PATH` is derived automatically: `rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/')`. When the site is deployed at the domain root, `SITE_PATH` is an empty string so all `href="<?php echo SITE_PATH; ?>/page.php"` links stay correct without any code changes.

**Rule:** Every HTML `href`/`src` must be prefixed with `SITE_PATH`. Every PHP redirect must use `BASE_URL`. Never hardcode `/admin/...` or `/assets/...`.

Unlike other paths, `.htaccess`'s `ErrorDocument 404 <path>` is resolved from the server **DocumentRoot**, not this project's directory, and can't read the `SITE_PATH` PHP constant — it must be hand-kept in sync with `BASE_URL`'s path whenever the deployment path changes: `/Prambanan_Batik/404.php` for local XAMPP/WAMP dev, `/404.php` when deployed at the domain root in production.

`robots.txt` is **not** a static file. `.htaccess` rewrites `robots.txt` → `robots.php`, which builds the `Disallow` paths (`/admin/`, `/go.php`) from `SITE_PATH` and the `Sitemap:` line from `BASE_URL`. The old static file pointed at `example.com`. Crawlers only read it at the domain root. On PHP's built-in server (no `.htaccess`) request `/robots.php` directly.

Use `absolute_url()` (`functions.php`) when an absolute URL is needed from a `SITE_PATH`-relative one; it prefixes `BASE_URL`'s origin.

### Admin Authentication

Every admin page starts with the same block:

```php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireDatabase($pdo);
requireAdminLogin($pdo);
```

- `requireDatabase($pdo)` renders a small 503 "can't reach the database" page and exits when `$pdo` is null. Admin pages call `$pdo->prepare()` unguarded, and on PHP 8 that's an uncaught `Error`, not an `Exception`. `login.php` calls it too.
- `requireAdminLogin($pdo)` redirects to `BASE_URL . '/admin/login.php'` if the session is invalid. When given `$pdo`, it also re-checks that `admin_users` still has the signed-in id, and refreshes the email. That signs out a deleted admin on their next request.

Session state lives under the key `product_hub_session`, with a **30-minute idle timeout** (sliding window, refreshed on every authenticated request via `isAdminLoggedIn()`). On timeout, `isAdminLoggedIn()` unsets the admin keys and regenerates the session id rather than calling `session_destroy()`. A destroyed session would drop the CSRF token that `login.php` generates right afterwards, so the first login attempt after a timeout always failed.

`auth.php` also sends `X-Robots-Tag: noindex, nofollow` on every admin response.

Read POST fields with `post_string($key, $trim = true)` (`functions.php`), not `trim($_POST[...])`. It returns `''` for missing fields *and* for crafted array input (`name[]=x`), which would otherwise make `trim()`/`strlen()` throw a `TypeError` on PHP 8. Pass `$trim = false` for passwords. Read GET ids with `get_query_param('id', 0, FILTER_VALIDATE_INT)`.

**Brute-force protection**: `admin/login.php` enforces a rate limit of **5 failed attempts per IP per 15 minutes**, tracked in the `login_attempts` table. Failed attempts are recorded via `recordFailedLoginAttempt()`; on success, attempts for that IP are cleared via `clearLoginAttempts()`. The constants `LOGIN_MAX_ATTEMPTS` (5) and `LOGIN_LOCKOUT_MINUTES` (15) are defined in `admin/auth.php`.

### CSRF Protection

All admin POST forms carry a hidden `csrf_token` field. That includes the **login form**, which answers an invalid token with "Your session expired. Please try again." Every POST handler must call `validateCsrfToken($_POST['csrf_token'] ?? '')` before processing any action — return an error and skip processing if it fails. Both helpers live in `admin/auth.php`:
- `generateCsrfToken()` — call in the form to output the token value
- `validateCsrfToken($token)` — call at the top of every POST handler; uses `hash_equals()` for timing-safe comparison

### Denormalized Rating Fields

`products.rating_avg` and `products.rating_count` are denormalized. They must be recalculated any time a review is **created, updated, or deleted**. The recalculation query pattern used in `admin/review_edit.php` and `admin/reviews.php`:

```sql
UPDATE products SET
    rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = products.id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id)
WHERE id = ?
```

For deletes, fetch the `product_id` from the review **before** deleting, then run the update after.

When an edit **moves a review to a different product**, recalculate both the new and the old product. `review_edit.php` does this inside a transaction via its `recalculateProductRating()` helper. `seed.sql` ends with the same UPDATE, so seeded ratings match the reviews actually inserted; it used to hard-code fake aggregates like 342 reviews.

### Key Files

| File | Purpose |
|------|---------|
| `config.php` | Loads `.env` into `$_ENV`, defines `config_env()`, then all constants (`BASE_URL`, `SITE_PATH`, `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`, `ITEMS_PER_PAGE`, `SESSION_TIMEOUT`, `DEFAULT_META_DESCRIPTION`, `CONTACT_EMAIL`, etc.) — real env var → `.env` → default. DB_PASSWORD default is `''`. |
| `db_connect.php` | Creates and returns a PDO instance (DSN includes `port=DB_PORT`); returns `null` on failure |
| `functions.php` | Utility functions: `escape()` (null-safe), `slugify()`, `format_currency()`, `get_pagination()`, `is_preview_mode()`, `truncate_text()` (mb-safe), `review_count_label()` ("1 review"/"2 reviews"), `asset_url()`, `absolute_url()`, `product_image_url()`, `post_string()`, `get_sample_batik_products()`, etc. |
| `header.php` / `footer.php` | Shared page chrome — renders `$page_title`/`$meta_description` into `<title>`/`<meta name="description">` plus canonical/Open Graph/Twitter tags (see SEO Meta Tags + Social Previews); `footer.php` includes `main.js` |
| `robots.php` | Generates `robots.txt` (served via `.htaccess` rewrite) from `SITE_PATH`/`BASE_URL` |
| `assets/images/` | `og-image.png` + `og-image-source.html` (social preview), `product-placeholder.svg` (missing/dead product image) |
| `assets/js/main.js` | Shared JS — scroll reveal, sticky header, avatar initials, category filter auto-submit, and the loading-state behaviors (`initImageLoading`, `initFormLoadingStates`, `initNavProgressBar` — see Loading States below). Loaded on every public page via `footer.php` **and** directly on every `admin/*.php` page. |
| `go.php` | Redirect handler — validates URL starts with `http(s)://`, logs click to `outbound_clicks`, then redirects |
| `sitemap.php` | Generates XML sitemap dynamically from DB; null-safe when `$pdo` is unavailable |
| `404.php` | Custom 404 page — styled like the rest of the site, sends a real `404` status via `http_response_code(404)`. Wired up in `.htaccess` via `ErrorDocument 404`. |
| `terms.php` / `privacy.php` | Static legal pages (see Legal Pages below) |
| `admin/auth.php` | Session management (`loginAdmin`, `requireAdminLogin($pdo)`, `requireDatabase($pdo)`, `logoutAdmin`, `isAdminLoggedIn`) + CSRF helpers (`generateCsrfToken`, `validateCsrfToken`) + rate-limiting helpers (`isLoginRateLimited`, `recordFailedLoginAttempt`, `clearLoginAttempts`) |
| `admin/admins.php` | List, add, delete admins; change passwords; protects against self-deletion and deleting the last admin; 8–72 byte passwords (bcrypt ignores bytes past 72); the delete `confirm()` message is built with `json_encode` + `htmlspecialchars` (a plain `htmlspecialchars` inside a JS string was an XSS with emails containing `'`) |
| `admin/import_products.php` | CSV bulk import. Upserts by SKU with one transaction per row. Strips a UTF-8 BOM and lower-cases headers. Reports rows whose column count doesn't match the header (skipped, instead of `array_combine` failing). Rejects `350.000`-style prices and unknown `category_id`s. Gives duplicate names unique slugs via `uniqueProductSlug()`. Doesn't re-insert an `image_url` the product already has. `fgetcsv` runs with no line-length limit. CSRF-protected. |
| `admin/product_edit.php` | Create / edit product. Posted values live in `$form`, so the form keeps what was typed after a validation error. Blank slug = slugified name. Checks price range, category existence and duplicate SKU/slug up front with specific messages. Create redirects to `?id=<new>&created=1`. |
| `admin/categories.php` | Create, edit (via `?edit=<id>` GET param), and delete categories. Slugs pass through `slugify()` (blank = from the name). Delete reports how many products became uncategorized (the FK sets them to NULL, and public pages hide the empty category tag/breadcrumb). |
| `admin/review_edit.php` | Create / edit reviews. Recalculates `rating_avg` / `rating_count` on save, for both products if a review is moved. Validates reviewer email and that the product exists. |
| `admin/reviews.php` | List / delete reviews — recalculates `rating_avg` / `rating_count` on delete |
| `admin/product_images.php` | Manage product image URLs (must start with `http(s)://`, max 500 chars). Deletes are scoped `WHERE id = ? AND product_id = ?`. Bumps `products.updated_at` so the sitemap `lastmod` follows. |

### Database Notes

- `products.rating_avg` and `products.rating_count` are **denormalized** — updated whenever reviews are created, edited, or deleted (not computed at query time). See the recalculation pattern above.
- Products are identified by `sku` (unique) for CSV upsert and by `slug` (unique) for URLs.
- All tables use `utf8mb4_unicode_ci` for full Unicode/emoji support.
- Prices are stored and displayed in **IDR (Indonesian Rupiah)**. Always use `format_currency()` which outputs `Rp X.XXX` — never use a dollar sign.
- The `login_attempts` table is used for brute-force protection on admin login. Rows older than 1 day are pruned automatically on each login attempt.

### URL Patterns

- `/products.php?category=<slug>` — filter by category slug (loaded dynamically from DB; the hardcoded list is used **only** in preview mode, not when the DB simply has no categories)
- `/product.php?id=<id>` — product detail with reviews; unknown id → 404, non-integer/missing id → redirect to `/products.php`
- `/robots.txt` — generated by `robots.php`
- `/go.php?id=<product_id>&platform=<shopee|tokopedia|other>` — tracked redirect
- `/terms.php`, `/privacy.php` — legal pages
- `/admin/admins.php` — admin user management

### Security Patterns to Follow

- All DB queries must use PDO prepared statements — no string interpolation in SQL.
- All output must be passed through `escape()` (htmlspecialchars ENT_QUOTES UTF-8).
- Every admin POST handler must call `validateCsrfToken()` first.
- Any redirect target from DB or user input must be validated (e.g., `preg_match('/^https?:\/\//')`) before issuing a `Location:` header.
- Image/file URLs submitted by admins must be validated with `preg_match('/^https?:\/\//')` before saving.
- File uploads: validate with `finfo` MIME type + extension allow-list via `is_valid_image_upload()`.
- When adding new admin pages:
  - Start with the standard include block (config, functions, db_connect, auth, then `requireDatabase($pdo); requireAdminLogin($pdo);`; see Admin Authentication).
  - Add a CSRF token to every form, and read POST fields with `post_string()`.
  - Use `SITE_PATH` on all links and `BASE_URL` on all PHP redirects.
  - Add the page to the sidebar nav in every admin page.
  - Link `asset_url('admin/admin.css')` in the `<head>` and copy the 3-line favicon `<link>` block (see Favicon Set).
  - Include `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>` before `</body>`, before any page-specific inline `<script>`, so submit buttons get the loading spinner and the nav progress bar fires.
- A value going into an inline JS handler (`onclick="…"`) must be encoded as `htmlspecialchars(json_encode($value), ENT_QUOTES, 'UTF-8')`. `htmlspecialchars` alone isn't enough: the browser decodes entities before running the JS.
- Validate lengths against the column sizes (`VARCHAR(255)`/`(500)`) before inserting. Local XAMPP MariaDB runs in non-strict mode and silently truncates, but a strict-mode production MySQL rejects the insert.
- When adding review write operations: always recalculate `rating_avg` / `rating_count` using the pattern in `admin/review_edit.php`.
