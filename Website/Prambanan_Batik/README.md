# Prambanan Batik - Product Catalog & Review System

A product catalog showcasing authentic Indonesian batik with an admin management panel and customer reviews, built with PHP and MySQL.

## Known Gaps / Next Steps

Updated 2026-09-30 (the Open Graph tags and static-asset cache headers from the 2026-09-29 list are now done — see v2.10.0). Still open:

- **`CONTACT_EMAIL` is still a placeholder** (`hello@prambananbatik.com`) — used by `terms.php` and `privacy.php`. Set the real address via the `CONTACT_EMAIL` env var (or `.env`) before this goes anywhere real.
- **Sample product photos are stock images** — `seed.sql` and the preview sample data use free Unsplash photos that genuinely show batik, but they aren't your products. Replace them with real product photos (Admin → Products → Images) before launch.
- **Production deploy checklist** — set `BASE_URL` to the real domain (drives canonical/Open Graph URLs, `robots.txt` and the sitemap), and change `.htaccess`'s `ErrorDocument 404` to `/404.php` when deploying at the domain root (see Production Deployment).
- **Logout is a plain GET link** — any site could log an admin out by embedding the URL. Harmless (it can't do anything else), but turning it into a CSRF-protected POST button would close it off.

## Features

- **Product Management**: Browse and filter batik products by category
- **Customer Reviews**: View product reviews with star ratings
- **Admin Panel**: Secure authentication to manage products, categories, reviews, images, and admin users
- **Admin Dashboard**: At-a-glance stats (product count, categories, reviews, outbound clicks) with recent review feed
- **CSV Import**: Bulk import products with upsert by SKU
- **Responsive Design**: Mobile-friendly interface with warm batik-inspired styling, scroll-reveal animations
- **SEO Optimized**: XML sitemap, a generated `robots.txt`, canonical URLs, and a unique meta title + meta description per page (static on Home/404, dynamic by category on the collection page, dynamic by product on product pages)
- **Social Previews**: Open Graph + Twitter Card tags on every public page, so links shared to WhatsApp/Facebook/X/Discord show a rich card — product pages use the product's own photo, everything else a branded 1200×630 image
- **Custom 404 Page**: Styled not-found page served for any unmatched URL (wired up via `.htaccess`) and for unknown product IDs
- **Graceful Images**: Products without an image — or whose external image URL has died — show an on-brand kawung placeholder instead of a broken image
- **Empty States**: A category with no products shows a friendly "No batik here yet" message instead of an empty grid
- **Loading States**: Top-of-page progress bar on navigation, shimmer skeletons on product images while they load, and a spinner + disabled state on form submit buttons — across both the public site and admin panel
- **Legal Pages**: Terms of Use and Privacy Policy, linked from the footer and listed in the sitemap
- **Favicon Set**: A custom batik-motif icon (SVG source + ICO/PNG fallbacks, `apple-touch-icon`, Android/manifest icons, Safari mask icon) across the public site and admin panel
- **Outbound Click Tracking**: Analytics for affiliate/shop links (Shopee, Tokopedia, etc.)
- **Preview Mode**: Sample data shown automatically when the database is unavailable or has no products yet
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
2. Put the project in your web root (e.g. `htdocs/Prambanan_Batik`). If the project lives elsewhere, link it instead of copying, so the served site never goes stale — on Windows: `mklink /J C:\xampp\htdocs\Prambanan_Batik "C:\path\to\Prambanan_Batik"`.
3. Copy `.env.example` to `.env` and fill in your credentials — `config.php` loads it automatically. (Real environment variables, e.g. `SetEnv DB_PASSWORD yourpassword` in Apache, take precedence over `.env`.) If your MySQL/MariaDB isn't on the default port, set `DB_PORT` (e.g. `3307`).
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

> **Never commit credentials.** `config.php` reads real environment variables first, then the gitignored `.env` file, then built-in defaults. Use `.env.example` as a template.

## Production Deployment

### Step 1: Database Setup (cPanel)

1. **MySQL Databases** → create database, create user, grant ALL privileges.
2. Run `schema.sql` via phpMyAdmin SQL tab.
3. (Optional) Run `seed.sql` for sample data.

### Step 2: Upload Files

Upload all project files via FTP to `public_html`, maintaining folder structure.

### Step 3: Configure Credentials

Either upload a `.env` file (same keys as `.env.example`; `.htaccess` blocks it from being downloaded — **only rely on this on Apache with `.htaccess` enabled**, e.g. not on Nginx) or set environment variables in the VirtualHost / hosting control panel. Do **not** hard-code credentials in `config.php`.

```apacheconf
# VirtualHost block or hosting control panel
SetEnv BASE_URL     https://yourdomain.com
SetEnv DB_HOST      localhost
SetEnv DB_PORT      3306
SetEnv DB_NAME      your_db_name
SetEnv DB_USER      your_db_user
SetEnv DB_PASSWORD  your_db_password
SetEnv CONTACT_EMAIL hello@yourdomain.com
```

`BASE_URL` must be the real public URL: it's used for redirects, canonical and Open Graph URLs, the generated `robots.txt`, and the sitemap.

When `BASE_URL` is set to the domain root (no subdirectory path), `SITE_PATH` resolves to an empty string automatically — no other code changes needed for deployment.

**One exception**: `.htaccess`'s `ErrorDocument 404 /Prambanan_Batik/404.php` line is a raw server path and can't read `SITE_PATH`, so it doesn't follow the rule above automatically. When deploying to the domain root, change it to `ErrorDocument 404 /404.php`.

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
├── 404.php                      # Custom 404 page — wired up in .htaccess via ErrorDocument
├── terms.php                    # Terms of Use
├── privacy.php                  # Privacy Policy
├── favicon.ico                  # Root fallback for browsers that ignore <link> tags (domain-root deployments only)
├── robots.php                   # Generates robots.txt (served at /robots.txt via a .htaccess rewrite) from BASE_URL/SITE_PATH
├── config.php                   # Loads .env, defines BASE_URL, SITE_PATH, DB_* (incl. DB_PORT), SESSION_TIMEOUT, etc.
├── db_connect.php               # Returns PDO instance (or null on failure)
├── functions.php                # Utility functions
├── header.php                   # Shared page header (uses SITE_PATH for CSS/nav links)
├── footer.php                   # Shared page footer — includes main.js (required for animations)
├── schema.sql                   # CREATE TABLE statements
├── seed.sql                     # Sample data
├── .env.example                 # Template for environment variables
├── assets/
│   ├── css/styles.css           # Main stylesheet (warm batik palette; .reveal/.product-card start at opacity:0)
│   ├── js/main.js               # Scroll reveal, sticky header, avatar initials, image loading skeletons + dead-image fallback, form-submit spinners, nav progress bar (also loaded on admin pages)
│   ├── images/                  # og-image.png (1200×630 social preview) + its HTML source, product-placeholder.svg
│   └── favicon/                 # favicon.svg (canonical source) + exported ICO/PNGs, apple-touch-icon, Android icons, mask-icon, site.webmanifest
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
Rating is `INT CHECK (rating >= 1 AND rating <= 5)`. Fields include `reviewer_name`, `rating`, `title` (shown above the review text when set), `content`, `reviewer_email` (never shown publicly), `verified_purchase`, `review_source`. Reviews are entered by admins — there is no public review form.

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
| `/robots.txt` | Crawler rules (generated by `robots.php`) |
| `/404.php` | Custom not-found page (also served for any unmatched URL via `.htaccess`) |
| `/terms.php` | Terms of Use |
| `/privacy.php` | Privacy Policy |
| `/admin/` | Admin dashboard |
| `/admin/admins.php` | Admin user management |

## CSV Import Format

```
sku,name,price,description,category_id,image_url
BATIK-001,Mega Mendung Batik,350000,Hand-drawn cloud patterns,1,https://example.com/img.jpg
```

**Required**: `sku`, `name`, `price` — **Optional**: `description`, `category_id`, `image_url`

- Products are upserted by `sku` — an existing SKU gets its name and price updated, plus description/category when those cells aren't empty.
- `price` must be plain digits in Rupiah (`350000`). Indonesian-formatted values like `350.000` are rejected rather than silently imported as Rp 350.
- Header names are case-insensitive, and Excel's "CSV UTF-8" byte-order mark is handled. Wrap values containing commas in double quotes; rows with the wrong number of columns are reported and skipped.
- New products get a slug from their name; if another product already has it, `-2`, `-3`, … is appended.
- Re-importing the same file doesn't add duplicate copies of an `image_url` that's already on the product.
- Each row is saved in its own transaction, and the summary lists every skipped row with the reason.

## Security

- **Prepared statements**: all queries use PDO with bound parameters
- **Output escaping**: all dynamic content passed through `escape()` (htmlspecialchars)
- **Passwords**: bcrypt via `password_hash()` (cost 12) / `password_verify()`
- **Timing-safe login**: `password_verify()` always runs (against a dummy hash when the email doesn't exist) so "unknown email" and "wrong password" take the same time — prevents email enumeration via response timing
- **CSRF protection**: all admin POST forms — including the login form — carry a per-session token validated server-side with `hash_equals()`
- **Account removal takes effect immediately**: every admin request re-checks that the signed-in account still exists, so a deleted admin is signed out on their next click instead of when their session times out
- **Admin never indexed**: admin responses send `X-Robots-Tag: noindex, nofollow`, independent of `robots.txt`
- **Brute-force protection**: admin login blocked after 5 failed attempts per IP within 15 minutes, tracked in `login_attempts` table
- **Session security**: `HttpOnly`, `SameSite=Lax`, and (over HTTPS) `Secure` cookie flags; session ID is regenerated on login (prevents session fixation); 30-minute idle timeout (sliding window); logout clears the session cookie explicitly, not just server-side state
- **Open redirect / SSRF-of-links protection**: `go.php`, `product_images.php`, admin product buy-links (`product_edit.php`), and the CSV importer all validate that URLs start with `http://` or `https://` before they're stored or redirected to
- **Reverse-tabnabbing protection**: every `target="_blank"` link carries `rel="noopener noreferrer"`
- **File upload validation**: MIME type checked via `finfo`, extension allow-listed
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, and (over HTTPS) `Strict-Transport-Security` are sent on every response from `config.php`, reinforced at the web-server level in `.htaccess`
- **Error handling**: `display_errors` is forced off whenever `DEBUG_MODE` is false — admin CRUD pages log exception details server-side via `error_log()` and show only a generic message, so database schema/internals are never exposed in the UI
- **Hardened `.htaccess`**: blocks direct HTTP access to `config.php` / `db_connect.php` / `functions.php` (require/include-only files), `.env*`, `.sql`, `.log`, `.md`, `.bak`, lockfiles, and every dot-file/dot-folder (`.git`, `.claude`, `.htaccess`, …) except `.well-known`; disables directory listing; force-redirects to HTTPS in production (skipped on `localhost`/`127.0.0.1` for local dev)
- **Malformed input**: admin handlers read POST fields through `post_string()`, so crafted array inputs (`name[]=x`) are treated as empty instead of crashing PHP 8

### Recommendations

1. Serve over HTTPS — `.htaccess` already redirects HTTP to HTTPS outside of local dev
2. Use a strong, unique DB password set via environment variable (never committed)
3. Rename the `/admin/` folder to something non-obvious
4. Keep PHP updated
5. If `.env` was ever committed to this repository's git history, treat any values in it as compromised and rotate them — removing it from tracking (`git rm --cached`) does not remove it from history; use `git filter-repo` or BFG Repo-Cleaner if it must be scrubbed
6. The current `Content-Security-Policy` allows `'unsafe-inline'` for scripts and styles because a few admin pages use inline `<script>`/`<style>` blocks. Moving those to external files (or nonces) would allow tightening the policy further.
7. Monitor server error logs regularly

## Troubleshooting

**Database connection error** — check `.env` / env vars (including `DB_PORT` if MySQL isn't on 3306), confirm MySQL is running and the user has full privileges. The admin panel shows a "can't reach the database" page (HTTP 503) instead of crashing; the public site falls back to preview mode.

**Site shows old code** — make sure the web root serves *this* folder (a junction/symlink), not an old copy of it.

**Admin login fails** — ensure the password was hashed with `password_hash()` (bcrypt), not SHA2. See admin user creation instructions above.

**Admin login locked out** — if you (or a bot) triggered the rate limit, wait 15 minutes or manually clear the `login_attempts` table: `DELETE FROM login_attempts;`

**Products / content invisible** — `main.js` must be loaded by `footer.php`. If the script tag is missing, `.reveal` and `.product-card` elements stay at `opacity: 0`. Check that `footer.php` ends with `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`. (With JavaScript disabled, a `<noscript>` rule in `header.php` shows the content anyway.)

**"Not Found" after login or any redirect** — if the site lives in a subdirectory (e.g. `localhost/Prambanan_Batik`), confirm `BASE_URL` includes the subdirectory. All PHP redirects use `BASE_URL`; all HTML links use `SITE_PATH`.

**Preview mode shown** — the site shows sample data when the DB is unavailable or the `products` table is empty. A yellow banner ("Preview Mode (no live product data)") appears at the top. Check DB credentials, or add products. (A category with no products is *not* preview mode — it shows an empty state.)

**Rating not updating after review changes** — ratings are denormalized and recalculated in PHP on every review create/edit/delete. If ratings appear stale, you can force a recalculation by running:
```sql
UPDATE products p SET
    rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id);
```

**CSV import errors** — the import summary lists each skipped row with its reason. Common causes: prices written as `350.000` (use `350000`), a `category_id` that doesn't exist (the valid IDs are listed on the import page), unquoted commas inside a value, or a file over 5 MB.

**Sitemap blank** — no products in DB, or DB connection failed (sitemap gracefully omits product URLs).

## Maintenance

- **Weekly**: check disk space and error logs
- **Monthly**: back up database (phpMyAdmin → Export) and files
- **Quarterly**: review PHP version, SSL expiry, and security settings

## License

Proprietary and confidential. All rights reserved.

## Version History

- **v2.10.0** (2026-09-30): Full bug-fix + polish pass, verified end to end against a real local database
  - `.env` is now actually loaded by `config.php` (previously nothing read it); new `DB_PORT` setting
  - Social previews: Open Graph + Twitter Card tags and canonical URLs on every public page, a branded `assets/images/og-image.png`, product pages use their own photo
  - Static-asset caching in `.htaccess` (1 year for versioned CSS/JS via `asset_url()`'s `?v=<mtime>`, 30 days for images/icons)
  - `robots.txt` is now generated by `robots.php` from `BASE_URL` (the old static file pointed its sitemap at `example.com`); also disallows `go.php`
  - Unknown product IDs return a real 404 (previously showed a fake sample product under a "Database unavailable" banner); an empty category shows an empty state instead of fake products; the category filter also works in preview mode
  - Product images: on-brand placeholder when a product has no image or its URL is dead; image alt text from the admin is used; seed/sample photos replaced with free Unsplash photos that actually show batik (the old ones were unrelated stock photos, and one link was dead)
  - Reviews: moving a review to another product now recalculates *both* products' ratings; review titles are shown publicly; line breaks kept; "1 review" pluralization; `seed.sql` now derives `rating_avg`/`rating_count` from its actual reviews
  - Admin: friendly 503 page instead of a fatal error when the DB is down; CSRF on the login form; deleted admins are signed out immediately; fixed an XSS in the admin-delete confirm dialog (email with an apostrophe); product/review forms keep what you typed after a validation error; clear duplicate-SKU/slug, price and category messages; slugs auto-normalised (blank = from the name); image deletes scoped to their product; 72-byte bcrypt password limit enforced; "not found" feedback instead of false success messages
  - CSV import rewritten: handles Excel's BOM and mixed-case headers, long lines, rows with the wrong column count (previously a fatal error), `350.000`-style prices, unknown categories, duplicate names (unique slugs), and no duplicate images on re-import
  - `.htaccess` blocks every dot-folder (e.g. `.claude/`), not just `.git`; admin pages send `X-Robots-Tag: noindex`
  - Content without JavaScript: `<noscript>` fallback makes scroll-reveal content visible
  - Privacy policy corrected (reviews are entered by staff — there's no public review form; mentions Google Fonts / external image hosts); legal pages show a fixed "Last updated" date instead of always the current month
  - Removed dead Bolt.new scaffold files (`.bolt/`, empty `package-lock.json`)

- **v2.9.0** (2026-09): Favicon set
  - New `assets/favicon/` — a custom four-petal batik-motif icon in the site's own espresso/copper-gold palette, with `favicon.svg` as the hand-authored canonical source
  - Full ICO/PNG/manifest set exported from it: `favicon.ico` (16/32/48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, `safari-pinned-tab.svg`, `site.webmanifest`
  - `header.php` links the full set on every public page; every `admin/*.php` page links a lighter 3-tag subset (SVG + ICO + apple-touch-icon) in its own `<head>`
  - A plain copy of `favicon.ico` also sits at the project root as a fallback for browsers that request it directly, ignoring `<link>` tags (effective only when deployed at the domain root)

- **v2.8.0** (2026-09): Terms of Use & Privacy Policy pages
  - New `terms.php` and `privacy.php` — static legal pages using the same header/footer chrome as every other public page
  - `privacy.php`'s "Information We Collect" section accurately reflects what the codebase collects: review submissions, `outbound_clicks` logging in `go.php`, and the strictly-necessary session cookie
  - New `CONTACT_EMAIL` constant in `config.php` (env-overridable, like `BASE_URL`) used by both pages' contact links
  - Linked from `footer.php` (Quick Links list + a compact legal-links row next to the copyright) and added to `sitemap.php`

- **v2.7.0** (2026-09): Loading states
  - New top-of-page progress bar (`initNavProgressBar` in `main.js`) animates on link clicks and form submits across the whole site — every navigation here is a full page reload, so it never needs to "complete"
  - Product images (grid cards + detail page) now show a shimmer skeleton until they finish loading, then fade in (`initImageLoading`); no PHP/markup changes needed, it's driven entirely by existing `.product-image` / `.product-image-section` selectors
  - Every form's submit button now disables itself and shows a spinner on submit (`initFormLoadingStates`), including admin delete-confirm buttons
  - `assets/js/main.js` is now also loaded directly on every `admin/*.php` page (previously public-only) so the admin panel gets the same behaviors
  - `products.php`'s category filter now submits via `requestSubmit()` instead of `submit()`, so it actually fires a `submit` event (needed for the progress bar to trigger on category filtering)

- **v2.6.0** (2026-09): Per-page SEO meta tags
  - Every page now sets `$page_title` and `$meta_description` before `header.php` renders `<title>` and `<meta name="description">`; falls back to new `DEFAULT_META_DESCRIPTION` constant in `config.php` when a page doesn't set one
  - `products.php` title/description are dynamic — reflect the active category filter, or a generic collection description when unfiltered
  - `product.php` description is built from the product's own description text (truncated to ~155 chars), falling back to a templated name + category description when empty

- **v2.5.0** (2026-09): Custom 404 page
  - New `404.php` — styled to match the rest of the site, sends a real `404` status via `http_response_code(404)`
  - `.htaccess` now serves it for any unmatched URL via `ErrorDocument 404` (path must be updated when deploying to the domain root — see Production Deployment)

- **v2.4.0** (2026-09): Security hardening pass
  - Security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`) sent from `config.php` on every request
  - New root `.htaccess` — forces HTTPS in production, blocks direct access to internal-only PHP includes and to `.env`/`.sql`/`.log`/`.md`/lockfiles, disables directory listing
  - Session cookies hardened: `HttpOnly` + `SameSite=Lax` + conditional `Secure`; session ID regenerated on admin login (session-fixation fix); logout now clears the cookie explicitly
  - Admin login is timing-safe — `password_verify()` always runs against a real or dummy hash, so failed logins take constant time regardless of whether the email exists
  - Admin buy-link fields (`buy_link_shopee`/`tokopedia`/`other`) and the CSV importer's `image_url` column are now validated to start with `http(s)://`, matching the existing `product_images.php` / `go.php` checks
  - Added `rel="noopener noreferrer"` to every `target="_blank"` link (reverse-tabnabbing fix)
  - Admin CRUD pages no longer echo raw exception messages to the browser — details go to `error_log()`, the UI shows a generic message
  - `.env` (committed with a stray, inert Bolt.new/Vite scaffold key unused by this PHP app) removed from git tracking — see Security Recommendations above regarding history

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
