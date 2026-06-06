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

### URL Construction — SITE_PATH and BASE_URL

Two constants handle all URL generation:

| Constant | Use case | Example (local) | Example (production root) |
|----------|----------|-----------------|--------------------------|
| `SITE_PATH` | HTML `href` / `src` attributes | `/Prambanan_Batik` | `` (empty string) |
| `BASE_URL` | PHP `header('Location: ...')` redirects | `http://localhost/Prambanan_Batik` | `https://yourdomain.com` |

`SITE_PATH` is derived automatically: `rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/')`. When the site is deployed at the domain root, `SITE_PATH` is an empty string so all `href="<?php echo SITE_PATH; ?>/page.php"` links stay correct without any code changes.

**Rule:** Every HTML `href`/`src` must be prefixed with `SITE_PATH`. Every PHP redirect must use `BASE_URL`. Never hardcode `/admin/...` or `/assets/...`.

### Admin Authentication

All admin pages include `admin/auth.php` at the top and call `requireAdminLogin()`, which redirects to `BASE_URL . '/admin/login.php'` if the session is invalid. Session state is stored under the key `product_hub_session` with a **30-minute idle timeout** (sliding window — refreshed on every authenticated request via `isAdminLoggedIn()`).

### CSRF Protection

All admin POST forms carry a hidden `csrf_token` field. Every POST handler must call `validateCsrfToken($_POST['csrf_token'] ?? '')` before processing any action — return an error and skip processing if it fails. Both helpers live in `admin/auth.php`:
- `generateCsrfToken()` — call in the form to output the token value
- `validateCsrfToken($token)` — call at the top of every POST handler; uses `hash_equals()` for timing-safe comparison

### Key Files

| File | Purpose |
|------|---------|
| `config.php` | All constants (`BASE_URL`, `SITE_PATH`, `DB_*`, `ITEMS_PER_PAGE`, `SESSION_TIMEOUT`, etc.) — reads env vars first, then defaults |
| `db_connect.php` | Creates and returns a PDO instance; returns `null` on failure |
| `functions.php` | Utility functions: `escape()`, `slugify()`, `format_currency()`, `get_pagination()`, `is_preview_mode()`, `truncate_text()` (mb-safe), `get_sample_batik_products()`, etc. |
| `header.php` / `footer.php` | Shared page chrome — `footer.php` includes `main.js` |
| `go.php` | Redirect handler — validates URL starts with `http(s)://`, logs click to `outbound_clicks`, then redirects |
| `sitemap.php` | Generates XML sitemap dynamically from DB; null-safe when `$pdo` is unavailable |
| `admin/auth.php` | Session management (`loginAdmin`, `requireAdminLogin`, `logoutAdmin`, `isAdminLoggedIn`) + CSRF helpers (`generateCsrfToken`, `validateCsrfToken`) |
| `admin/admins.php` | List, add, delete admins; change passwords; protects against self-deletion and deleting the last admin |
| `admin/import_products.php` | CSV bulk import — upserts products by SKU |
| `admin/categories.php` | Create, edit (via `?edit=<id>` GET param), and delete categories |

### Database Notes

- `products.rating_avg` and `products.rating_count` are **denormalized** — updated whenever reviews are created or edited (not computed at query time).
- Products are identified by `sku` (unique) for CSV upsert and by `slug` (unique) for URLs.
- All tables use `utf8mb4_unicode_ci` for full Unicode/emoji support.
- Prices are stored and displayed in **IDR (Indonesian Rupiah)**. Always use `format_currency()` which outputs `Rp X.XXX` — never use a dollar sign.

### URL Patterns

- `/products.php?category=<slug>` — filter by category slug (loaded dynamically from DB; falls back to hardcoded list in preview mode)
- `/product.php?id=<id>` — product detail with reviews
- `/go.php?id=<product_id>&platform=<shopee|tokopedia|other>` — tracked redirect
- `/admin/admins.php` — admin user management

### Security Patterns to Follow

- All DB queries must use PDO prepared statements — no string interpolation in SQL.
- All output must be passed through `escape()` (htmlspecialchars ENT_QUOTES UTF-8).
- Every admin POST handler must call `validateCsrfToken()` first.
- Any redirect target from DB or user input must be validated (e.g., `preg_match('/^https?:\/\//')`) before issuing a `Location:` header.
- File uploads: validate with `finfo` MIME type + extension allow-list via `is_valid_image_upload()`.
- When adding new admin pages: include `admin/auth.php`, call `requireAdminLogin()`, add CSRF token to every form, use `SITE_PATH` on all links, use `BASE_URL` on all PHP redirects, and add the page to the sidebar nav in every admin page.
