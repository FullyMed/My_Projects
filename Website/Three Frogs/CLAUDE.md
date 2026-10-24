# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project overview

Three Frogs is a static HTML and PHP website for a boardgame café in Surabaya, Indonesia. Visitors browse the games, create accounts and book tables.

Live domain: `threefrogsboardgame.com`, hosted on Hostinger.

## Pending before deploy (as of 2026-10-22)

Nothing from 2026-09-29 onward is live. That covers the security hardening, 404 page, loading states, legal pages and image compression, plus the 2026-09-29 fix pass, the 2026-10-15 improvement pass (email verification, staff page, booking limits), the writing pass after it, the 2026-10-19 design pass and the 2026-10-22 asset version tags. All of it passes `bash tests/run-tests.sh` (239 checks) and a browser run-through on the local database at desktop and phone widths.

Do the production steps in this order. Tick them off or delete them once they're done.

- [ ] 1. Check that production `bookings` has an `id` column (`SHOW COLUMNS FROM bookings;` in phpMyAdmin). If not, run `ALTER TABLE bookings ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;`.
- [ ] 2. Run `Data/schema.sql` on the production database (phpMyAdmin → SQL). It only creates missing tables, such as `rate_limits`, `password_reset_tokens` and `email_verification_tokens`. If `password_reset_tokens` is missing today, forgot-password is already broken on the live site.
- [ ] 3. Run `Data/migrations/2026-10-15-verification-and-staff.sql` exactly once. It adds `users.email_verified_at` and `users.is_staff` and marks every existing account as verified, so nobody suddenly loses the ability to book. Its `ADD COLUMN` lines fail if you run it twice.
- [ ] 4. Upload every changed file to Hostinger straight after step 3 (see the Deployment section of README.md). Don't upload the local `Assets/PHP/db_config.php` (production has its own; a copy lives at `C:\CSIE\db_config.hostinger.php`) or the `tests/` folder.
- [ ] 5. Make staff accounts with `UPDATE users SET is_staff = 1 WHERE email = '...';`. The "Staff" navbar link appears after they log out and back in. `Staff.html` itself works for them immediately.
- [ ] 6. On the live site, check that all four email types arrive: sign up a test account (verification), book (confirmation), reset a password, and cancel a booking from the Staff page (cancellation notice). Check spam. If they land there, the `noreply@threefrogsboardgame.com` sender may need SPF/DKIM in Hostinger. New signups can't book until the verification email arrives, so this matters.
- [ ] 7. Have a lawyer review `Terms-of-Use.html` and `Privacy-Policy.html` before anyone treats them as final. They describe the site accurately but haven't been checked against Indonesia's UU PDP or any other law.

Known gap, not fixed: a password reset doesn't end the account's other sessions. Sessions are plain PHP sessions with no per-user "log out everywhere" marker. That matters most if an attacker was already logged in. Add something like a `users.session_version` checked on each request before relying on reset as account recovery.

### Next steps (as of 2026-10-23)

Everything above is committed. What's left, in order:

1. The owner deploys, following the checklist above.
2. After deploying, test on a real phone. So far only phone widths in the browser have been tested.
3. Offered, waiting for the owner's yes: fix the known gap above. The plan is a `users.session_version` column (default 0) that login and signup copy into the session. Every endpoint that uses the session compares it and logs the user out on a mismatch, and `forgot_password.php` increments it. It needs a new dated migration in `Data/migrations/`, the column in `Data/schema.sql`, a step in the checklist above, checks in `tests/api_test.sh`, and a look at the Privacy Policy's session wording.

## Working rules

