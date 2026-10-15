# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project overview

Prambanan Batik is a PHP/MySQL catalog of Indonesian batik with customer reviews. Visitors buy through Shopee or Tokopedia links. There's no build step: plain PHP on Apache (XAMPP/WAMP locally, shared hosting in production).

## Working agreement

- **The owner commits and pushes himself.** Never run `git commit` or `git push`, and don't offer to. Leave changes in the working tree and list the changed files at the end. He often commits during a session, so check `git status` before calling anything "uncommitted".
- **Docs are part of every change.** In the same turn, update this file, `README.md` (features, setup, troubleshooting, and a Version history entry) and the Claude memory notes. When setup or run details change, also update the project summary in the root `C:\CSIE\My Projects\CLAUDE.md`.
- **Test for real.** Run changes against the local database and look at them in the browser (see Local development). Reading the code isn't enough.

## Writing style

On 2026-10-15 the owner had all visitor-facing text, the admin messages and both docs rewritten with the Humanizer and Stop Slop skills. Keep new text in the same style.

- Visitor-facing text (pages, meta descriptions, banners, the social image) uses a plain, friendly shop voice: "we", everyday words, short sentences. No hype words such as authentic, premium, exquisite, vibrant, stunning, masterpiece, seamless or "trusted".
- Admin messages say what happened and what to do next, as full sentences with a full stop: "Your session expired. Reload the page and try again.", "We couldn't find that product.", "Category saved." Don't add "successfully".
- Headings, buttons and labels use sentence case ("Batik collection", "Save product", "Log out"). "Log in" and "Log out" are verbs; "login" is only a noun. "Terms of Use" and "Privacy Policy" keep capitals because they're document names.
- No em dashes anywhere: pages, admin, code comments or docs. Use a comma, a colon, parentheses or a new sentence.
- Don't make claims nobody has confirmed. The site doesn't know who makes the batik, how it's made or where it comes from, so sample text describes the style of each piece ("batik tulis is drawn with a canting") and never invents "master artisans", "limited edition" or "verified" reviews.
- The legal pages are plain English, but their promises are binding. Don't change what they promise without changing the code to match, and the other way round. When their wording changes, bump the hard-coded "Last updated" month.
- The sample products (`get_sample_batik_products()` in `functions.php` and `seed.sql`) are named and described to match their photos. If you swap a photo, check the name and description still fit.

## Still to do

Check here first when you start a session on this project.

- **`CONTACT_EMAIL` is still the placeholder** (`hello@prambananbatik.com`). The owner hasn't given a real address yet. Set it with the `CONTACT_EMAIL` env var or `.env` before production.
- **The sample photos are stock images.** They're free Unsplash photos that show real batik, chosen and checked by eye on 2026-09-30 (the old Pexels URLs were unrelated photos plus one dead link). The owner's real product photos should replace them. If you ever pick other stock photos, avoid `plus.unsplash.com`, which needs a paid Unsplash+ licence.
- **Deploying.** Set `BASE_URL` to the real domain (it drives canonical and Open Graph URLs, `robots.txt` and the sitemap), and switch `.htaccess`'s `ErrorDocument 404` to `/404.php` at the domain root.
- **Logout is a GET link** (`admin/logout.php`, linked twice on every admin page). That's a low-risk logout CSRF, left alone on purpose. Fixing it means a small POST form with a CSRF check on every admin page.

History: the 2026-09-30 bug-fix pass (README v2.10.0) is committed. It was tested against a real local database with a 67-check scripted run of every admin and public flow, a database-down run, an empty-catalog run and browser checks. The 2026-10-15 writing pass (README v2.11.0) followed.

## Local development

