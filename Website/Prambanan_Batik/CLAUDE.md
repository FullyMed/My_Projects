# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prambanan Batik is a PHP/MySQL product catalog and review website for authentic Indonesian batik. No build step — plain PHP served by Apache/Nginx (XAMPP/WAMP locally, shared hosting in production).

## Local Development

1. Install XAMPP or WAMP and start Apache + MySQL.
2. Copy `.env.example` to `.env` and fill in credentials — or set `SetEnv` directives in Apache config. **Do not hard-code credentials in `config.php`.**
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

`footer.php` includes `<script src="<?php echo SITE_PATH; ?>/assets/js/main.js"></script>`. This is **required** — CSS sets `.reveal` and `.product-card` to `opacity: 0` by default; `main.js` applies the `is-visible` class via IntersectionObserver to make them appear. Never remove this script tag.

### Preview Mode

When `$db` is null or no products exist, pages fall back to hardcoded sample data from `get_sample_batik_products()` in `functions.php` and set `$_ENV['PREVIEW_MODE'] = true` before including `header.php`. `is_preview_mode()` checks both the `PREVIEW_MODE` constant and `$_ENV['PREVIEW_MODE']`, so the preview banner in `header.php` shows correctly when the DB is down at runtime.

### SEO Meta Tags — $page_title and $meta_description

Every public page sets `$page_title` and `$meta_description` **before** `include header.php`; `header.php` renders them into `<title><?php echo escape($page_title) . ' - ' . SITE_NAME; ?></title>` and `<meta name="description" content="...">`. If a page omits `$meta_description`, `header.php` falls back to `DEFAULT_META_DESCRIPTION` (defined in `config.php`) — so it's optional but should always be set on real content pages for unique, non-generic descriptions.

- `index.php` — static, hand-written copy.
- `products.php` — dynamic: resolves the `category` query param against `$categories_for_filter` and titles/describes the page after the active category, falling back to a generic "Batik Collection" description when no filter is applied. Set **after** `$categories_for_filter` is populated (order matters), right before the `header.php` include.
- `product.php` — dynamic: `$meta_description` is `truncate_text($product['description'], 155)` when the product has a description, else a templated fallback using the product name and category.
- `404.php` — static.

**Rule:** When adding a new public page, set both `$page_title` and `$meta_description` before including `header.php` — don't rely on the sitewide `DEFAULT_META_DESCRIPTION` fallback for real content pages.

### Legal Pages — terms.php and privacy.php

Static content pages using the same `header.php`/`footer.php` request flow as every other public page (no `$db`, no preview mode). Linked from `footer.php` in both the "Quick Links" list and a compact `.footer-legal-links` row next to the copyright line, and listed in `sitemap.php`.

`privacy.php`'s "Information We Collect" section is a factual description of what this codebase actually stores: review submissions (`reviews` table), outbound marketplace click logs (`outbound_clicks` — product, platform, IP, user agent, referrer, written by `go.php`), and the strictly-necessary session cookie set in `config.php`.

**Rule:** If a future change adds a new place personal data is collected or a new cookie/tracking mechanism, update `privacy.php`'s "Information We Collect" section in the same change — don't let the policy drift from what the code actually does.

Both pages use the `CONTACT_EMAIL` constant (`config.php`, env-overridable like `BASE_URL`) for their contact links — update the env var on deployment rather than editing the pages directly.

### Loading States — main.js is shared by public and admin pages

`assets/js/main.js` is loaded on every public page via `footer.php`, **and** is also included directly (`<script src="<?php echo SITE_PATH; ?>/assets/js/main.js"></script>`) at the bottom of every `admin/*.php` page, right before any page-specific inline `<script>` block there. Its public-only init functions (`initHeader`, `initScrollReveal`, `initProductCards`, `initSelectMenus`) all guard on selectors that don't exist in admin markup, so they no-op safely on admin pages.

