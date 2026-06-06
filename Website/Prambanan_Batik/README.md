# Prambanan Batik - Product Catalog & Review System

A product catalog showcasing authentic Indonesian batik with an admin management panel and customer reviews, built with PHP and MySQL.

## Features

- **Product Management**: Browse and filter batik products by category
- **Customer Reviews**: View product reviews with star ratings
- **Admin Panel**: Secure authentication to manage products, categories, reviews, and images
- **CSV Import**: Bulk import products with upsert by SKU
- **Responsive Design**: Mobile-friendly interface with warm batik-inspired styling
- **SEO Optimized**: XML sitemap and robots.txt for search engines
- **Outbound Click Tracking**: Analytics for affiliate/shop links (Shopee, Tokopedia, etc.)
- **Preview Mode**: Sample data shown automatically when the database is unavailable

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

Set environment variables in cPanel → **Apache Handlers** / **`.htaccess`** or configure them in the hosting control panel. Do **not** hard-code credentials in `config.php`.

```apacheconf
# .htaccess or VirtualHost block
SetEnv BASE_URL    https://yourdomain.com
SetEnv DB_HOST     localhost
SetEnv DB_NAME     your_db_name
SetEnv DB_USER     your_db_user
SetEnv DB_PASSWORD your_db_password
```

### Step 4: Create Admin User

Run this in phpMyAdmin (SQL tab) — generates a proper bcrypt hash via PHP:

```php
// In a one-off script or phpMyAdmin's "Routines":
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// Then INSERT:
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', '$hash');
```

Or run directly if you know the bcrypt hash:
```sql
INSERT INTO admin_users (email, password_hash, created_at)
VALUES ('admin@example.com', '<bcrypt_hash_here>', NOW());
```

> `password_hash()` / `password_verify()` (bcrypt) are used — **not** SHA2. Do not use `SHA2('password', 256)`.

## File Structure

```
/
├── index.php                    # Homepage — featured products
├── products.php                 # Listing — dynamic category filter from DB
├── product.php                  # Product detail + reviews
├── go.php                       # Tracked redirect to Shopee/Tokopedia/other
├── sitemap.php                  # Dynamic XML sitemap
├── robots.txt                   # Search engine directives
├── config.php                   # Site constants — reads env vars first
├── db_connect.php               # Returns PDO instance (or null on failure)
├── functions.php                # Utility functions
├── header.php                   # Shared page header
├── footer.php                   # Shared page footer
├── schema.sql                   # CREATE TABLE statements
├── seed.sql                     # Sample data
├── .env.example                 # Template for environment variables
├── assets/
│   ├── css/styles.css           # Main stylesheet (warm batik palette)
│   └── js/main.js               # Scroll reveal, sticky header, avatar initials
└── admin/
    ├── admin.css                # Admin panel styles
    ├── auth.php                 # Session management + CSRF helpers
    ├── index.php                # Dashboard
    ├── login.php                # Login form
    ├── logout.php               # Logout handler
    ├── categories.php           # Create / edit / delete categories
    ├── products.php             # Products list (IDR pricing)
    ├── product_edit.php         # Create / edit product
    ├── product_images.php       # Manage product images (URL-based)
    ├── import_products.php      # CSV bulk import
    ├── reviews.php              # Manage reviews
    └── review_edit.php          # Create / edit review
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
| rating_avg | DECIMAL(3,2) | Denormalized — updated on review change |
| rating_count | INT | Denormalized |
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

## URL Patterns

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/products.php?category=<slug>` | Filter by category |
| `/product.php?id=<id>` | Product detail |
| `/go.php?id=<id>&platform=<shopee\|tokopedia\|other>` | Tracked redirect |
| `/sitemap.php` | XML sitemap |
| `/admin/` | Admin dashboard |

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
- **CSRF protection**: all admin POST forms carry a per-session token validated server-side
- **Session timeout**: admin sessions expire after 30 minutes of inactivity (sliding window)
- **Open redirect protection**: `go.php` validates URLs start with `http://` or `https://`
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

**Preview mode shown** — the site shows sample data when the DB is unavailable. A yellow banner appears at the top. Check DB credentials.

**CSV import errors** — verify UTF-8 encoding, required columns present, `category_id` exists, and file is under 5 MB.

**Sitemap blank** — no products in DB, or DB connection failed (sitemap gracefully omits product URLs).

## Maintenance

- **Weekly**: check disk space and error logs
- **Monthly**: back up database (phpMyAdmin → Export) and files
- **Quarterly**: review PHP version, SSL expiry, and security settings

## License

Proprietary and confidential. All rights reserved.

## Version History

- **v2.1.0** (2026-06): Security hardening + bug fixes
  - CSRF protection on all admin forms
  - Session idle timeout enforced (30 min)
  - Open redirect validation in `go.php`
  - Preview banner now correctly shows when DB is down
  - Category filter loaded from DB (no longer hardcoded)
  - Admin currency display corrected to IDR (Rp)
  - Multibyte-safe text truncation
  - Categories admin now supports editing
  - `sitemap.php` null-safe when DB unavailable

- **v2.0.0** (2026): Complete rewrite
  - Modernized PHP with PDO
  - Prambanan Batik branding
  - Admin panel with CSV import

- **v1.0.0** (2024): Initial release