1. Install XAMPP or WAMP and start Apache and MySQL.
2. Copy `.env.example` to `.env` and fill in the credentials, or set `SetEnv` lines in the Apache config. **Don't hard-code credentials in `config.php`.** `config.php` parses `.env` itself (no library) into `$_ENV`, and `config_env($key, $default)` looks for a real env var first, then `.env`, then the default. It deliberately doesn't use `putenv()`, which isn't thread-safe under XAMPP's threaded Apache. `DB_PORT` is supported and defaults to 3306.
3. Create the database and load the schema:
   ```sql
   CREATE DATABASE prambanan_batik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   ```bash
   mysql -u root prambanan_batik < schema.sql
   mysql -u root prambanan_batik < seed.sql  # optional sample data
   ```
4. Open `http://localhost/Prambanan_Batik/`.

**This PC's setup (as of 2026-10-15):**
- `C:\XAMPP\htdocs\Prambanan_Batik` is a directory junction to this project folder. It used to be a stale June 6 copy, which is why `http://localhost/Prambanan_Batik/` showed none of the September work. That copy is kept at `C:\XAMPP\htdocs\Prambanan_Batik.bak-2026-06-06`.
- The database is XAMPP MariaDB on **port 3307**. The `MySQL80` Windows service owns 3306 and rejects `root` without a password. The database is `prambanan_batik` and the user is `prambanan_dev`; the credentials are in the gitignored `.env` (`DB_HOST=127.0.0.1`, `DB_PORT=3307`).
- If `prambanan_dev` gets "Access denied", run `CHECK TABLE mysql.db;` first. That grants table was corrupt and lost grants on every MariaDB restart until it was repaired on 2026-10-15.
- A local-only test admin's login is in `.env` as `LOCAL_ADMIN_EMAIL` / `LOCAL_ADMIN_PASSWORD`.
- You may need to start XAMPP's MariaDB and Apache from the XAMPP Control Panel.
- XAMPP's `php.ini` hides `E_DEPRECATED`. For a strict check, run PHP's built-in server with `-d error_reporting=-1` and set `BASE_URL=http://localhost:<port>` as a real env var, so links resolve at the root (a real env var beats `.env`).
- `.claude/launch.json` attaches the preview to Apache on port 80. The old `php -S localhost:8091` setup was broken because every link pointed at `/Prambanan_Batik/...`.

To create the **first** admin (nobody can log in until one exists), use a one-off PHP script or insert directly:

```php
$hash = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);
// INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', '$hash');
```

After that, manage admins in **Admin panel → Admins** (`/admin/admins.php`).

Always use `password_hash()` / `password_verify()` (bcrypt, cost 12). Never SHA2.

There's no committed test suite and no linter.

## Architecture

### Request flow

Every public page follows the same pattern:
```
require config.php → require functions.php → $db = require db_connect.php → query DB → include header.php → HTML output → include footer.php
```

`db_connect.php` returns `$pdo` via `require` (not `include`), so callers write `$db = require __DIR__ . '/db_connect.php'`. When the database is unreachable it returns `null`, and pages must handle `$db === null`.

`footer.php` includes `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`. Don't remove it: CSS starts `.reveal` and `.product-card` at `opacity: 0`, and `main.js` adds `is-visible` through an IntersectionObserver to show them. `header.php` has a `<noscript><style>` override so the content still shows with JavaScript off.

**Static asset URLs.** Link the site's own CSS and JS with `asset_url('assets/...')` (`functions.php`), which returns `SITE_PATH` + path + `?v=<filemtime>`. `.htaccess` caches `.css` and `.js` for a year (`immutable`), so a link without the version would serve a stale file after a deploy. Admin pages link `admin/admin.css` and `main.js` the same way. Images and icons have no version and get 30 days.

### Preview mode

Pages fall back to the sample data in `get_sample_batik_products()` (`functions.php`) and set `$_ENV['PREVIEW_MODE'] = true` before including `header.php` **only** when:
- `$db` is null or a query throws, or
- the `products` table is empty (checked with `SELECT 1 FROM products LIMIT 1`).

`is_preview_mode()` checks the `PREVIEW_MODE` constant and `$_ENV['PREVIEW_MODE']`, so the banner in `header.php` ("Preview mode: we can't load our products right now, so these are sample items.") appears when the database goes down at runtime.