Three behaviors live in `main.js`:
- `initImageLoading()` — adds `is-img-loading` to `.product-image` / `.product-image-section` containers (shimmer CSS) until their `<img>` fires `load`/`error`, then adds `img-loaded` to fade it in. Selector-driven — adding a new product image block needs no JS/PHP changes as long as it reuses one of those two container classes.
- `initFormLoadingStates()` — on every form's `submit` event, disables the submit button and adds `is-loading` (spinner via `::after`), deferred with `setTimeout(fn, 0)` so the browser has already captured the submitted button's value first. This is also why admin delete-confirm buttons (`onclick="return confirm(...)"`) get a spinner: `confirm()` runs first, and if cancelled, no `submit` event fires at all.
- `initNavProgressBar()` — a single fixed-position `.nav-progress-bar` div appended to `<body>`, animated toward (not to) 100% width on same-tab link clicks and form submits. Every navigation here is a full page reload (no SPA router), so the bar never needs to "complete" — the browser's own navigation replaces the document.

**Rule:** `.btn.is-loading` and `.nav-progress-bar` CSS are defined **twice** — once in `assets/css/styles.css` (public, `--color-*` vars) and once in `admin/admin.css` (admin, `--admin-*` vars) — because the two stylesheets don't share `:root` variables. `admin/login.php`'s `.btn-login` button doesn't use the shared `.btn` class, so it carries its own `.btn-login.is-loading` rule in its inline `<style>` block. When restyling buttons or the progress bar, update all three places.

Also: `products.php`'s category filter `<select>` submits via `form.requestSubmit()` (falling back to `.submit()`), not `.submit()` — `.submit()` does not fire a `submit` event, so without this the nav progress bar (and any future submit-driven logic) wouldn't trigger on category filtering.

### URL Construction — SITE_PATH and BASE_URL

Two constants handle all URL generation:

| Constant | Use case | Example (local) | Example (production root) |
|----------|----------|-----------------|--------------------------|
| `SITE_PATH` | HTML `href` / `src` attributes | `/Prambanan_Batik` | `` (empty string) |
| `BASE_URL` | PHP `header('Location: ...')` redirects | `http://localhost/Prambanan_Batik` | `https://yourdomain.com` |

`SITE_PATH` is derived automatically: `rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/')`. When the site is deployed at the domain root, `SITE_PATH` is an empty string so all `href="<?php echo SITE_PATH; ?>/page.php"` links stay correct without any code changes.

**Rule:** Every HTML `href`/`src` must be prefixed with `SITE_PATH`. Every PHP redirect must use `BASE_URL`. Never hardcode `/admin/...` or `/assets/...`.

Unlike other paths, `.htaccess`'s `ErrorDocument 404 <path>` is resolved from the server **DocumentRoot**, not this project's directory, and can't read the `SITE_PATH` PHP constant — it must be hand-kept in sync with `BASE_URL`'s path whenever the deployment path changes: `/Prambanan_Batik/404.php` for local XAMPP/WAMP dev, `/404.php` when deployed at the domain root in production.

### Admin Authentication

All admin pages include `admin/auth.php` at the top and call `requireAdminLogin()`, which redirects to `BASE_URL . '/admin/login.php'` if the session is invalid. Session state is stored under the key `product_hub_session` with a **30-minute idle timeout** (sliding window — refreshed on every authenticated request via `isAdminLoggedIn()`).

**Brute-force protection**: `admin/login.php` enforces a rate limit of **5 failed attempts per IP per 15 minutes**, tracked in the `login_attempts` table. Failed attempts are recorded via `recordFailedLoginAttempt()`; on success, attempts for that IP are cleared via `clearLoginAttempts()`. The constants `LOGIN_MAX_ATTEMPTS` (5) and `LOGIN_LOCKOUT_MINUTES` (15) are defined in `admin/auth.php`.

### CSRF Protection

All admin POST forms carry a hidden `csrf_token` field. Every POST handler must call `validateCsrfToken($_POST['csrf_token'] ?? '')` before processing any action — return an error and skip processing if it fails. Both helpers live in `admin/auth.php`:
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

### Key Files

