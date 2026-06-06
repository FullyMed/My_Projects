# Prambanan Batik - Product Catalog & Review System

A product catalog showcasing authentic Indonesian batik with an admin management panel and customer reviews, built with PHP and MySQL.

## Features

- **Product Management**: Browse and filter batik products by category
- **Customer Reviews**: View product reviews with star ratings
- **Admin Panel**: Secure authentication to manage products, categories, reviews, images, and admin users
- **Admin Dashboard**: At-a-glance stats (product count, categories, reviews, outbound clicks) with recent review feed
- **CSV Import**: Bulk import products with upsert by SKU
- **Responsive Design**: Mobile-friendly interface with warm batik-inspired styling, scroll-reveal animations
- **SEO Optimized**: XML sitemap and robots.txt for search engines
- **Outbound Click Tracking**: Analytics for affiliate/shop links (Shopee, Tokopedia, etc.)
- **Preview Mode**: Sample data shown automatically when the database is unavailable
- **Brute-Force Protection**: Admin login locks out an IP after 5 failed attempts within 15 minutes

## Technology Stack

- **Backend**: PHP 7.4+ with PDO
- **Database**: MySQL 8.0+ with utf8mb4 charset
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no build step)
- **Hosting**: Compatible with shared hosting (XAMPP/WAMP locally, Apache/Nginx in production)

## Prerequisites

- PHP 7.4 or higher
- MySQL 8.0 or higher
- PDO and `finfo` PHP extensions
- Apache or Nginx web server

## Local Development

1. Install XAMPP or WAMP and start Apache + MySQL.
2. Clone/copy the project into your web root (e.g. `htdocs/Prambanan_Batik`).
3. Copy `.env.example` to `.env` and fill in your credentials — **or** set environment variables directly in your Apache config (`SetEnv DB_PASSWORD yourpassword`).
4. Create the database and run the schema:
   ```sql
   CREATE DATABASE prambanan_batik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   Then in phpMyAdmin or CLI:
   ```bash
   mysql -u root prambanan_batik < schema.sql
   mysql -u root prambanan_batik < seed.sql   # optional sample data
   ```
5. Access via `http://localhost/Prambanan_Batik/`.

> **Never commit credentials.** `config.php` reads credentials from environment variables first. The `.env` file is gitignored — use `.env.example` as a template.

## Production Deployment

### Step 1: Database Setup (cPanel)

1. **MySQL Databases** → create database, create user, grant ALL privileges.
2. Run `schema.sql` via phpMyAdmin SQL tab.
3. (Optional) Run `seed.sql` for sample data.

### Step 2: Upload Files

Upload all project files via FTP to `public_html`, maintaining folder structure.

### Step 3: Configure Credentials

Set environment variables in `.htaccess` or in the hosting control panel. Do **not** hard-code credentials in `config.php`.

```apacheconf
# .htaccess or VirtualHost block
SetEnv BASE_URL    https://yourdomain.com
SetEnv DB_HOST     localhost
SetEnv DB_NAME     your_db_name
SetEnv DB_USER     your_db_user
SetEnv DB_PASSWORD your_db_password
```

When `BASE_URL` is set to the domain root (no subdirectory path), `SITE_PATH` resolves to an empty string automatically — no other code changes needed for deployment.

### Step 4: Create the First Admin User

There is no self-registration. Use a one-off PHP script or phpMyAdmin to insert the first account:

```php
// Run once, then delete the file
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', '$hash');
```

Or directly in phpMyAdmin (SQL tab), if you already know the bcrypt hash:
```sql
INSERT INTO admin_users (email, password_hash, created_at)
VALUES ('admin@example.com', '<bcrypt_hash_here>', NOW());
```

Once logged in, additional admin accounts can be added, have their passwords changed, or be deleted via **Admin Panel → Admins** (`/admin/admins.php`).

> `password_hash()` / `password_verify()` (bcrypt, cost 12) are used — **not** SHA2. Do not use `SHA2('password', 256)`.

## File Structure

