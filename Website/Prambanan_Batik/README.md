# Prambanan Batik

A catalog website for Indonesian batik, built with PHP and MySQL. Visitors browse products with photos, prices and customer reviews, then buy on Shopee or Tokopedia. Staff manage everything from an admin panel.

## Still to do

Last checked 2026-10-15.

- **Contact email.** `CONTACT_EMAIL` is still the placeholder `hello@prambananbatik.com`. The Terms and Privacy pages show it, so set your real address in `.env` (or as an environment variable) before launch.
- **Product photos.** The sample products in `seed.sql` and the preview data use free Unsplash photos that show real batik, but they aren't your products. Add your own photos in Admin → Products → Images.
- **Deploying.** Set `BASE_URL` to your domain, because the canonical and Open Graph URLs, `robots.txt` and the sitemap all come from it. If the site sits at the domain root, also change `ErrorDocument 404` in `.htaccess` to `/404.php`. See [Deploying to production](#deploying-to-production).
- **Logout link.** Logging out uses a plain link, so another website could log an admin out by embedding that URL. It can't do anything worse than that. A POST button with a CSRF token would close the gap.
- **Test script.** A 74-check script that exercises every page and admin action lives outside the project for now, at `C:\CSIE\prambanan_batik_checks.sh`, with run instructions at the top. It may move into the project as `tests/check.sh`.
- **Optional ideas.** Product data for Google rich results (price and rating stars), category pages in the sitemap, and uploading product photos instead of pasting links.

## What the site does

For visitors:
- Browse batik by category, sorted by customer rating, on a layout that works on phones.
- Open a product to see its photos, price in rupiah, description and reviews, then follow a buy button to Shopee, Tokopedia or another store.
- Share any page and get a preview card on WhatsApp, Facebook, X or Discord. Product pages use the product's photo; other pages use a branded 1200×630 image.
- Read the Terms of Use and Privacy Policy, linked from the footer.

Behind the scenes:
- **Admin panel.** Staff sign in to manage products, categories, reviews, product photos and other admin accounts. The dashboard shows counts and the latest reviews.
- **CSV import.** You can add or update many products at once from a spreadsheet. The SKU decides whether a row creates a product or updates one.
- **Click tracking.** `go.php` records each buy-button click (product and marketplace) before sending the visitor on.
- **Preview mode.** If the database is down or has no products, the site shows sample products under a banner instead of an error.
- **Graceful gaps.** A product without a photo, or whose photo link has died, shows a placeholder with the site's kawung motif. An empty category says "No batik here yet". Unknown pages and products get a styled 404 page.
- **SEO.** Each page has its own title, description and canonical URL. There's an XML sitemap and a generated `robots.txt`.
- **Loading feedback.** A thin progress bar runs across the top when you change pages, product photos shimmer while they load, and submit buttons show a spinner.
- **Login protection.** Five failed logins from one IP address lock that address out for 15 minutes.
- **Accessible.** Every page passes a WCAG AA contrast check, works from the keyboard (skip link, visible focus ring), has one clear page heading, and uses touch targets of at least 44px on phones. Star ratings are read out as "Rated 4.5 out of 5". Motion is short and respects the reduced-motion setting.
- **Admin on a phone.** The admin sidebar turns into a row of links across the top, and wide tables scroll inside their card.

## Tech stack

- PHP 7.4 or newer, with PDO and the `finfo` extension
- MySQL 8.0 or newer (MariaDB works too), using utf8mb4
- Plain HTML, CSS and JavaScript, with no build step
- Apache, either XAMPP/WAMP locally or shared hosting in production. Nginx works, but it ignores `.htaccess`, so you'd need to copy those rules into the Nginx config.

## Running it locally

1. Install XAMPP or WAMP and start Apache and MySQL.
2. Put the project in your web root, for example `htdocs/Prambanan_Batik`. If you keep the code somewhere else, link the folder rather than copying it, so the site you see is always the current code. On Windows: `mklink /J C:\xampp\htdocs\Prambanan_Batik "C:\path\to\Prambanan_Batik"`.
3. Copy `.env.example` to `.env` and fill in your database details. `config.php` reads `.env` by itself, and real environment variables (such as `SetEnv` lines in Apache) override it. If your database isn't on port 3306, set `DB_PORT`, for example to `3307`.
4. Create the database, then load the tables and, if you want them, the sample products:
   ```sql
   CREATE DATABASE prambanan_batik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   ```bash
   mysql -u root prambanan_batik < schema.sql
   mysql -u root prambanan_batik < seed.sql   # optional sample data
   ```
5. Open `http://localhost/Prambanan_Batik/`.

> Don't commit credentials. `config.php` checks real environment variables first, then the gitignored `.env`, then its built-in defaults. `.env.example` is the template.

## Deploying to production

### 1. Set up the database (cPanel)

1. In **MySQL Databases**, create a database and a user, and give the user all privileges on it.
2. Run `schema.sql` in phpMyAdmin's SQL tab.
3. If you want the sample products, run `seed.sql` too.

### 2. Upload the files

Upload the whole project to `public_html` over FTP, keeping the folder structure.

### 3. Add your settings

You can either upload a `.env` file (same keys as `.env.example`) or set environment variables in the hosting control panel or VirtualHost. `.htaccess` stops anyone downloading `.env`, so only use the file on Apache with `.htaccess` turned on. Don't write credentials into `config.php`.

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

`BASE_URL` has to be the real public address. The site uses it for redirects, canonical and Open Graph URLs, `robots.txt` and the sitemap. If `BASE_URL` has no folder after the domain, `SITE_PATH` becomes empty and every link works without code changes.

The one line that doesn't follow `BASE_URL` is `ErrorDocument 404 /Prambanan_Batik/404.php` in `.htaccess`. Apache reads that path from the server's document root, so change it to `ErrorDocument 404 /404.php` when the site lives at the domain root.

### 4. Create the first admin

Nobody can sign up through the site, so add the first account by hand. Either run a one-off PHP script (and delete it afterwards):

```php
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', '$hash');
```

or, if you already have a bcrypt hash, use phpMyAdmin's SQL tab:
```sql
INSERT INTO admin_users (email, password_hash, created_at)
VALUES ('admin@example.com', '<bcrypt_hash_here>', NOW());
```

After that you can add admins, change their passwords and delete them in Admin → Admins (`/admin/admins.php`).

> Passwords use `password_hash()` and `password_verify()` (bcrypt, cost 12). Don't use `SHA2('password', 256)`.

## Files

```
/
├── index.php                    # Home page: hero + top-rated products
├── products.php                 # Collection, with a category filter loaded from the DB
├── product.php                  # Product page with reviews
├── go.php                       # Records a buy-button click, then redirects to the store
├── sitemap.php                  # XML sitemap (still works when the DB is down)
├── 404.php                      # Not-found page, used by .htaccess's ErrorDocument
├── terms.php                    # Terms of Use
├── privacy.php                  # Privacy Policy
├── favicon.ico                  # For browsers that ask for /favicon.ico directly (domain-root sites only)
├── robots.php                   # Builds robots.txt from BASE_URL (.htaccess serves it at /robots.txt)
├── config.php                   # Reads .env; defines BASE_URL, SITE_PATH, DB_* (including DB_PORT) and other settings
├── db_connect.php               # Returns a PDO connection, or null if the DB is unreachable
├── functions.php                # Helper functions and the preview-mode sample products
├── header.php                   # Shared page header and <head> tags
├── footer.php                   # Shared footer; loads main.js, which the animations need
├── schema.sql                   # CREATE TABLE statements
├── seed.sql                     # Sample categories, products, photos and reviews
├── .env.example                 # Template for .env
├── assets/
│   ├── css/styles.css           # Site styles (.reveal and .product-card start invisible until main.js shows them)
│   ├── js/main.js               # Scroll reveal, sticky header, photo loading and fallback, button spinners, progress bar (admin pages load it too)
│   ├── images/                  # og-image.png (social preview) and its HTML source, product-placeholder.svg
│   └── favicon/                 # favicon.svg (the source) plus exported ICO/PNG icons and site.webmanifest
└── admin/
    ├── admin.css                # Admin panel styles
    ├── auth.php                 # Sessions, CSRF tokens, login rate limiting
    ├── index.php                # Dashboard: counts and recent reviews
    ├── login.php                # Login form
    ├── logout.php               # Logs the admin out
    ├── admins.php               # Add and delete admins, change passwords
    ├── categories.php           # Add, edit and delete categories
    ├── products.php             # Product list
    ├── product_edit.php         # Add or edit a product
    ├── product_images.php       # Add and remove a product's photos (by URL)
    ├── import_products.php      # CSV import
    ├── reviews.php              # Review list; recalculates the product rating after a delete
    └── review_edit.php          # Add or edit a review; recalculates the rating on save
```

## Database

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| name | VARCHAR 255 | Unique |
| slug | VARCHAR 255 | Unique; used in the category filter URL |
| description | TEXT | |
| created_at / updated_at | TIMESTAMP | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| category_id | INT FK | Set to NULL if the category is deleted |
| sku | VARCHAR 255 | Unique; the CSV import matches on it |
| slug | VARCHAR 255 | Unique |
| name | VARCHAR 255 | |
| description | LONGTEXT | |
| price_display | DECIMAL(10,2) | Shown in rupiah (Rp) |
| rating_avg | DECIMAL(3,2) | Stored copy, recalculated whenever a review is added, edited or deleted |
| rating_count | INT | Same |
| buy_link_shopee / tokopedia / other | VARCHAR 500 | Store links |
| created_at / updated_at | TIMESTAMP | |

### `product_images`
Photo URLs with a `sort_order`. The photo with the lowest number is the product's main photo.

### `reviews`
`rating` is an INT from 1 to 5. Other columns: `reviewer_name`, `title` (shown above the review text), `content`, `reviewer_email` (never shown on the site), `verified_purchase` and `review_source`. Staff add reviews in the admin panel; visitors can't post them.

### `outbound_clicks`
One row per buy-button click: `product_id`, `platform`, `user_ip`, `user_agent` and `referrer`.

### `admin_users`
`email` (unique) and `password_hash` (bcrypt, cost 12).

### `login_attempts`
Failed admin logins by IP address (`ip_address`, `attempted_at`), used for the lockout. The site deletes rows older than a day whenever someone opens the login page or a login fails.

## URLs

| URL | What it is |
|-----|---------|
| `/` | Home page |
| `/products.php?category=<slug>` | Collection filtered to one category |
| `/product.php?id=<id>` | Product page |
| `/go.php?id=<id>&platform=<shopee\|tokopedia\|other>` | Buy-button redirect |
| `/sitemap.php` | XML sitemap |
| `/robots.txt` | Crawler rules, generated by `robots.php` |
| `/404.php` | Not-found page (also used for any unknown URL) |
| `/terms.php` | Terms of Use |
| `/privacy.php` | Privacy Policy |
| `/admin/` | Admin dashboard |
| `/admin/admins.php` | Admin accounts |

## CSV import

```
sku,name,price,description,category_id,image_url
BATIK-001,Parang Batik Cloth,350000,Hand-drawn parang pattern on cotton,1,https://example.com/img.jpg
```

`sku`, `name` and `price` are required. `description`, `category_id` and `image_url` are optional.

- A row with a new SKU creates a product. A row with an existing SKU updates that product's name and price, plus its description and category when those cells aren't empty.
- Write `price` in rupiah as digits only (`350000`). The import rejects `350.000`, so it can't end up as Rp 350.
- Header names can be any case, and Excel's "CSV UTF-8" format works as it is. Put double quotes around values that contain commas. The import skips any row whose column count doesn't match the header and tells you which one.
- New products get a slug from their name. If another product already uses it, the import adds `-2`, `-3` and so on.
- Importing the same file twice doesn't add a second copy of a photo the product already has.
- The import saves each row on its own. The summary lists every skipped row and why it was skipped.

## Security

- All queries use PDO prepared statements, and all output goes through `escape()` (`htmlspecialchars`).
- Passwords use bcrypt (`password_hash()`, cost 12). Login always runs `password_verify()`, against a dummy hash if the email doesn't exist, so a wrong email and a wrong password take the same time and nobody can probe for accounts.
- Every admin form, including the login form, carries a CSRF token, checked with `hash_equals()`.
- Each admin request checks that the account still exists, so a deleted admin is signed out on their next click.
- Admin pages send `X-Robots-Tag: noindex, nofollow`, so search engines skip them even without `robots.txt`.
- Five failed logins from one IP address within 15 minutes lock it out.
- Session cookies are `HttpOnly` and `SameSite=Lax`, plus `Secure` over HTTPS. The session ID changes at login, an idle session ends after 30 minutes, and logout clears the cookie.
- `go.php`, the photo form, the product buy links and the CSV import only accept URLs that start with `http://` or `https://`.
- Links that open in a new tab carry `rel="noopener noreferrer"`.
- Every response gets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `Content-Security-Policy` headers (and `Strict-Transport-Security` over HTTPS), from `config.php` and again in `.htaccess`.
- With `DEBUG_MODE` off, PHP errors go to the server log instead of the page. Admin pages log database errors and show a plain message, so visitors never see table names or SQL.
- `.htaccess` blocks direct access to `config.php`, `db_connect.php` and `functions.php`, to `.env`, `.sql`, `.log`, `.md`, `.bak` and lock files, and to every dot-file and dot-folder (`.git`, `.claude`, `.htaccess`) except `.well-known`. It also turns off directory listings and sends visitors to HTTPS everywhere except `localhost`.
- Admin forms read input with `post_string()`, so a crafted array field (`name[]=x`) counts as empty instead of crashing PHP 8.

### Recommendations

1. Serve the site over HTTPS. `.htaccess` already redirects to it outside local development.
2. Give the database user a strong password and keep it in `.env` or an environment variable, never in git.
3. Consider renaming the `/admin/` folder to something harder to guess.
4. Keep PHP up to date.
5. If `.env` ever reached this repository's git history, treat its values as leaked and change them. `git rm --cached` doesn't remove a file from history; `git filter-repo` or BFG Repo-Cleaner does.
6. The `Content-Security-Policy` allows `'unsafe-inline'` scripts and styles because a few admin pages use inline `<script>` and `<style>` blocks. Moving those into files (or using nonces) would let you tighten it.
7. Check the server error log now and then.

## Troubleshooting

**The site can't connect to the database.** Check `.env` or your environment variables, including `DB_PORT` if your database isn't on 3306. Make sure MySQL is running and the user has privileges on the database. While the database is down, the admin panel shows a "can't reach the database" page (HTTP 503) and the public site switches to preview mode.

**The site shows old code.** Make sure the web root points at this folder (a junction or symlink), not an old copy of it.

**Admin login fails.** Check that the password hash came from `password_hash()` (bcrypt), not SHA2. See [Create the first admin](#4-create-the-first-admin).

**Admin login is locked.** Someone (you or a bot) failed five times in 15 minutes. Wait 15 minutes, or clear the table with `DELETE FROM login_attempts;`.

**Products or text are invisible.** `footer.php` has to load `main.js`, because `.reveal` and `.product-card` elements start at `opacity: 0` until the script shows them. Check that `footer.php` ends with `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`. Visitors with JavaScript turned off still see everything, thanks to a `<noscript>` rule in `header.php`.

**"Not Found" after logging in or another redirect.** If the site lives in a folder such as `localhost/Prambanan_Batik`, `BASE_URL` has to include that folder. PHP redirects use `BASE_URL` and HTML links use `SITE_PATH`.

**There's a preview-mode banner.** The site shows sample products when the database is unreachable or has no products, with the banner "Preview mode: we can't load our products right now, so these are sample items." Check the database settings, or add products. An empty category doesn't trigger this; it shows "No batik here yet" instead.

**The admin panel has no menu on my phone.** Reload the page: below 768px the menu is a row of links across the top that you can swipe sideways. If it's still missing, your browser has an old `admin.css` cached; the `?v=` number on the stylesheet link should change after an update.

**A rating looks wrong.** The site recalculates `rating_avg` and `rating_count` every time a review changes. To recalculate them all by hand:
```sql
UPDATE products p SET
    rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id);
```

**The CSV import skipped rows.** The summary lists each skipped row and the reason. The usual causes are prices written as `350.000` (write `350000`), a `category_id` that doesn't exist (the import page lists the valid ones), a comma inside a value that isn't wrapped in quotes, or a file over 5 MB.

**The sitemap has no products.** Either there are no products yet or the site can't reach the database. The sitemap still lists the fixed pages.

## Maintenance

- Weekly: check disk space and the error log.
- Monthly: back up the database (phpMyAdmin → Export) and the files.
- Every few months: check the PHP version, when the SSL certificate expires, and the security settings.

## License

Proprietary and confidential. All rights reserved.

## Version history

- **v2.12.0** (2026-10-20): Design pass (UI/UX Pro Max, taste-skill redesign-existing-projects, Frontend Design and Emil Kowalski skills). This was fixes, not a redesign: the colours and fonts stay.
  - Admin on phones: the sidebar used to collapse to nothing below 768px, leaving no way to move between pages. It's now a row of links across the top that scrolls sideways and shows the current page. The products table used to push the whole page sideways; tables now scroll inside their card.
  - The admin Reviews list, product image grid and CSV import page had about 40 classes with no styles at all, so they showed as raw HTML (full-size photos, a bare file input). They're styled now, and the file picker is a drop zone with an upload icon instead of an emoji.
  - Added an "Add review" button. Nothing linked to the add-review form before.
  - Contrast: buttons and the category select were white on gold (2.8:1) and now use espresso text. Muted text, the review dates, breadcrumbs, footer text, dashboard numbers and the preview banner were all below AA and are fixed. A script checked every public and admin page.
  - One `<h1>` per page: the site name was the only `<h1>` (twice on product pages), and page titles were `<h2>`. Heading levels no longer skip.
  - Keyboard: a skip link on every page, one visible focus ring everywhere (the category select used to remove it), `aria-current` on navigation, and keyboard focus inside a product card lifts it like a hover.
  - Touch: buttons, nav, pagination, footer and breadcrumb links are 44px tall on touch screens. Selects and inputs are 16px on phones so iOS doesn't zoom. Hover effects only apply with a mouse, so phones don't get stuck hover states.
  - Motion: one strong ease-out curve, 160 to 200ms for feedback and 400ms for the scroll reveal (it was up to 600ms). No more `transition: all`, and the photo zoom on the product page is gone. Reduced-motion users get plain fades.
  - Star ratings are drawn stars filled to the exact rating, labelled "Rated 4.5 out of 5" for screen readers, instead of ★/◐ text characters.
  - Screen readers hear the product name after each "View" link and "(opens in a new tab)" on store links.
  - On phones the public header is no longer pinned (it took about 125px of the screen) and section spacing is tighter.
  - Category tags are sentence case instead of small uppercase pills. The pale-gold "Legal" label on the Terms and Privacy pages is gone (it was 1.6:1 on cream). SKUs and prices in the admin table no longer break across lines.

- **v2.11.0** (2026-10-15): Writing pass
  - Rewrote every piece of visitor-facing text with the Humanizer and Stop Slop skills, in a plain, friendly shop voice: page copy, meta descriptions, the tagline, buttons, the preview banner, the 404 page, the footer and the social preview image (`og-image.png`, re-rendered).
  - Rewrote the Terms of Use and Privacy Policy in plain English, keeping the same promises. The privacy policy says failed-login records last about a day; to make that true, the site now also clears old rows each time someone opens the login page.
  - Rewrote the admin panel's messages so they say what happened and what to do next ("Your session expired. Reload the page and try again."). Headings and buttons are now in sentence case.
  - Renamed three sample products to match their photos (Parang Sogan Batik Cloth, Pekalongan Batik Wrap Skirt, Long-Sleeve Batik Shirt). Rewrote all sample descriptions and reviews without invented claims such as "master artisans" or "limited edition".
  - Renamed the sample category "Premium Collection" to "Batik Tulis" (slug `batik-tulis`).
  - The hero heading and subtitle use `text-wrap: balance`, so a short last word like "hand" doesn't sit alone on its own line.
  - Rewrote this README and `CLAUDE.md` in the same style, and removed every em dash from the project.

- **v2.10.0** (2026-09-30): Bug fixes and polish, tested against a real local database
  - `config.php` now reads `.env` (nothing did before), and there's a new `DB_PORT` setting.
  - Added Open Graph and Twitter Card tags, canonical URLs and a branded `og-image.png`. Product pages share their own photo.
  - `.htaccess` now caches assets: CSS and JS for a year (each link carries `?v=<file time>` from `asset_url()`), images and icons for 30 days.
  - `robots.php` now builds `robots.txt` from `BASE_URL`. The old static file pointed its sitemap at `example.com`. It also blocks `go.php`.
  - Unknown product IDs now get a real 404 instead of a fake sample product. Empty categories show an empty state, and the category filter works in preview mode.
  - Products without a photo, or with a dead photo link, show a placeholder. The admin's alt text is used on the product page. The sample photos are now free Unsplash photos that show batik (the old ones were unrelated stock photos, and one link was dead).
  - Moving a review to another product now recalculates both products' ratings. Review titles appear on the site, line breaks are kept, and "1 review" is singular. `seed.sql` now calculates ratings from its own reviews.
  - Admin: a friendly 503 page when the database is down, CSRF on the login form, deleted admins signed out at once, an XSS fix in the delete-admin popup, forms that keep your input after an error, clearer messages, automatic slugs, photo deletes limited to their product, the 72-character bcrypt limit, and "not found" messages instead of false successes.
  - Rewrote the CSV import. It now handles Excel's byte-order mark, mixed-case headers, long lines, rows with the wrong number of columns (which used to crash it), `350.000` prices, unknown categories and duplicate names, and it no longer adds duplicate photos.
  - `.htaccess` blocks every dot-folder (such as `.claude/`), not just `.git`. Admin pages send `X-Robots-Tag: noindex`.
  - Visitors without JavaScript can see the content.
  - Corrected the privacy policy (staff add the reviews, and the site uses Google Fonts and outside image hosts). The legal pages show a fixed "Last updated" month.
  - Removed leftover Bolt.new files (`.bolt/`, an empty `package-lock.json`).

- **v2.9.0** (2026-09): Favicon set
  - Added `assets/favicon/`: a four-petal batik icon in the site's espresso and copper-gold colours, with `favicon.svg` as the hand-made source.
  - Exported `favicon.ico` (16/32/48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, `safari-pinned-tab.svg` and `site.webmanifest` from it.
  - `header.php` links the full set on public pages. Admin pages link three of them (SVG, ICO, apple-touch-icon).
  - Put a copy of `favicon.ico` in the project root for browsers that request it directly (this only helps when the site is at the domain root).

- **v2.8.0** (2026-09): Terms of Use and Privacy Policy
  - Added `terms.php` and `privacy.php`, using the same header and footer as the other pages.
  - `privacy.php` lists what the code collects: reviews, buy-button clicks from `go.php`, and the session cookie.
  - Added the `CONTACT_EMAIL` setting for both pages' contact links.
  - Linked both pages from the footer and added them to the sitemap.

- **v2.7.0** (2026-09): Loading feedback
  - Added a progress bar across the top of the page for link clicks and form submits (`initNavProgressBar` in `main.js`). Every page change is a full reload, so the bar never has to finish.
  - Product photos shimmer until they load, then fade in (`initImageLoading`).
  - Submit buttons disable themselves and show a spinner (`initFormLoadingStates`), including delete buttons in the admin panel.
  - Admin pages now load `main.js` too.
  - The category filter submits with `requestSubmit()` instead of `submit()`, so the progress bar sees it.

- **v2.6.0** (2026-09): Page titles and descriptions
  - Each page sets `$page_title` and `$meta_description` before `header.php` prints them. Pages that don't set a description fall back to `DEFAULT_META_DESCRIPTION`.
  - The collection page's title and description follow the selected category.
  - A product page's description comes from the product text (cut to about 155 characters), or from its name and category when there's no text.

- **v2.5.0** (2026-09): 404 page
  - Added `404.php`, styled like the rest of the site and sent with a real 404 status.
  - `.htaccess` serves it for unknown URLs with `ErrorDocument 404`. Change that path when you deploy to the domain root.

- **v2.4.0** (2026-09): Security pass
  - `config.php` sends security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`) on every request.
  - Added `.htaccess`: HTTPS in production, blocked access to internal PHP files and to `.env`, `.sql`, `.log`, `.md` and lock files, no directory listings.
  - Session cookies became `HttpOnly`, `SameSite=Lax` and `Secure` over HTTPS. The session ID now changes at login, and logout clears the cookie.
  - Admin login always runs `password_verify()`, so it takes the same time whether or not the email exists.
  - Buy links and the CSV `image_url` column only accept `http(s)://` URLs, like `product_images.php` and `go.php` already did.
  - Added `rel="noopener noreferrer"` to links that open a new tab.
  - Admin pages stopped printing raw database errors; they log them instead.
  - Removed `.env` from git tracking. It held an unused key from the Bolt.new/Vite template; see Recommendations about git history.

- **v2.3.0** (2026-06): Security, dashboard and bug fixes
  - Removed the hard-coded database password from `config.php`.
  - Added the login lockout (5 attempts per IP per 15 minutes) and the `login_attempts` table.
  - Added CSRF protection to the CSV import form.
  - `product_images.php` only accepts `http(s)://` URLs.
  - Ratings recalculate on every review add, edit and delete.
  - Rebuilt the dashboard with count cards and a recent-reviews table.
  - `product.php` binds its `LIMIT` with `bindValue(PDO::PARAM_INT)`.

- **v2.2.0** (2026-06): Admin accounts page, paths and animations
  - Added `admin/admins.php` for adding and deleting admins and changing passwords.
  - Added `SITE_PATH`, so links work whether the site is in a folder or at the domain root.
  - `footer.php` loads `main.js`, which makes the scroll animations and product cards show up.
  - Added the Admins link to every admin sidebar.
  - Changed the default `BASE_URL` to `http://localhost/Prambanan_Batik`.

- **v2.1.0** (2026-06): Security and bug fixes
  - CSRF protection on all admin forms (checked with `hash_equals()`).
  - 30-minute idle timeout for admin sessions.
  - `go.php` checks redirect targets.
  - The preview banner shows when the database goes down.
  - The category filter reads categories from the database, with a fixed list in preview mode.
  - The admin panel shows prices in rupiah.
  - `truncate_text()` handles multibyte text (`mb_strlen`, `mb_substr`).
  - Categories can be edited (`?edit=<id>`).
  - `sitemap.php` works when the database is down.

- **v2.0.0** (2026): Rewrite
  - Moved to PDO.
  - Prambanan Batik branding.
  - Admin panel with CSV import.

- **v1.0.0** (2024): First release
