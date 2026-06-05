# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prambanan Batik is a PHP/MySQL product catalog and review website for authentic Indonesian batik. No build step — plain PHP served by Apache/Nginx (XAMPP/WAMP locally, shared hosting in production).

## Local Development

1. Install XAMPP or WAMP and start Apache + MySQL.
2. Create the database and run the schema:
   ```sql
   CREATE DATABASE product_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   -- Then in phpMyAdmin or CLI:
   mysql -u root product_catalog < schema.sql
   mysql -u root product_catalog < seed.sql  -- optional sample data
   ```
3. Update `config.php` (or set env vars in `.env`) with local DB credentials.
4. Access via `http://localhost/Prambanan_Batik/`.

To create an admin user:
```php
// In a one-off script or phpMyAdmin:
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', $hash);
```
> Note: `README.md` references SHA2-256 for passwords — the actual code (`admin/auth.php`) uses `password_hash()` with bcrypt. Always use `password_hash()`/`password_verify()`.

There is no test suite and no linter configured.

## Architecture

### Request Flow

Every public page follows the same pattern:
```
require config.php → require functions.php → $db = require db_connect.php → query DB → include header.php → HTML output → include footer.php
```

`db_connect.php` returns `$pdo` via `require` (not `include`), so callers do `$db = require __DIR__ . '/db_connect.php'`. When the DB is unavailable it returns `null` — pages must handle `$db === null`.

### Preview Mode

When `$db` is null or no products exist, pages fall back to hardcoded sample data from `get_sample_batik_products()` in `functions.php`. This lets the site render without a database during development.

### Admin Authentication

All admin pages include `admin/auth.php` at the top and call `requireAdminLogin()`, which redirects to `/admin/login.php` if the session is invalid. Session state is stored under the key `product_hub_session` with a 30-minute timeout.

### Key Files

| File | Purpose |
|------|---------|
| `config.php` | All constants (`BASE_URL`, `DB_*`, `ITEMS_PER_PAGE`, etc.) — reads env vars first, then defaults |
| `db_connect.php` | Creates and returns a PDO instance; returns `null` on failure |
| `functions.php` | Utility functions: `escape()`, `slugify()`, `format_currency()`, `get_pagination()`, `get_sample_batik_products()`, etc. |
| `header.php` / `footer.php` | Shared page chrome included by every page |
| `go.php` | Redirect handler — logs click to `outbound_clicks` table then redirects to Shopee/Tokopedia/other affiliate link |
| `sitemap.php` | Generates XML sitemap dynamically from DB |
| `admin/auth.php` | Session management functions (`loginAdmin`, `requireAdminLogin`, `logoutAdmin`) |
| `admin/import_products.php` | CSV bulk import — upserts products by SKU |

### Database Notes

- `products.rating_avg` and `products.rating_count` are **denormalized** — updated whenever reviews are created or edited (not computed at query time).
- Products are identified by `sku` (unique) for CSV upsert and by `slug` (unique) for URLs.
- All tables use `utf8mb4_unicode_ci` for full Unicode/emoji support.

### URL Patterns

- `/products.php?category=<slug>` — filter by category slug
- `/product.php?id=<id>` — product detail with reviews
- `/go.php?id=<product_id>&platform=<shopee|tokopedia|other>` — tracked redirect