```
/
├── index.php                    # Homepage — featured products
├── products.php                 # Listing — dynamic category filter from DB
├── product.php                  # Product detail + reviews
├── go.php                       # Tracked redirect to Shopee/Tokopedia/other
├── sitemap.php                  # Dynamic XML sitemap (null-safe when DB unavailable)
├── robots.txt                   # Search engine directives
├── config.php                   # Site constants — BASE_URL, SITE_PATH, DB_*, SESSION_TIMEOUT, etc.
├── db_connect.php               # Returns PDO instance (or null on failure)
├── functions.php                # Utility functions
├── header.php                   # Shared page header (uses SITE_PATH for CSS/nav links)
├── footer.php                   # Shared page footer — includes main.js (required for animations)
├── schema.sql                   # CREATE TABLE statements
├── seed.sql                     # Sample data
├── .env.example                 # Template for environment variables
├── assets/
│   ├── css/styles.css           # Main stylesheet (warm batik palette; .reveal/.product-card start at opacity:0)
│   └── js/main.js               # Scroll reveal (IntersectionObserver), sticky header, avatar initials
└── admin/
    ├── admin.css                # Admin panel styles
    ├── auth.php                 # Session management + CSRF helpers + login rate-limiting helpers
    ├── index.php                # Dashboard — stats cards + recent reviews
    ├── login.php                # Login form with brute-force rate limiting
    ├── logout.php               # Logout handler
    ├── admins.php               # List / add / delete admin users; change passwords
    ├── categories.php           # Create / edit / delete categories
    ├── products.php             # Products list (IDR pricing)
    ├── product_edit.php         # Create / edit product
    ├── product_images.php       # Manage product images (URL-based, http(s):// validated)
    ├── import_products.php      # CSV bulk import (CSRF-protected)
    ├── reviews.php              # Manage reviews — recalculates rating on delete
    └── review_edit.php          # Create / edit review — recalculates rating on save
```

## Database Schema

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| name | VARCHAR 255 | UNIQUE |
| slug | VARCHAR 255 | UNIQUE, used in URL filters |
| description | TEXT | |
| created_at / updated_at | TIMESTAMP | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| category_id | INT FK | ON DELETE SET NULL |
| sku | VARCHAR 255 | UNIQUE — used as CSV upsert key |
| slug | VARCHAR 255 | UNIQUE — used in URLs |
| name | VARCHAR 255 | |
| description | LONGTEXT | |
| price_display | DECIMAL(10,2) | Displayed in IDR (Rp) |
| rating_avg | DECIMAL(3,2) | Denormalized — recalculated on every review create/edit/delete |
| rating_count | INT | Denormalized — same |
| buy_link_shopee / tokopedia / other | VARCHAR 500 | Affiliate links |
| created_at / updated_at | TIMESTAMP | |

### `product_images`
Stores image URLs and a `sort_order`; the first image (lowest `sort_order`) is the product thumbnail.

### `reviews`
Rating is `INT CHECK (rating >= 1 AND rating <= 5)`. Fields include `reviewer_name`, `rating`, `content`, `verified_purchase`, `review_source`.

### `outbound_clicks`
Logs every click on a buy link: `product_id`, `platform`, `user_ip`, `user_agent`, `referrer`.

### `admin_users`
`email` (UNIQUE) + `password_hash` (bcrypt, cost 12).

### `login_attempts`
Tracks failed admin login attempts by IP for brute-force protection. Columns: `ip_address`, `attempted_at`. Rows older than 24 hours are pruned automatically on each login attempt.

## URL Patterns

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/products.php?category=<slug>` | Filter by category |
| `/product.php?id=<id>` | Product detail |
| `/go.php?id=<id>&platform=<shopee\|tokopedia\|other>` | Tracked redirect |
| `/sitemap.php` | XML sitemap |
| `/admin/` | Admin dashboard |
| `/admin/admins.php` | Admin user management |

## CSV Import Format

```
sku,name,price,description,category_id,image_url
BATIK-001,Mega Mendung Batik,350000,Hand-drawn cloud patterns,1,https://example.com/img.jpg
```

**Required**: `sku`, `name`, `price` — **Optional**: `description`, `category_id`, `image_url`

Products are upserted by `sku` — existing products with the same SKU are updated.

## Security

- **Prepared statements**: all queries use PDO with bound parameters
- **Output escaping**: all dynamic content passed through `escape()` (htmlspecialchars)
- **Passwords**: bcrypt via `password_hash()` (cost 12) / `password_verify()`
- **CSRF protection**: all admin POST forms carry a per-session token validated server-side with `hash_equals()`
- **Brute-force protection**: admin login blocked after 5 failed attempts per IP within 15 minutes, tracked in `login_attempts` table
- **Session timeout**: admin sessions expire after 30 minutes of inactivity (sliding window — reset on every authenticated request)
- **Open redirect protection**: `go.php` and `product_images.php` both validate URLs start with `http://` or `https://`
- **File upload validation**: MIME type checked via `finfo`, extension allow-listed