A category with no products, or a page number past the end, is **not** preview mode: `products.php` shows an `.empty-state` block instead. In preview mode, `products.php` applies the category filter to the sample data (`slugify($sample['category'])` matches the database slugs).

`product.php` with an unknown `id` `require`s `404.php` and exits, so the status is a real 404. The exception is preview mode, where sample ids 1 to 8 resolve to sample products, because the preview cards link to them.

### Titles and descriptions: `$page_title` and `$meta_description`

Every public page sets `$page_title` and `$meta_description` **before** `include header.php`, which prints them as `<title>{title} - Prambanan Batik</title>` and `<meta name="description">`. Without `$meta_description`, `header.php` falls back to `DEFAULT_META_DESCRIPTION` (`config.php`). Real content pages should always set their own.

- `index.php`: fixed text.
- `products.php`: follows the `category` query param, matched against `$categories_for_filter`. It falls back to a general "Batik collection" description with no filter. Set these **after** `$categories_for_filter` is filled (order matters), just before the `header.php` include.
- `product.php`: `truncate_text($product['description'], 155)` when there's a description, otherwise a sentence built from the name and category.
- `404.php`: fixed text.

**Rule:** a new public page sets both `$page_title` and `$meta_description` before including `header.php`.

### Social previews: Open Graph, Twitter Card, canonical

`header.php` reuses the title and description for `og:title`, `og:description` and the `twitter:*` tags. It also reads three optional page variables, all set before `include header.php`:

- `$canonical_url`: an absolute URL built from `BASE_URL`. When it's set, `header.php` prints `<link rel="canonical">` and `og:url`. Every indexable page sets it: index, products (keeping only a recognised `category` and a `page` above 1), product, terms and privacy. `404.php` deliberately doesn't.
- `$og_image`: defaults to `SITE_PATH . '/assets/images/og-image.png'`. `product.php` sets it to the product's own photo when there is one. It goes through `absolute_url()` because crawlers need absolute URLs.
- `$og_type`: defaults to `website`; `product.php` sets `product`.

`assets/images/og-image.png` (1200×630) is a headless-Edge screenshot of `assets/images/og-image-source.html`. The exact command is in the comment at the top of that file; run it again after you edit the HTML. The image uses the favicon's colours and kawung motif.

**Rule:** a new public content page sets `$canonical_url = BASE_URL . '/page.php';` next to `$page_title` and `$meta_description`.

### Product images: placeholder and dead-link fallback

Render product images with `product_image_url($url)`, which returns the local `assets/images/product-placeholder.svg` when the URL is empty, and add `data-fallback="<?php echo SITE_PATH; ?>/assets/images/product-placeholder.svg"`. If the external URL fails to load, `initImageLoading()` in `main.js` swaps to `data-fallback` once, so a dead image host shows the placeholder instead of a broken-image icon.

The first image by `ORDER BY sort_order, id` is the product's main photo, and the detail page uses its `alt_text` when set.

### Favicon set: `assets/favicon/`

The icon is a four-petal "flower" (a simple batik kawung motif) in the site's colours: espresso background (`#2a1a0e`), copper-gold petals (`#c4872c`) and a pale-gold centre dot (`#e8c47a`). **`assets/favicon/favicon.svg` is the hand-written source.** It's plain SVG (four `<ellipse>`s rotated 0/90/180/270 around a centre `<circle>`), so any text or vector editor can change it.