- Never commit or push. The owner does that himself. Leave changes uncommitted and list the changed files.
- Update this file and `README.md` in the same turn as any code change, including the pending checklist above. If booking rules, emails, stored data or third-party scripts change, update section 4 of `Terms-of-Use.html` and `Privacy-Policy.html` too, so they stay true (see [Legal pages](#legal-pages)).
- Verify for real before calling anything done. Run `bash tests/run-tests.sh` and click through the change on `bash tests/dev-server.sh` (see [Local development](#local-development)). A syntax check isn't enough. Real runs caught a blank Booking page and a login crash on 2026-09-29, and a non-UTF-8 signup bug on 2026-10-15, after code review had missed all three.
- Never use `alert()`. Use `showToast()` from `Notify.js`, or `redirectWithMessage()` when navigating (see [Shared frontend helpers](#shared-frontend-helpers)).
- Follow [Writing style](#writing-style) for anything a visitor or a reader of these docs will see, and [Design rules](#design-rules) for anything that changes how the site looks or behaves.

## Writing style

On 2026-10-15 the owner had all visitor-facing text and both docs rewritten with the Humanizer and Stop Slop skills. Keep new text in the same style.

- Visitor-facing text (pages, error messages, toasts, emails) uses the friendly café voice: "we", plain words, short sentences. Error messages say what happened and what to do next ("That email address doesn't look right.", "Your session timed out. Refresh the page and try again.").
- Headings and buttons use sentence case ("Book a table", "Past bookings"). "Log in" and "Log out" are verbs; "login" is only a noun.
- No em dashes, in pages or in docs. Use a comma, a colon, parentheses or a new sentence.
- No hype words such as exciting, thrilling, vibrant, seamless, delve, embark, "in this ___ game". Game descriptions say what you do in the game, in one or two sentences, with straight quotes and apostrophes.
- Don't add facts you can't confirm. The owner confirmed the café is open every day, 12:00 to 22:00.
- The legal pages are plain English, but don't change what they promise without updating the code to match, or the code without updating them.
- `tests/api_test.sh` checks some error-message wording. If you reword a message, update the matching check.

## Stack

- Frontend: plain HTML, CSS and JavaScript. No build step, no bundler, no JS libraries. (jQuery used to load from a CDN but nothing used it; it was removed on 2026-09-29 along with its CSP allowance.)
- Backend: PHP with MySQLi, OOP style.
- Database: MySQL on Hostinger (`u181047418_threefrogs`).
- Deployment: upload files to Hostinger by hand. There's no CI/CD.

## Local development

Set up on this PC on 2026-09-29, with test tooling added on 2026-10-15. Everything runs from Git Bash, and XAMPP's MariaDB has to be running (XAMPP Control Panel → MySQL).

`bash tests/run-tests.sh` runs the whole test suite (239 checks):

- It rebuilds a throwaway `threefrogs_test` database from `Data/schema.sql`, so it never touches dev data.
- It starts its own Apache on port 8081 (XAMPP binaries, this folder as the document root, so `.htaccess`, the CSP and the 404 page behave as in production) and a mail catcher on port 2526.
- It runs `tests/api_test.sh`, fails if PHP logged any warning or notice, and shuts everything down.
- Run it after every change, and add checks to `tests/api_test.sh` for anything new.

`bash tests/dev-server.sh` serves the site at http://localhost:8080 against `threefrogs_local` for clicking around. It saves every email the site sends (verification, booking, reset, café cancellation) as `tests/.tmp/mail-dev/NNN.eml`, so you can open the links. Stop it with Ctrl+C. Both scripts record their process IDs in `tests/.tmp/*.pids` and kill anything a previous run left behind (for example when a window was closed instead of using Ctrl+C).

The database is XAMPP's MariaDB on port 3307. `C:\xampp\mysql\bin\my.ini` was moved off 3306 because a separate `MySQL80` Windows service owns that port, and phpMyAdmin's `config.inc.php` points at 3307 as well.

- The dev database is `threefrogs_local` and the user is `threefrogs_dev`; the password is only in the local `db_config.php`. Its schema is `Data/schema.sql`, which already includes the 2026-10-15 migration.
- Ignore the older `threefrogs` database in that MariaDB. Its schema is obsolete.
- If the dev user suddenly gets "Access denied", run `CHECK TABLE mysql.db;`. On 2026-10-15 that system table turned out to be corrupt: MariaDB accepted grants but never saved them, so they vanished on every restart (Prambanan_Batik's dev user too). `REPAIR TABLE mysql.db;` fixed it, and the grants were re-created and confirmed to survive a restart.

The local `Assets/PHP/db_config.php` has three optional extras, all documented in `db_config.example.php`. Production leaves them out.

- `DB_PORT` is 3307.
- `SITE_URL` is `http://localhost:8080`, so emailed links point at the local site.
- `DB_NAME` reads `getenv("THREEFROGS_DB_NAME")` first. That's how the test Apache switches to `threefrogs_test`.

XAMPP's PHP can't deliver email, so outside those two scripts `mail()` fails. Requests still succeed, because `send_site_email()` only logs the failure, and you can read tokens straight from `email_verification_tokens` or `password_reset_tokens`.

## File layout

| Path | Purpose |
|---|---|
| `*.html` | One file per page: index, Booking, Collection, Dashboard, Login, Signup, About, Forgot-password, Verify-email, Staff |
| `Verify-email.html` | Where the emailed verification link lands (see [Email verification](#email-verification)) |
| `Staff.html` | Staff-only booking overview and café cancellation (see [Staff page](#staff-page)) |
| `404.html` | Custom error page served by `.htaccess` through `ErrorDocument 404 /404.html` (see [404 page](#404-page)) |
| `Terms-of-Use.html`, `Privacy-Policy.html` | Legal pages, linked from every page's footer (see [Legal pages](#legal-pages)) |
| `.htaccess` | Root Apache/LiteSpeed config: HTTPS redirect, security headers and CSP, no directory listings, `ErrorDocument 404` |
| `.gitignore` | Ignores `Assets/PHP/db_config.php` and `tests/.tmp/` |
| `Assets/CSS/Boardgame.css` | The one stylesheet every page shares |
| `Assets/JS/Notify.js` | `escapeHtml()`, `showToast()`, `redirectWithMessage()`, `safeNextPage()`. Loads first on every page (see [Shared frontend helpers](#shared-frontend-helpers)). |
| `Assets/JS/Navbar.js` | Builds the navbar, runs the hamburger menu and fills in the footer year, on every page |
| `Assets/JS/Verify.js` | `wireResendVerification()`, the "Resend email" button on Dashboard and Booking |
| `Assets/JS/Loading.js` | `setButtonLoading()` and `clearButtonLoading()`, on every page with a form that sends a request (see [Loading states](#loading-states)) |
| `Assets/JS/Boardgame.js` | The game list, plus the logic for both `index.html` and `Collection.html`; it picks one by checking `window.location.pathname` |
| `Assets/JS/<Page>.js` | Page scripts for Booking, Dashboard, Login, Signup, Forgot-password, Verify-email and Staff |
| `Assets/PHP/db_config.php` | Git-ignored database credentials. Create it by copying `db_config.example.php`. |
| `Assets/PHP/db_config.example.php` | Template with placeholder credentials, safe to commit |
| `Assets/PHP/db_connect.php` | Shared connection. Loads `db_config.php`, sets PHP and MySQL to Surabaya time (`Asia/Jakarta` / `+07:00`), opens MySQLi and installs a JSON exception handler (see [PHP endpoint conventions](#php-endpoint-conventions)). |
| `Assets/PHP/booking_rules.php` | Booking constants: tables, people, hours, 30-day window, 3 upcoming, 2 cancellations a month. Every booking endpoint uses it. |
| `Assets/PHP/*.php` | JSON endpoints; they all answer with `Content-Type: application/json` |
| `Assets/Images/` | Game cover images in jpg, png, webp and avif, plus `logo-mark.png` (the navbar logo) |
| `Data/schema.sql` | Full schema for all 6 tables. Safe to re-run, and the single source of truth for table definitions. It only creates missing tables. |
| `Data/migrations/*.sql` | One-time column changes for older databases such as production, named by date. Run each once, in order. |
| `tests/` | `run-tests.sh` (full run), `dev-server.sh` (local server), `api_test.sh` (the checks), `smtp_sink.py` (mail catcher), `lib.sh`, `httpd.conf.template`. Blocked by `tests/.htaccess`. Generated files go to the git-ignored `tests/.tmp/`. |
| `Data/Three Frogs.xlsx` | Offline spreadsheet of the game list |

## How it works

### Login state

Every page sends a POST to `Assets/PHP/check_session.php` before showing anything that depends on login. It returns `{ loggedIn, csrfToken, user: { name, email, avatar, emailVerified, isStaff } }`.

- While `emailVerified` is false, `check_session.php` re-reads it from the database, so verifying on another device shows up here.
- `isStaff` comes from the session. It's set at login and refreshed whenever `staff_bookings.php` runs.
- `Navbar.js` builds the navbar after this call. HTML pages ship with only the hamburger `<button>` and an empty `<ul id="navLinks"></ul>`, never static `<li>` items.

### Pages that need a login

- `index.html` shows 12 random games and asks you to log in for the rest.
- `Collection.html` redirects logged-out visitors to `Login.html`.
- `Booking.html` hides the form and shows `#authPopup` to logged-out visitors.
- `Dashboard.html` redirects logged-out visitors to `Login.html`, and shows the verification banner to unverified users.
- `Staff.html` redirects logged-out visitors to `Login.html`, and shows "Staff only" unless `staff_bookings.php` (which checks the database) lets them in.
- Every redirect to Login carries `?msg=login_required&next=<page>`, so Login shows a message and sends the user back afterwards.

### Database tables

| Table | Main columns |
|---|---|
| `users` | id, name, email (lowercase), password (bcrypt), avatar, email_verified_at (NULL means unverified), is_staff (0 or 1) |
| `bookings` | id, name, email, date, start_time, end_time, people, status (`'active'` or `'cancelled_by_cafe'`; a customer's own cancellation deletes the row) |
| `cancellations` | email, date, start, end, cancel_time |
| `password_reset_tokens` | id, email, token (64-character hex, unique), expires_at (1 hour) |
| `email_verification_tokens` | id, email, token (64-character hex, unique), expires_at (24 hours); one live token per email |
| `rate_limits` | id, action, identifier (IP or email), created_at; used for brute-force and abuse limits |

`Data/schema.sql` has the full definitions. It's safe to run on any database and creates whatever tables are missing, but it can't add columns to existing tables; that's what `Data/migrations/` is for. Without `password_reset_tokens`, forgot-password answers with a clean JSON 500. Without `rate_limits`, rate limiting silently switches off (see [Security hardening](#security-hardening)).

### Booking rules

The numbers live in `Assets/PHP/booking_rules.php`: `TABLE_COUNT`, `MAX_PEOPLE`, `OPEN_TIME`, `CLOSE_TIME`, `MAX_DAYS_AHEAD`, `MAX_UPCOMING`, `CANCEL_LIMIT`. `Booking.js`, `Booking.html` and section 4 of `Terms-of-Use.html` repeat them, so change them all together.

- Bookings run from 12:00 to 22:00, any day. The date can't be in the past or more than 30 days ahead, and a booking for today can't start at a time that has already passed. Times are normalized to `HH:MM`.
- Only verified accounts can book. `booking.php` checks `users.email_verified_at` in the database and answers 403 with `code: "email_unverified"`, which `Booking.js` turns into the verify notice.
- There are 4 tables, one booking takes one table, and a booking can have up to 8 people. `booking.php` refuses a booking if the peak number of overlapping bookings anywhere in its window is already 4. Back-to-back bookings (one ends at 15:00, the next starts at 15:00) don't overlap.
- An account can hold 3 upcoming bookings (active and not yet ended).
- A user can't hold two overlapping bookings, which also stops exact duplicates.
- These checks and the insert run inside `booking_conflict()` under a MySQL `GET_LOCK('threefrogs_booking')`, so two simultaneous requests can't both take the last table or go over the per-account limit.
- The booking's email always comes from the session, never from the request body.
- After a successful booking, `send_site_email()` (in `security.php`) sends a plain-text confirmation. The response includes `emailSent`, and `Booking.js` only says an email went out when it's `true`.
- Customer cancellation (`cancel_booking.php`) goes by booking `id` plus the session email, so another user's id gets a 404. It only works before the booking starts, and is capped at 2 per calendar month with a per-user `GET_LOCK` so parallel requests can't go over. The row delete and the `cancellations` insert run in one transaction.
- Café cancellation (`staff_cancel_booking.php`, from `Staff.html`) sets `status = 'cancelled_by_cafe'` and keeps the row, so the customer still sees it. It emails the customer with an optional reason and doesn't count toward their 2 a month.
- `get_bookings.php` returns upcoming bookings plus the last 90 days, café cancellations included. `Dashboard.js` splits them into "Upcoming bookings" (end time in the future; the Cancel button only shows if the booking hasn't started) and "Past bookings". Café cancellations get a red "Cancelled by the café" badge.
- Everything runs on Surabaya time. `db_connect.php` sets PHP to `Asia/Jakarta` and the MySQL session to `+07:00`, so `date()`, `NOW()` and `CURDATE()` agree whatever the server's own timezone.

### Email verification

1. `signup.php` creates the user with `email_verified_at = NULL`, logs them in and calls `send_verification_email()` from `security.php`. That emails a `Verify-email.html?token=...` link that works for 24 hours and replaces any older one.
2. `Verify-email.js` sends the token to `verify_email.php`, which needs no login and is rate-limited per IP. It sets `email_verified_at` and deletes the email's tokens.
3. Until then the user can log in and browse everything but can't book. The Dashboard shows a banner, and the Booking page shows a notice instead of the form. Both have a "Resend email" button (`resend_verification.php`: login required, CSRF-checked, 3 per hour per email).
4. `forgot_password.php` also sets `email_verified_at`, because opening the emailed reset link proves the user owns the address. That lets the real owner reclaim an address someone else signed up with and never verified.
5. The 2026-10-15 migration marked every account that already existed as verified.

### Staff page

- Staff accounts have `users.is_staff = 1`, set by hand in phpMyAdmin (pending step 5). `staff_bookings.php` and `staff_cancel_booking.php` check that flag in the database on every request, so granting or removing it takes effect immediately. The navbar's "Staff" link uses the session flag, which updates at the next login or the next visit to the Staff page.
- `Staff.html` shows one date at a time, with prev, next, today and a date picker. For that date it shows the number of bookings and people, a "tables in use per hour" grid for 12:00 to 21:00 (red when all 4 are taken), and every booking: time, booking name (plus the account name if it differs) and email as a mailto link.
- Active bookings that haven't ended get a "Cancel booking" button. It opens a popup with an optional reason of up to 300 characters, which goes into the customer's email.
- The page is `noindex` and disallowed in `robots.txt`.

### Shared frontend helpers

`Assets/JS/Notify.js` loads first on every page, before `Loading.js`, the page script and `Navbar.js`.

- `escapeHtml(value)`: use it for any server- or user-provided text that goes into `innerHTML`. Don't redeclare it in page scripts.
- `showToast(message, "success" | "error" | "info")`: an on-page message at the bottom of the screen (`.toast` CSS, clear of the phone's safe areas, `aria-live`). It replaced every `alert()`; the site has none left.
- `redirectWithMessage(page, msgKey, nextPage)` with the `?msg=` keys in `FLASH_MESSAGES`. The message shows as a toast on the next page and is then removed from the URL. Only those fixed keys work, never free text from the URL.
- `safeNextPage()`: after logging in, Login sends the user to `?next=<Page>.html`. It only accepts bare `Name.html` values, so `?next=https://evil.example` is ignored (no open redirect).
- Every page's footer copyright is `&copy; <span class="copyright-years">2025–2026</span> ...`, and `Navbar.js` fills in the current year.

### 404 page

`ErrorDocument 404 /404.html` in the root `.htaccess` serves `404.html`. That only works when the project itself is the server's document root. It is on Hostinger, and it is locally when you use the scripts in `tests/`, which point Apache straight at this folder rather than a subfolder of some other `htdocs`. If you ever see Apache's plain "Not Found" page instead of ours, or a 404 nested inside a 404, the site is being served from a subfolder. Fix the vhost or alias, not the app.

`404.html` needs `<base href="/" />` in its `<head>`. Apache's `ErrorDocument` serves the page at whatever wrong URL the visitor asked for, with no redirect. Without the `<base>` tag, every relative path on the page (the stylesheet, `Navbar.js`, and the `fetch()` calls inside it) would point at that wrong URL and fail without any error. Every other page uses relative paths with no leading `/` and no `<base>` tag, because they're always served from the root. Don't remove the tag from `404.html`, and don't add it to the other pages.

### Loading states

There are two kinds. Both use existing CSS in `Boardgame.css` (`.spinner`, `.spinner-sm`, `.loading-state`, `.btn-loading`, `.nav-loading`) and the existing design tokens.

1. Button loading. `Assets/JS/Loading.js` provides `setButtonLoading(button, loadingText)` and `clearButtonLoading(button)`. Call `setButtonLoading` right before the `fetch` a button triggers, and `clearButtonLoading` in every branch afterwards (success, failure and `catch`), unless success navigates away straight after, as in `Login.js`. `Login.js`, `Signup.js`, `Booking.js`, `Dashboard.js` (avatar and cancel), `Forgot-password.js`, `Verify.js` and `Staff.js` use them. Any page with a new button like this needs a `<script>` tag for `Loading.js` before its own script.
2. Page gating. A `.loading-state` block (spinner and a short message) shows while the page's `check_session.php` call is pending, and the real content replaces it once the page knows who's there.
   - `Booking.html`: `#bookingLoadingState` shows by default and `.booking-form` ships with `class="hidden"`. `Booking.js` hides the loading state and reveals exactly one of the form, `#authPopup` or `#verifyNotice`.
   - `Dashboard.html`: `#dashboardLoadingState` shows by default and `.dashboard-container` ships with `class="hidden"`. `Dashboard.js` reveals the container only after `checkSession()` confirms a logged-in user. Logged-out visitors are redirected, so they never see it.
   - `Collection.html`: step "3. Initial load" in `Boardgame.js` puts a `.loading-state` in `#boardgame-list` instead of the unfiltered list when the path includes `Collection.html`. The session-check branch further down replaces it with the grouped view once login is confirmed.
   - `Staff.html`: `#staffLoadingState` shows until `staff_bookings.php` answers. `Staff.js` then reveals either `#staffPanel` or `#staffDenied`.
   - Dashboard bookings: `fetchBookingsFromServer()` puts a `.loading-state` in `#upcomingBookings` before its `fetch`, and `renderBookings()` replaces it.
   - Navbar: `Navbar.js` fills `#navLinks` with one `<li class="nav-loading">` spinner on `DOMContentLoaded`, before its own `check_session.php` call. That's fine under the "no static `<li>` items" rule, which is about the HTML source, not what `Navbar.js` writes at runtime.

Before this pattern, `Booking.html` and `Dashboard.html` briefly showed their real (empty) content, and `Collection.html` briefly showed all 218 games, before the login check hid them or redirected. A logged-out visitor could see that flash. Any new page gated by `check_session.php` should ship its content hidden and reveal it, not show it and hide it afterwards.

### Legal pages

`Terms-of-Use.html` and `Privacy-Policy.html` use the same page boilerplate as the rest of the site and reuse `.about-section`, the card style from `About.html`. The only extra CSS is a small `.footer-links` rule for the links that point to them.

Every page's footer links to both, right after the `&copy;` line:

```html
<p class="footer-links"><a href="Terms-of-Use.html">Terms of Use</a> · <a href="Privacy-Policy.html">Privacy Policy</a></p>
```

The navbar script doesn't add this, so a new page needs it copied into its footer.

The content is a draft that no lawyer has reviewed, including against Indonesia's Personal Data Protection Law (UU PDP). It describes what the site does (the data it collects, the security measures in `security.php` and `.htaccess`, the booking rules) rather than generic boilerplate. If you edit either page, keep it true to the code at that moment. For example, don't claim a security measure, cookie behaviour or data-sharing practice the code doesn't have.

### Forgot-password flow

1. The user submits their email. `request_reset.php` creates a 64-character token that lasts 1 hour and emails a `Forgot-password.html?token=...` link.
2. The link opens the page, the script reads `?token=` from the URL and shows the new-password form, and `forgot_password.php` checks the token against the database, saves the password and deletes the token.

The whole flow is in `Forgot-password.html`, `Forgot-password.js`, `request_reset.php` and `forgot_password.php`.

### Game list

The games are a hard-coded JavaScript array in `Assets/JS/Boardgame.js` (218 of them), not database rows. To add a game, add an object with `{ name, category, players, duration, image, description, tags[] }` to the array and put the image in `Assets/Images/`. Write the description in the style of the others (see [Writing style](#writing-style)).

Every category used in the array needs an `<option>` in the filter dropdown in `Collection.html`, or nobody can filter to its games. The current categories are Party, Family, Abstract, Strategy, Dexterity, Thematic, Word Game, Cooperative, Card Game, Bluffing, Deduction, Social Deduction, Puzzle, Kids and Horror, plus the one-game categories Adventure, Casual, City Building, Classic, Duel, Memory, Negotiation and Storytelling. Collection search matches names and tags.

Resize new cover images to about 900px on the longest side before committing them, to match the rest (see below). There's no build step or image pipeline, so a 3000px phone photo would go to every visitor's browser as it is.

### Image sizes

Every file in `Assets/Images/` was resized to 900px on its longest side and re-encoded with Pillow (JPEG quality 82, PNG `optimize=True`, WebP quality 82). The exceptions are `Avatars/`, `favicon_io/` and the 5 `.avif` files, which were already small. File names and formats didn't change, so the `image:` paths in `Boardgame.js` didn't need edits. The folder went from about 96MB to about 24MB (75% smaller) with no visible loss at card-thumbnail sizes.

`ThreeFrogsPlace.jpg` is the deliberate exception. It's the full-width hero background (`background: url(...) cover` in `.hero` in `Boardgame.css`), not a thumbnail, so it's capped at 1920px wide. If you batch-process images again, leave it out, or it'll look blurry on wide screens. Search `Boardgame.css` for `background: url(` before assuming every image here is a card thumbnail.

Both `<img>` templates in `Boardgame.js` (`renderBoardgames()` and the Collection grouped view) have `loading="lazy" decoding="async"`. That matters because `Collection.html` puts all 218 cards on the page at once; this way the browser only fetches the images you scroll to.

### PHP endpoint conventions

- Every endpoint sets `ini_set('display_errors', 0)` and `error_reporting(E_ALL)`, so errors go to the server log, never the browser.
- Every endpoint sets `Content-Type: application/json`.
- Endpoints that use the session call `secure_session_start()` from `Assets/PHP/security.php`, never plain `session_start()`. It sets the `HttpOnly`, `Secure` and `SameSite=Lax` cookie options first.
- They all use `require_once("db_connect.php")`.
- Each has a local `respond($status, $data)` helper that prints JSON and calls `exit`.
- Booking and cancellation endpoints take a JSON body (`php://input`); login-type endpoints take a form POST.
- Passwords use `password_hash` and `password_verify` (bcrypt).
- `signup.php` and `update_avatar.php` both check avatars against a hard-coded whitelist.
- Never put `$conn->error`, `$stmt->error` or any exception message in a JSON response. Log it with `error_log()` and return a general message.
- `db_connect.php` turns on `MYSQLI_REPORT_STRICT`, so every database error is thrown as a `mysqli_sql_exception`, and `if (!$stmt)` checks after `prepare()` never run. Catch exceptions where you need a fallback, as the rate-limit helpers in `security.php` do. Anything uncaught reaches the `set_exception_handler` in `db_connect.php`, which logs it and returns a general JSON 500 rather than an empty body the frontend can't read.
- Outgoing email goes through `send_site_email($to, $subject, $body)` in `security.php`: plain text, from `noreply@threefrogsboardgame.com`. Links in emails use `site_url()` (the optional `SITE_URL` from `db_config.php`, or `https://threefrogsboardgame.com`). Never build links from the `Host` header.
- In the frontend, any server- or user-provided text that goes into `innerHTML` passes through `escapeHtml()` from `Notify.js`.

### Security hardening

- CSRF protection. `Assets/PHP/security.php` provides `csrf_token()` and `verify_csrf_token()`. `check_session.php` gives every page a `csrfToken`, and the page scripts send it back as `csrf_token` (a form field, a JSON field or an `X-CSRF-Token` header) on every request that changes data. `Login.js` and `Signup.js` fetch it again right before submitting. On a first visit with no cookie, their page-load call and the one in `Navbar.js` run in parallel and can each start a different session, so the token cached at page load might belong to the session whose cookie lost. `login.php`, `signup.php`, `booking.php`, `cancel_booking.php`, `update_avatar.php`, `resend_verification.php` and `staff_cancel_booking.php` reject requests without a valid token. Wire any new endpoint that changes data into the same pattern.
- Rate limiting. `rate_limit_exceeded()` and `record_attempt()` in `security.php` use the `rate_limits` table, keyed by action and identifier (IP and/or email). They cover `login.php` (per IP and per email), `signup.php` (per IP), `request_reset.php` (per IP and per email), `forgot_password.php` (per IP), `verify_email.php` (per IP) and `resend_verification.php` (per email, 3 an hour). If the table doesn't exist, the limits switch off rather than block anyone, so a missed migration can't lock every user out. Create the table (`Data/schema.sql`) to enforce them. Before 2026-09-29 this wasn't true: strict mysqli mode threw on the missing table and crashed login, signup and reset. The helpers catch it now, which was verified locally by renaming the table.
- Session fixation. `login.php` and `signup.php` call `session_regenerate_id(true)` right after setting `$_SESSION['user']`.
- Server hardening. The root `.htaccess` forces HTTPS in production, but skips the redirect when `HTTP_HOST` is `localhost` or `127.0.0.1` (with or without a port) so local development works on any port. It sets security headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS), turns off directory listings, serves `404.html` through `ErrorDocument`, and blocks web access to `db_config.php` and to `*.xlsx`, `*.sql`, `*.log`, `*.md` and `.git*` files. `Data/.htaccess` blocks that whole folder, and `tests/.htaccess` blocks `tests/`. The CSP's `script-src` is only `'self'`, since the site loads no third-party scripts. Keep it free of `unsafe-inline` and `unsafe-eval`. If you need an inline `<script>` or an `onclick=` attribute, attach an event listener from a script file instead (`Booking.js` shows how the old `authPopup` button `onclick`s were replaced).
- Links with `target="_blank"` must have `rel="noopener noreferrer"` to prevent reverse tabnabbing (see `About.html`).

## Design system

### Tokens (CSS custom properties in `Boardgame.css`)

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1a3c2e` | Navbar, headings, buttons, footer |
| `--color-accent` | `#c9a227` | Highlights, tags, borders, gold on the dark green areas. Never for text on light backgrounds (2.4:1). |
| `--color-accent-text` | `#8a6a10` | Gold for links and text on light backgrounds (4.8:1 on cream) |
| `--color-bg` | `#faf8f2` | Page background (warm cream) |
| `--color-surface` | `#ffffff` | Cards, form panels, the card image well (cover photos have white backgrounds) |
| `--color-surface-alt` | `#f3ede1` | Read-only inputs, booking cards, neutral message boxes |
| `--color-text-muted` | `#66605a` | Secondary text; warm grey, 5.3:1 or better on every light surface |
| `--color-border` | `#e2d9c8` | Decorative card and panel edges |
| `--color-input-border` | `#968a73` | Form field edges (3.4:1 on white, so fields are visible) |
| `--color-destructive-text` | `#b91c1c` | Red text on pale red boxes (5.9:1); `--color-destructive` (`#dc2626`) is for borders and filled buttons |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | The easing for UI motion; `--transition-fast` (150ms) and `--transition-base` (220ms) use it |
| `--navbar-height` | `68px` desktop, `60px` mobile | `top` offset for the alphabet nav |
| `--alphabet-nav-w` | `48px` | Width of the fixed side nav on the Collection page |
| `--page-padding-x` | `clamp(1rem, 4vw, 3rem)` | Side margins for every section |

### Typography

Headings use Righteous and body text uses Poppins. Both come from Google Fonts through an `@import` in the CSS, and every page has `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com`.

### Breakpoints

| Range | Game card columns |
|---|---|
| 360px or less | 1 |
| 361 to 480px | 2 |
| 481 to 768px | 3 |
| 769 to 1024px | 3 |
| 1025 to 1400px | 4 |
| 1401px or more | 5 |

## Design rules

On 2026-10-19 the owner had the site reviewed with the UI/UX Pro Max, taste-skill (redesign-existing-projects), Frontend Design and Emil Kowalski design-engineering skills. The brief was to improve it without a redesign: the identity (forest green, gold and cream, Righteous and Poppins, the café's frog logo) stays. Keep new work inside these rules.

- Contrast is measured, not eyeballed. Text needs 4.5:1, and form field edges and focus indicators 3:1. Use the tokens above; gold text on a light background is always `--color-accent-text`.
- Everything interactive has a visible keyboard focus. The global `:focus-visible` style draws a green outline on light backgrounds and a gold one in the navbar, footer and hero. Form fields use their green border plus gold ring instead. Don't remove outlines.
- The first Tab on any page reaches "Skip to content" (added by `Navbar.js`). The current page's navbar link gets `aria-current="page"`.
- No emoji as icons. Icons are inline SVG with `currentColor` (the back-to-top chevron, the password eye). Icon-only buttons need an `aria-label`. The logo is `Assets/Images/logo-mark.png`, the frog mark cut from the café's favicon with a transparent background, and the logo links home. The account link shows the user's own avatar.
- Panels that sit straight in `<body>` (`.booking-form`, `.login-container`, `.dashboard-container`, `.about-section`, `.error-page`, `.notice-box`) need `width: calc(100% - 2rem)` as well as `max-width`. The body is a flex column, and auto margins make a flex item shrink to its content, which is why the Dashboard and Login panels used to be narrow. The footer has `margin-top: auto` so it stays at the bottom of short pages.
- Nothing important is hover-only. Game card details are always visible; hover only adds a small lift for mouse users (`@media (hover: hover) and (pointer: fine)`).
- Hidden UI must also leave the tab order. The phone menu closes with `visibility: hidden` and animates only `opacity` and `transform`, never `max-height`.
- Motion follows Emil Kowalski's rules. It has a purpose; it uses `--ease-out` (never ease-in), stays under 300ms for UI and exits faster than it enters; it animates only `opacity` and `transform`; and nothing enters from `scale(0)`. Buttons press to `scale(0.97)`. Dialogs fade the backdrop and scale the panel from 0.96. Only the 12 home page cards stagger in (40ms apart); Collection cards don't animate, because they re-render on every keystroke. `prefers-reduced-motion` turns motion off.
- Form messages use classes, not inline colours. Put errors in `<p class="form-error">` and successes in an `h3` or `.form-success`. The result boxes (`#bookingResult`, `#loginResult` and the others) tint themselves red or green with `:has()`.
- Dialogs (`#authPopup`, `#cancelPopup`, `#staffCancelPopup`) have `role="dialog"`, `aria-modal` and a label. Opening one moves focus to the safe choice ("Keep it" or "Log in"), and Escape closes the cancel dialogs.
- `appearance: none` removes native select arrows, so `select` draws its own chevron as a background image. Don't set the `background` shorthand on a select, or the arrow disappears; use `background-color`.
- `scroll-padding-top` keeps anchor jumps (the A to Z rail, `#games`) clear of the sticky navbar.
- On the Collection page, each `section[id^="letter-"]` carries the horizontal padding and the A to Z rail offset, so letter headings line up with their cards.

## Behaviour to preserve

- `Navbar.js` builds every navbar `<li>` after the session check, including a "Staff" link when `user.isStaff`. Never put static `<li>` items in the HTML. Every page needs `<button class="nav-toggle" id="navToggle" ...>` and `<ul class="nav-links" id="navLinks"></ul>` inside `.navbar`.
- `Navbar.js` opens and closes the hamburger menu by toggling `.nav-open` on `#navLinks` and `aria-expanded` on `#navToggle`. Clicking outside the menu or pressing Escape closes it.
- `Boardgame.js` runs either the home page logic (12 random games, a number that fills every row at 1 to 4 columns) or the Collection logic (grouped A to Z), depending on `window.location.pathname`. Don't move or nest those branches.
- `Collection.html` needs `<body class="page-collection">` so the CSS can add `padding-left` to the grid and search bar to clear the fixed alphabet nav. No other page has this class.
- The alphabet nav only shows on screens 769px and wider (`display: none` below that). It's `position: fixed; left: 0; width: var(--alphabet-nav-w)`.
- Inputs and selects stay at `font-size: 1rem` (16px) so iOS doesn't zoom in on focus. The global reset in `Boardgame.css` sets this; don't override it with anything smaller.
- Anything interactive has `min-height: 44px` and `touch-action: manipulation`. Keep that for new controls.
- Card `.details` and hover lifts sit in `@media (hover: hover)`, so only mouse and trackpad users get them. Touch devices show the details without hovering through `@media (hover: none)`. Do the same for new hover effects.
- The navbar, footer, popups, toasts and the scroll-to-top button use `env(safe-area-inset-*)` to clear phone notches and home bars. Keep that on new fixed or sticky elements.
- The edit-avatar pencil is 32px but has an invisible `::before` ring that makes its tap target 44px.
- Avatars are stored as relative paths such as `Assets/Images/Avatars/Clam.jpg`. `signup.php` and `update_avatar.php` both check them against the allowed list.
- The home page shuffles `[...boardgames].sort(...)`, a copy, so the source array isn't changed. The Collection page sorts with `localeCompare`. Both read the same module-level array.
- The Booking page fills the email field from the session and makes it `readOnly`. After a successful booking, `bookingForm.reset()` runs and the script fills the email and name in again, so back-to-back bookings work.
- `db_config.php` is git-ignored. Never commit real credentials. The file has to exist on the server and locally, but not in version control; use `db_config.example.php` as the template.
- `Booking.html`, `Dashboard.html` and `Staff.html` ship their real content with `class="hidden"` next to a visible `.loading-state`. The page script removes `hidden` only once it knows the right state (see [Loading states](#loading-states)). Don't go back to showing content first and hiding it after the fetch; that's the flash-of-content bug this replaced.
- Every page's footer has the `.footer-links` paragraph for `Terms-of-Use.html` and `Privacy-Policy.html` (see [Legal pages](#legal-pages)) and the `.copyright-years` span. Copy the whole footer from an existing page for a new one.
- A new page copies the head, navbar and footer from an existing page, loads `Notify.js` first and `Navbar.js` last, and goes into the page loop in `tests/api_test.sh`, which checks Notify.js, the footer links and that there's no jQuery. Staff or utility pages also get `<meta name="robots" content="noindex, nofollow" />` and a `robots.txt` entry.
- `404.html` keeps its `<base href="/" />` and the other pages don't get one (see [404 page](#404-page)).
- Every `Assets/CSS/*.css` and `Assets/JS/*.js` link on every page ends in the same `?v=YYYY-MM-DD` tag (added 2026-10-22). Browsers cache those files, so without it a returning visitor gets new HTML with old CSS or JS. Whenever you change any CSS or JS file, set the tag on all pages to that day: `sed -i -E 's/\?v=[0-9-]+"/?v=YYYY-MM-DD"/g' *.html`. A new page copies the tag. `tests/api_test.sh` fails if a link has no tag or the pages disagree. Images and the favicon links aren't tagged.