### Recommendations

1. Serve over HTTPS — redirect HTTP in `.htaccess`
2. Use a strong, unique DB password set via environment variable (never committed)
3. Rename the `/admin/` folder to something non-obvious
4. Keep PHP updated
5. Monitor server error logs regularly

## Troubleshooting

**Database connection error** — check env vars or `config.php` defaults, confirm MySQL is running and the user has full privileges.

**Admin login fails** — ensure the password was hashed with `password_hash()` (bcrypt), not SHA2. See admin user creation instructions above.

**Admin login locked out** — if you (or a bot) triggered the rate limit, wait 15 minutes or manually clear the `login_attempts` table: `DELETE FROM login_attempts;`

**Products / content invisible** — `main.js` must be loaded by `footer.php`. If the script tag is missing, `.reveal` and `.product-card` elements stay at `opacity: 0`. Check that `footer.php` ends with `<script src="<?php echo SITE_PATH; ?>/assets/js/main.js"></script>`.

**"Not Found" after login or any redirect** — if the site lives in a subdirectory (e.g. `localhost/Prambanan_Batik`), confirm `BASE_URL` includes the subdirectory. All PHP redirects use `BASE_URL`; all HTML links use `SITE_PATH`.

**Preview mode shown** — the site shows sample data when the DB is unavailable. A yellow banner appears at the top. Check DB credentials.

**Rating not updating after review changes** — ratings are denormalized and recalculated in PHP on every review create/edit/delete. If ratings appear stale, you can force a recalculation by running:
```sql
UPDATE products p SET
    rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id);
```

**CSV import errors** — verify UTF-8 encoding, required columns present, `category_id` exists, and file is under 5 MB.

**Sitemap blank** — no products in DB, or DB connection failed (sitemap gracefully omits product URLs).

## Maintenance

- **Weekly**: check disk space and error logs
- **Monthly**: back up database (phpMyAdmin → Export) and files
- **Quarterly**: review PHP version, SSL expiry, and security settings

## License

Proprietary and confidential. All rights reserved.

## Version History

- **v2.3.0** (2026-06): Security hardening + dashboard + bug fixes
  - Removed hardcoded DB password fallback in `config.php` — credentials must be set via env var
  - Brute-force protection on admin login — 5 attempts per IP per 15 minutes via new `login_attempts` table
  - CSRF protection added to CSV import form (`import_products.php`)
  - Image URLs in `product_images.php` now validated to start with `http(s)://`
  - `rating_avg` / `rating_count` now recalculated on every review create, edit, and delete
  - Admin dashboard rewritten with stats cards (products, categories, reviews, clicks) and recent reviews table
  - PDO `LIMIT` binding in `product.php` cleaned up to use `bindValue(PDO::PARAM_INT)`

- **v2.2.0** (2026-06): Admin management UI + path & animation fixes
  - New `admin/admins.php` — add, delete, and change passwords for admin accounts
  - `SITE_PATH` constant added — all HTML links now work in both subdirectory and root deployments
  - `main.js` added to `footer.php` — scroll-reveal animations and product cards now visible
  - Admin sidebar updated across all pages to include Admins link
  - `BASE_URL` default updated to `http://localhost/Prambanan_Batik`

- **v2.1.0** (2026-06): Security hardening + bug fixes
  - CSRF protection on all admin forms (timing-safe `hash_equals()`)
  - Session idle timeout enforced (30-minute sliding window)
  - Open redirect validation in `go.php`
  - Preview banner now correctly shows when DB is down at runtime
  - Category filter loaded dynamically from DB (with hardcoded fallback for preview mode)
  - Admin currency display corrected to IDR (Rp)
  - Multibyte-safe `truncate_text()` using `mb_strlen` / `mb_substr`
  - Categories admin now supports editing via `?edit=<id>`
  - `sitemap.php` null-safe when DB unavailable

- **v2.0.0** (2026): Complete rewrite
  - Modernized PHP with PDO
  - Prambanan Batik branding
  - Admin panel with CSV import

- **v1.0.0** (2024): Initial release