| File | Purpose |
|------|---------|
| `config.php` | All constants (`BASE_URL`, `SITE_PATH`, `DB_*`, `ITEMS_PER_PAGE`, `SESSION_TIMEOUT`, `DEFAULT_META_DESCRIPTION`, `CONTACT_EMAIL`, etc.) — reads env vars first, then defaults. DB_PASSWORD default is `''` — set via env var. |
| `db_connect.php` | Creates and returns a PDO instance; returns `null` on failure |
| `functions.php` | Utility functions: `escape()`, `slugify()`, `format_currency()`, `get_pagination()`, `is_preview_mode()`, `truncate_text()` (mb-safe), `get_sample_batik_products()`, etc. |
| `header.php` / `footer.php` | Shared page chrome — renders `$page_title`/`$meta_description` into `<title>`/`<meta name="description">` (see SEO Meta Tags below); `footer.php` includes `main.js` |
| `assets/js/main.js` | Shared JS — scroll reveal, sticky header, avatar initials, category filter auto-submit, and the loading-state behaviors (`initImageLoading`, `initFormLoadingStates`, `initNavProgressBar` — see Loading States below). Loaded on every public page via `footer.php` **and** directly on every `admin/*.php` page. |
| `go.php` | Redirect handler — validates URL starts with `http(s)://`, logs click to `outbound_clicks`, then redirects |
| `sitemap.php` | Generates XML sitemap dynamically from DB; null-safe when `$pdo` is unavailable |
| `404.php` | Custom 404 page — styled like the rest of the site, sends a real `404` status via `http_response_code(404)`. Wired up in `.htaccess` via `ErrorDocument 404`. |
| `terms.php` / `privacy.php` | Static legal pages (see Legal Pages below) |
| `admin/auth.php` | Session management (`loginAdmin`, `requireAdminLogin`, `logoutAdmin`, `isAdminLoggedIn`) + CSRF helpers (`generateCsrfToken`, `validateCsrfToken`) + rate-limiting helpers (`isLoginRateLimited`, `recordFailedLoginAttempt`, `clearLoginAttempts`) |
| `admin/admins.php` | List, add, delete admins; change passwords; protects against self-deletion and deleting the last admin |
| `admin/import_products.php` | CSV bulk import — upserts products by SKU; CSRF-protected |
| `admin/categories.php` | Create, edit (via `?edit=<id>` GET param), and delete categories |
| `admin/review_edit.php` | Create / edit reviews — recalculates `rating_avg` / `rating_count` on save |
| `admin/reviews.php` | List / delete reviews — recalculates `rating_avg` / `rating_count` on delete |
| `admin/product_images.php` | Manage product image URLs — validates URL starts with `http(s)://` |

### Database Notes

- `products.rating_avg` and `products.rating_count` are **denormalized** — updated whenever reviews are created, edited, or deleted (not computed at query time). See the recalculation pattern above.
- Products are identified by `sku` (unique) for CSV upsert and by `slug` (unique) for URLs.
- All tables use `utf8mb4_unicode_ci` for full Unicode/emoji support.
- Prices are stored and displayed in **IDR (Indonesian Rupiah)**. Always use `format_currency()` which outputs `Rp X.XXX` — never use a dollar sign.
- The `login_attempts` table is used for brute-force protection on admin login. Rows older than 1 day are pruned automatically on each login attempt.

### URL Patterns

- `/products.php?category=<slug>` — filter by category slug (loaded dynamically from DB; falls back to hardcoded list in preview mode)
- `/product.php?id=<id>` — product detail with reviews
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
- When adding new admin pages: include `admin/auth.php`, call `requireAdminLogin()`, add CSRF token to every form, use `SITE_PATH` on all links, use `BASE_URL` on all PHP redirects, add the page to the sidebar nav in every admin page, and include `<script src="<?php echo SITE_PATH; ?>/assets/js/main.js"></script>` before `</body>` (before any page-specific inline `<script>`) so its submit buttons get the loading spinner and the nav progress bar fires.
- When adding review write operations: always recalculate `rating_avg` / `rating_count` using the pattern in `admin/review_edit.php`.