Every raster file in that folder (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`) is an export of the same design. If you change the SVG, re-export them at each size from a vector tool; the repo has no tooling for it. `safari-pinned-tab.svg` is a black-on-transparent copy of the same shapes for Safari's `mask-icon`. Safari recolours it from the `color` attribute on the `<link>` tag, so its own fill doesn't matter.

`header.php` links the full set on every public page: SVG first, then ICO and PNG fallbacks, `apple-touch-icon`, `mask-icon`, `site.webmanifest` and a `theme-color` meta tag. Each `admin/*.php` page has its own `<head>` (not `header.php`) and links only the SVG, ICO and `apple-touch-icon`, because the admin panel needs no manifest or mask icon (and `robots.txt` blocks it anyway). A plain copy of `favicon.ico` sits in the project root for browsers that ignore `<link>` tags and ask for `/favicon.ico`. That only helps at the domain root, the same caveat as the `404.php` `ErrorDocument` path.

**Rule:** a new admin page copies the same three favicon `<link>` lines (SVG, ICO, apple-touch-icon) as the other `admin/*.php` heads.

### Legal pages: `terms.php` and `privacy.php`

Static pages with the same `header.php`/`footer.php` flow as the other public pages (no `$db`, no preview mode). `footer.php` links them twice, in its "Links" list and in the `.footer-legal-links` row beside the copyright, and `sitemap.php` lists them.

The "What we collect" section of `privacy.php` describes what the code stores:
- Customer reviews (`reviews` table). **Staff enter these in the admin panel; there's no public review form**, and the policy says so.
- Buy-button clicks (`outbound_clicks`: product, platform, IP, user agent, referrer), written by `go.php`.
- The session cookie that `config.php` sets.
- Requests to Google Fonts and outside image hosts.

Its "How long we keep it" section promises that failed-login records are cleared once they're a day old. `isLoginRateLimited()` (every login page view) and `recordFailedLoginAttempt()` both delete `login_attempts` rows older than a day to keep that true.

**Rule:** if a change adds a new kind of personal data, a cookie or tracking, update `privacy.php` in the same change, so the policy never drifts from the code.

Both pages use the `CONTACT_EMAIL` constant (`config.php`, overridable like `BASE_URL`) for their contact links. Change the env var at deploy time rather than editing the pages.

### Loading feedback: `main.js` serves public and admin pages

`footer.php` loads `assets/js/main.js` on every public page, and every `admin/*.php` page includes it directly (`<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>`) just before any page-specific inline `<script>`. Its public-only init functions (`initHeader`, `initScrollReveal`, `initProductCards`, `initSelectMenus`) all check for selectors that admin pages don't have, so they do nothing there.

Three behaviours live in `main.js`:
- `initImageLoading()` adds `is-img-loading` to `.product-image` and `.product-image-section` containers (shimmer CSS) until their `<img>` fires `load` or `error`, then adds `img-loaded` to fade it in. On `error` it first swaps to the img's `data-fallback` URL, once (see Product images). It works off selectors, so a new product image block needs no JS changes as long as it uses one of those container classes and carries `data-fallback`.
- `initFormLoadingStates()` disables a form's submit button and adds `is-loading` (a spinner via `::after`) on `submit`. It waits a tick (`setTimeout(fn, 0)`) so the browser has already captured the clicked button's value. That's also why admin delete buttons (`onclick="return confirm(...)"`) get a spinner: `confirm()` runs first, and if you cancel, no `submit` event fires. When the page comes back from the back/forward cache (`pageshow` with `persisted`), `initNavProgressBar` re-enables any `.is-loading` buttons.
- `initNavProgressBar()` appends one fixed `.nav-progress-bar` div to `<body>` and grows it toward 100% (never to it) on same-tab link clicks and form submits. Every navigation is a full page reload, so the bar never has to finish.

**Rule:** the `.btn.is-loading` and `.nav-progress-bar` CSS exists **twice**: in `assets/css/styles.css` (public, `--color-*` variables) and in `admin/admin.css` (admin, `--admin-*` variables), because the two stylesheets don't share `:root` variables. `admin/login.php`'s `.btn-login` doesn't use the shared `.btn` class, so its inline `<style>` has its own `.btn-login.is-loading` rule. When you restyle buttons or the progress bar, change all three.

The category `<select>` on `products.php` is submitted **only** by `initSelectMenus()` in `main.js`, using `form.requestSubmit()` (or `.submit()` as a fallback). `.submit()` doesn't fire a `submit` event, so the progress bar wouldn't start. An old inline `onchange="this.form.submit()"` double-submitted; it's gone, and a `<noscript>` Filter button covers visitors without JavaScript.

### URLs: `SITE_PATH` and `BASE_URL`

Two constants build every URL:

| Constant | Use | Local example | Production (domain root) |
|----------|-----|---------------|--------------------------|
| `SITE_PATH` | HTML `href` and `src` | `/Prambanan_Batik` | `` (empty) |
| `BASE_URL` | PHP `header('Location: ...')` redirects | `http://localhost/Prambanan_Batik` | `https://yourdomain.com` |

`SITE_PATH` comes from `rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/')`. At the domain root it's empty, so `href="<?php echo SITE_PATH; ?>/page.php"` links work without code changes.

**Rule:** prefix every HTML `href`/`src` with `SITE_PATH` and use `BASE_URL` for every PHP redirect. Never hard-code `/admin/...` or `/assets/...`.

`.htaccess`'s `ErrorDocument 404 <path>` is the exception. Apache resolves it from the server's DocumentRoot, not this folder, and it can't read `SITE_PATH`, so keep it in step with `BASE_URL`'s path by hand: `/Prambanan_Batik/404.php` locally, `/404.php` at the domain root in production.

`robots.txt` isn't a static file. `.htaccess` rewrites `robots.txt` to `robots.php`, which builds the `Disallow` paths (`/admin/`, `/go.php`) from `SITE_PATH` and the `Sitemap:` line from `BASE_URL`. The old static file pointed at `example.com`. Crawlers only read it at the domain root. PHP's built-in server ignores `.htaccess`, so request `/robots.php` directly there.

When you need an absolute URL from a `SITE_PATH` one, use `absolute_url()` (`functions.php`), which adds `BASE_URL`'s origin.

### Admin authentication

Every admin page starts with the same block:

```php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireDatabase($pdo);
requireAdminLogin($pdo);
```

- `requireDatabase($pdo)` shows a small 503 "can't reach the database" page and exits when `$pdo` is null. Admin pages call `$pdo->prepare()` unguarded, and on PHP 8 that throws an uncaught `Error`, not an `Exception`. `login.php` calls it too.
- `requireAdminLogin($pdo)` redirects to `BASE_URL . '/admin/login.php'` when the session isn't valid. Given `$pdo`, it also checks that `admin_users` still has the signed-in id and refreshes the email, so a deleted admin is signed out on their next request.

The session lives under the name `product_hub_session` with a **30-minute idle timeout**, refreshed on each signed-in request by `isAdminLoggedIn()`. On timeout, `isAdminLoggedIn()` unsets the admin keys and regenerates the session id instead of calling `session_destroy()`. Destroying the session dropped the CSRF token that `login.php` generates right afterwards, so the first login after a timeout always failed.

`auth.php` also sends `X-Robots-Tag: noindex, nofollow` on every admin response.

Read POST fields with `post_string($key, $trim = true)` (`functions.php`), not `trim($_POST[...])`. It returns `''` for a missing field and for a crafted array (`name[]=x`), which would otherwise make `trim()` or `strlen()` throw a `TypeError` on PHP 8. Pass `$trim = false` for passwords. Read GET ids with `get_query_param('id', 0, FILTER_VALIDATE_INT)`.

**Login lockout.** `admin/login.php` allows **5 failed attempts per IP per 15 minutes**, tracked in `login_attempts`. `recordFailedLoginAttempt()` records a failure, and a successful login clears that IP's rows with `clearLoginAttempts()`. `admin/auth.php` defines `LOGIN_MAX_ATTEMPTS` (5) and `LOGIN_LOCKOUT_MINUTES` (15).

### CSRF protection

Every admin POST form carries a hidden `csrf_token` field, including the **login form**, which answers a bad token with "Your session expired. Try logging in again." Every POST handler calls `validateCsrfToken($_POST['csrf_token'] ?? '')` before doing anything, and shows an error and stops if it fails. Both helpers live in `admin/auth.php`:
- `generateCsrfToken()` prints the token value in the form.
- `validateCsrfToken($token)` runs at the top of each POST handler and compares with `hash_equals()`.

### Stored rating fields

`products.rating_avg` and `products.rating_count` are stored copies, so they have to be recalculated whenever a review is **added, edited or deleted**. `admin/review_edit.php` and `admin/reviews.php` use this query:

```sql
UPDATE products SET
    rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = products.id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id)
WHERE id = ?
```

For a delete, read the review's `product_id` **before** deleting it, then run the update.

When an edit **moves a review to another product**, recalculate both the new and the old product. `review_edit.php` does this in a transaction with its `recalculateProductRating()` helper. `seed.sql` ends with the same UPDATE, so the seeded ratings match the reviews it inserts (it used to hard-code made-up totals like 342 reviews).

### Key files

| File | Purpose |
|------|---------|
| `config.php` | Loads `.env` into `$_ENV`, defines `config_env()`, then every constant (`BASE_URL`, `SITE_PATH`, `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`, `ITEMS_PER_PAGE`, `SESSION_TIMEOUT`, `SITE_TAGLINE`, `DEFAULT_META_DESCRIPTION`, `CONTACT_EMAIL` and so on). Order: real env var, then `.env`, then the default. `DB_PASSWORD` defaults to `''`. |
| `db_connect.php` | Creates and returns a PDO connection (the DSN includes `port=DB_PORT`), or `null` on failure. |
| `functions.php` | Helpers: `escape()` (null-safe), `slugify()`, `format_currency()`, `get_pagination()`, `is_preview_mode()`, `truncate_text()` (multibyte-safe), `review_count_label()` ("1 review"/"2 reviews"), `asset_url()`, `absolute_url()`, `product_image_url()`, `post_string()`, `get_sample_batik_products()` and more. |
| `header.php` / `footer.php` | Shared page chrome. `header.php` prints the title, description, canonical, Open Graph and Twitter tags and the preview banner; `footer.php` loads `main.js`. |
| `robots.php` | Builds `robots.txt` (served through an `.htaccess` rewrite) from `SITE_PATH` and `BASE_URL`. |
| `assets/images/` | `og-image.png` and `og-image-source.html` (social preview), `product-placeholder.svg` (missing or dead product photo). |
| `assets/js/main.js` | Shared JS: scroll reveal, sticky header, avatar initials, the category filter's auto-submit and the loading feedback (`initImageLoading`, `initFormLoadingStates`, `initNavProgressBar`). Public pages load it through `footer.php`, and every `admin/*.php` page loads it directly. |
| `go.php` | Checks that the store URL starts with `http(s)://`, logs the click to `outbound_clicks`, then redirects. |
| `sitemap.php` | Builds the XML sitemap from the database; still works when `$pdo` is null. |
| `404.php` | Not-found page, styled like the rest of the site, sending a real 404 via `http_response_code(404)`. `.htaccess` uses it as `ErrorDocument 404`. |
| `terms.php` / `privacy.php` | Legal pages (see Legal pages). |
| `admin/auth.php` | Sessions (`loginAdmin`, `requireAdminLogin($pdo)`, `requireDatabase($pdo)`, `logoutAdmin`, `isAdminLoggedIn`), CSRF helpers (`generateCsrfToken`, `validateCsrfToken`) and the login lockout (`isLoginRateLimited`, `recordFailedLoginAttempt`, `clearLoginAttempts`). |
| `admin/admins.php` | Add and delete admins and change passwords. You can't delete yourself or the last admin. Passwords must be 8 to 72 bytes (bcrypt ignores anything past 72). The delete `confirm()` message goes through `json_encode` and then `htmlspecialchars`; `htmlspecialchars` alone inside a JS string was an XSS with an email containing `'`. |
| `admin/import_products.php` | CSV import, matching on SKU, one transaction per row. It strips a UTF-8 BOM and lower-cases headers, skips and reports rows whose column count doesn't match the header (`array_combine` used to crash), rejects `350.000`-style prices and unknown `category_id`s, gives duplicate names unique slugs with `uniqueProductSlug()`, and doesn't re-add an `image_url` the product already has. `fgetcsv` has no line-length limit. CSRF-protected. |
| `admin/product_edit.php` | Add or edit a product. Submitted values live in `$form`, so the form keeps what you typed after an error. A blank slug becomes the slugified name. Price range, category and duplicate SKU or slug are checked first, each with its own message. A new product redirects to `?id=<new>&created=1`. |
| `admin/categories.php` | Add, edit (`?edit=<id>`) and delete categories. Slugs go through `slugify()` (blank means "from the name"). A delete says how many products lost their category; the foreign key sets them to NULL, and public pages hide the empty category tag and breadcrumb. |
| `admin/review_edit.php` | Add or edit a review. Recalculates `rating_avg`/`rating_count` on save, for both products when a review moves. Checks the reviewer's email and that the product exists. |
| `admin/reviews.php` | Review list and delete; recalculates `rating_avg`/`rating_count` after a delete. |
| `admin/product_images.php` | A product's photo URLs (must start with `http(s)://`, 500 characters at most). Deletes are limited to `WHERE id = ? AND product_id = ?`. Updates `products.updated_at` so the sitemap's `lastmod` follows. |

### Database notes

- `products.rating_avg` and `products.rating_count` are stored copies, updated whenever a review changes rather than calculated per query. See the query above.
- The CSV import identifies products by `sku` (unique); `slug` is unique too.
- Every table uses `utf8mb4_unicode_ci`, so any Unicode text and emoji fit.
- Prices are stored and shown in **Indonesian rupiah**. Always use `format_currency()`, which prints `Rp X.XXX`. Never use a dollar sign.
- `login_attempts` drives the admin login lockout. Rows older than a day are deleted on every login page view and after every failed login.

### URL patterns

- `/products.php?category=<slug>` filters by category slug. Categories come from the database; the fixed list is used **only** in preview mode, not when the database just has no categories.
- `/product.php?id=<id>` is a product page with reviews. An unknown id gets a 404; a missing or non-numeric id redirects to `/products.php`.
- `/robots.txt` is generated by `robots.php`.
- `/go.php?id=<product_id>&platform=<shopee|tokopedia|other>` logs a click and redirects.
- `/terms.php` and `/privacy.php` are the legal pages.
- `/admin/admins.php` manages admin accounts.

### Security patterns to follow

- Use PDO prepared statements for every query. Never build SQL by string interpolation.
- Pass all output through `escape()` (`htmlspecialchars`, ENT_QUOTES, UTF-8).
- Every admin POST handler calls `validateCsrfToken()` first.
- Check any redirect target that comes from the database or user input (for example `preg_match('/^https?:\/\//')`) before sending a `Location:` header.
- Check image and file URLs that admins submit with `preg_match('/^https?:\/\//')` before saving them.
- File uploads: check the `finfo` MIME type and an extension allow-list with `is_valid_image_upload()`.
- A new admin page:
  - starts with the standard include block (config, functions, db_connect, auth, then `requireDatabase($pdo); requireAdminLogin($pdo);`; see Admin authentication);
  - puts a CSRF token in every form and reads POST fields with `post_string()`;
  - uses `SITE_PATH` for links and `BASE_URL` for PHP redirects;
  - gets added to the sidebar on every admin page;
  - links `asset_url('admin/admin.css')` in its `<head>` and copies the three favicon `<link>` lines (see Favicon set);
  - includes `<script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>` before `</body>`, ahead of any page-specific inline `<script>`, so its buttons get the spinner and the progress bar runs.
- A value going into an inline JS handler (`onclick="…"`) must be encoded with `htmlspecialchars(json_encode($value), ENT_QUOTES, 'UTF-8')`. `htmlspecialchars` alone isn't enough, because the browser decodes the entities before the JS runs.
- Check lengths against the column sizes (`VARCHAR(255)`, `VARCHAR(500)`) before inserting. The local XAMPP MariaDB runs in non-strict mode and silently cuts long values, but a strict production MySQL rejects the insert.
- Code that writes reviews must recalculate `rating_avg`/`rating_count` with the query in `admin/review_edit.php`.
