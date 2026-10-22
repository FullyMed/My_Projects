# Three Frogs Boardgame Café website

The website for Three Frogs, a boardgame café in Surabaya, Indonesia. Visitors can browse the games, create an account and book a table.

Live site: [threefrogsboardgame.com](https://threefrogsboardgame.com)

---

## Before you deploy (as of 2026-10-22)

None of the recent work is live yet. That includes the security hardening, the 404 page, loading states, legal pages, image compression, and the fix, improvement, writing and design passes from 2026-09-29 to 2026-10-19, and the asset version tags from 2026-10-22. All of it passes the local test suite (`bash tests/run-tests.sh`, 239 checks) and a run-through in the browser at desktop and phone widths.

Do these production steps in order:

- [ ] 1. In phpMyAdmin, run `SHOW COLUMNS FROM bookings;`. If there's no `id` column, run `ALTER TABLE bookings ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;`
- [ ] 2. Run `Data/schema.sql`. It only creates tables that are missing. If `password_reset_tokens` is missing today, forgot-password is broken on the live site right now.
- [ ] 3. Run `Data/migrations/2026-10-15-verification-and-staff.sql` once. It adds the email-verified and staff columns and marks every existing account as verified. Running it a second time gives an error.
- [ ] 4. Upload the changed files straight after step 3 (see [Deployment](#deployment)). Leave out your local `Assets/PHP/db_config.php` and the `tests/` folder.
- [ ] 5. Make staff accounts with `UPDATE users SET is_staff = 1 WHERE email = '...';`. Staff log out and back in to see the "Staff" link.
- [ ] 6. On the live site, check that all four emails arrive: verification (sign up a test account), booking confirmation, password reset, and café cancellation (from the Staff page). Check spam too. If they land there, the `noreply@threefrogsboardgame.com` sender may need SPF/DKIM set up in Hostinger. New accounts can't book until their verification email arrives, so this one matters.
- [ ] 7. Ask a lawyer to review `Terms-of-Use.html` and `Privacy-Policy.html` before you treat them as final.

Known gap: resetting a password doesn't log that account out on other devices.

---

## What changed recently

### Fresh files after a deploy (2026-10-22, not deployed)

Every page now loads its stylesheet and scripts with a version tag, like `Boardgame.css?v=2026-10-22`. Browsers keep CSS and JS files for a while, so without the tag a returning visitor could get the new HTML with last month's CSS or JavaScript, and a page could look broken or a button could stop working until they cleared their cache. A new tag makes the browser fetch the files again. Bump it whenever you change a CSS or JS file (see [Deployment](#deployment)). The test suite checks that every link has a tag and that all pages use the same one (239 checks in total).

### Design pass (2026-10-19, not deployed)

We reviewed every page with four design guides (UI/UX Pro Max, taste-skill, Frontend Design and Emil Kowalski's design-engineering rules) and fixed what was wrong without redesigning. The colours, fonts and layout stay the same.

Layout bugs fixed:

- The Login, Dashboard and Staff panels were too narrow (the Dashboard was about 215px wide on desktop). They now fill their intended width.
- On short pages the footer floated up the screen with empty space below it. It now sits at the bottom.
- On the Collection page, the letter headings (#, A, B…) were hidden under the A to Z rail on desktop and touched the screen edge on phones. They now line up with the cards.
- Card details (players, time, description) were bigger than the game name on the Collection page, and on desktop they stayed hidden until you hovered, leaving a blank gap. They're now always visible at the right size.
- The category dropdown had no arrow, and on phones the search box cut off its own placeholder.
- Jumping to a letter, or to the games section, landed under the sticky navbar.

Accessibility fixes:

- Gold links (like "Forgot your password?") were too faint to read: 2.4:1, where 4.5:1 is the minimum. Grey text on beige, red error text and form field edges were too faint as well. All now meet WCAG AA.
- Keyboard users get a visible focus outline everywhere, a "Skip to content" link on the first Tab press, and a marker for the current page in the navbar.
- The closed phone menu no longer traps keyboard focus in invisible links.
- The password eye is now a real button that screen readers announce. Dialogs move focus to the safe choice and close with Escape.

Look and feel:

- The navbar shows the café's own frog logo (cut from the favicon) instead of a 🐸 emoji, and it links home. Your account link shows your avatar. Emoji icons became proper icons.
- The home page hero has "Book a table" and "See the games" buttons, and the home page shows 12 games, so every row is full.
- Cover photos sit on white instead of in a beige box.
- Error messages appear in a red box. They used to show red text inside a green success box.
- Motion is quicker and calmer: buttons press in slightly, dialogs scale in from 96%, and only the home page cards animate in. The Collection page no longer flickers while you type in the search box.
- The test suite gained checks for these fixes (214 checks in total).

### Writing pass (after 2026-10-15, not deployed)

We ran the visitor-facing text and these docs through two editing guides (Humanizer and Stop Slop) to strip out the patterns that make text read as machine-written.

- The pages, error messages, toasts and the four emails now use a friendly café voice ("we"), sentence-case headings and "Log in"/"Log out" as verbs. No rules or behaviour changed.
- The Terms of Use and Privacy Policy say the same things in plainer words. The legal substance is unchanged, and they still need the lawyer review.
- The About page now says we're open every day, 12:00 PM to 10:00 PM. It used to say weekdays only, which didn't match the booking system.
- All 218 game descriptions in `Boardgame.js` were rewritten to say what you do in each game, instead of box-blurb phrases like "in this thrilling strategy game".
- README.md and CLAUDE.md were rewritten in plain language with the same facts.

### Improvement pass (2026-10-15, not deployed)

- Email verification. New accounts get a link that works for 24 hours. Until they open it they can browse everything but can't book, and the Dashboard and Booking page show a notice with a "Resend email" button (3 per hour at most). A password reset also counts as verification, and accounts that existed before this change count as verified.
- Staff page (`Staff.html`) for accounts with `is_staff = 1`. It shows every booking on any date and a grid of tables in use per hour. Staff can cancel a booking: the customer gets an email with an optional reason, it doesn't count toward their 2 cancellations a month, and their Dashboard shows "Cancelled by the café".
- Booking limits. You can book up to 30 days ahead and hold 3 upcoming bookings at a time. All the booking numbers now live in `Assets/PHP/booking_rules.php`.
- Names. Signup accepts apostrophes, hyphens, periods and accents (Nur'aini, Jean-Luc, José). Text that isn't valid UTF-8 now gets a clear error, where it used to get a misleading "required" message and a PHP warning.
- No more `alert()` pop-ups. The site shows on-page toasts instead (`Assets/JS/Notify.js`), logging in sends you back to the page you came from, and the footer year updates itself.
- A test suite in the repo. `bash tests/run-tests.sh` runs end-to-end checks (239 as of 2026-10-22) on a throwaway database and fails on any PHP warning. `bash tests/dev-server.sh` serves the site locally and catches outgoing emails.
- The legal pages describe verification, the booking limits, café cancellations and staff access.
- On this PC, XAMPP MariaDB's `mysql.db` system table was corrupt, so database permissions vanished every time MariaDB restarted. Repairing it also brought back Prambanan Batik's dev access.

### Bug-fix pass (2026-09-29, not deployed)

Bugs fixed:

- Logged-in users saw a blank Booking page. `Booking.js` revealed the `<form>`, but the `hidden` class sits on the `<section>` around it.
- Login, signup and password reset crashed with an empty 500 if the `rate_limits` table was missing, even though the docs said rate limiting "fails open". Strict mysqli mode threw an exception that nothing caught. The helpers catch it now.
- The first login or signup in a fresh browser could fail with "Your session expired". Two session checks ran at the same time and started separate sessions, so the scripts now fetch the token again when you submit.
- A user could book the same slot twice, and one cancel then deleted both rows while counting only one cancellation. Cancels now go by booking `id` with an ownership check, and the site blocks bookings that overlap your own.
- The Dashboard's booking history was always empty. The server now returns the last 90 days too.
- You could book a start time that had already passed today, and cancel a booking that had already started.
- `get_bookings.php` sent a raw database error to the browser.
- Dates and times followed the server's timezone. They're now fixed to Surabaya time (UTC+7).
- Smaller fixes: login ignores letter case in emails, every game category has a filter option, Collection search matches tags, the home page no longer builds all 218 cards before showing 10, output is HTML-escaped, and the unused jQuery script is gone, which let us tighten the CSP to `script-src 'self'`.

Rules the owner chose: 4 bookable tables, up to 8 people per booking, and a confirmation email for every booking. The Terms of Use and Privacy Policy were updated to match.

New tooling: `Data/schema.sql` (every table, safe to re-run), optional `DB_PORT` and `SITE_URL` settings in `db_config.php`, and a working local database (see [Local setup](#local-setup)).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML, CSS and JavaScript (no libraries) |
| Backend | PHP 8 with MySQLi (OOP style) |
| Database | MySQL (Hostinger) |
| Hosting | Hostinger shared hosting |
| Deployment | Manual file upload (no CI/CD) |

There's no build step, bundler or npm. Every page is a plain `.html` file.

---

## Local setup

You need XAMPP (Apache, PHP 8, MariaDB), Python 3 and Git Bash.

1. Copy `Assets/PHP/db_config.example.php` to `Assets/PHP/db_config.php` and fill in your local credentials. The example also documents three optional settings: `DB_PORT`, `SITE_URL` and the test-database override. Git ignores this file, and it must never be committed.
2. Create a database and run `Data/schema.sql` against it.
3. Start MariaDB from the XAMPP Control Panel, then run this in Git Bash:

```bash
bash tests/dev-server.sh
```

The site runs at http://localhost:8080 with this folder as the document root, so `.htaccess`, the CSP and the 404 page behave as they do in production. Every email the site sends lands in `tests/.tmp/mail-dev/` instead of an inbox, so you can open the verification and reset links. Press Ctrl+C to stop.

Run the tests after any change. It's one command, and it never touches your dev data:

```bash
bash tests/run-tests.sh
```

It rebuilds a throwaway `threefrogs_test` database, starts its own Apache and mail catcher, runs the 239 checks in `tests/api_test.sh`, fails if PHP logged any warning, and cleans up afterwards.

This PC's setup (2026-09-29, updated 2026-10-15):

- XAMPP's MariaDB runs on port 3307, because a separate `MySQL80` service holds 3306. `my.ini` and phpMyAdmin's `config.inc.php` were changed to match.
- The database is `threefrogs_local` and the user is `threefrogs_dev`.
- If the dev user suddenly gets "Access denied", run `CHECK TABLE mysql.db;` and repair it if needed (see CLAUDE.md).

`db_config.php` is the only place the database credentials live. `db_connect.php` loads it at runtime, so don't put credentials anywhere else.

---

## File structure

```
/
├── .htaccess                       HTTPS redirect, security headers and CSP, ErrorDocument 404, file lockdown
├── .gitignore                      Ignores db_config.php and tests/.tmp/
├── robots.txt                      Disallows /Assets/PHP/, /Data/, /tests/, Staff.html, Verify-email.html
├── index.html                      Home: 12 random games, and a login prompt for the full list
├── Collection.html                 All games, A to Z (login required)
├── Booking.html                    Booking form (login required)
├── Dashboard.html                  Your account and bookings (login required)
├── Login.html
├── Signup.html
├── Forgot-password.html            Two-step password reset (email, then the emailed link, then a new password)
├── Verify-email.html               Where the emailed verification link lands
├── Staff.html                      Staff only: every booking per date, and café cancellation
├── About.html
├── 404.html                        Custom error page (see "404 page" below for the <base> tag)
├── Terms-of-Use.html               Legal, linked from every page's footer
├── Privacy-Policy.html             Legal, linked from every page's footer
│
├── Assets/
│   ├── CSS/
│   │   └── Boardgame.css           The one shared stylesheet
│   ├── JS/
│   │   ├── Notify.js               escapeHtml, showToast, redirect-with-message; loads first on every page
│   │   ├── Navbar.js               Builds the navbar on every page and sets the footer year
│   │   ├── Verify.js               The "Resend verification email" button (Dashboard and Booking)
│   │   ├── Loading.js              Button loading states (setButtonLoading / clearButtonLoading)
│   │   ├── Boardgame.js            The 218-game list, plus the home and Collection page logic
│   │   ├── Booking.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Forgot-password.js
│   │   ├── Verify-email.js
│   │   └── Staff.js
│   ├── PHP/
│   │   ├── db_config.php           Git-ignored: database credentials (copy from the example)
│   │   ├── db_config.example.php   Credentials template, safe to commit
│   │   ├── db_connect.php          Opens MySQLi, sets Surabaya time, answers DB errors with JSON
│   │   ├── security.php            CSRF tokens, hardened sessions, rate limiting and email helpers
│   │   ├── booking_rules.php       Booking limits: tables, people, hours, 30 days, 3 upcoming, 2 cancels a month
│   │   ├── check_session.php       Returns { loggedIn, user, csrfToken }; every page calls it
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── signup.php
│   │   ├── request_reset.php       Password reset step 1: creates a token and emails the link
│   │   ├── forgot_password.php     Password reset step 2: checks the token and saves the new password
│   │   ├── verify_email.php        Marks an account verified from the emailed token
│   │   ├── resend_verification.php Sends a fresh verification link
│   │   ├── staff_bookings.php      Staff: every booking on a date, plus tables in use per hour
│   │   ├── staff_cancel_booking.php Staff: café cancellation and the email to the customer
│   │   ├── booking.php
│   │   ├── get_bookings.php
│   │   ├── cancel_booking.php
│   │   └── update_avatar.php
│   └── Images/                     Game covers (jpg/png/webp/avif) and UI images
│       └── Avatars/                The 13 avatars users can pick
│
└── Data/
    ├── .htaccess                   Blocks all web access to this folder
    ├── schema.sql                  The full schema (all 6 tables), safe to re-run
    ├── migrations/                 One-time column changes for older databases like production; run each once
    └── Three Frogs.xlsx            Offline spreadsheet of the game list

tests/                              Blocked by tests/.htaccess; don't upload it to Hostinger
├── run-tests.sh                    The whole end-to-end test run in one command (throwaway database)
├── dev-server.sh                   Local server on :8080 that catches emails
├── api_test.sh                     The 239 checks
├── smtp_sink.py                    Saves outgoing emails as .eml files
├── lib.sh / httpd.conf.template    Shared helpers and the Apache config template
└── .tmp/                           Generated and git-ignored: configs, logs, caught emails
```

---

## How it works

### Login state

Every page sends a POST to `Assets/PHP/check_session.php` when it loads. The answer looks like this:

```json
{ "loggedIn": true, "csrfToken": "...", "user": { "name": "...", "email": "...", "avatar": "...", "emailVerified": true, "isStaff": false } }
```

`Navbar.js` builds the navbar from that answer. The HTML pages ship with an empty `<ul id="navLinks"></ul>`, and nobody should add static `<li>` items to it.

### Pages that need a login

| Page | What a logged-out visitor sees |
|---|---|
| `index.html` | 12 random games and a prompt to log in for the rest |
| `Collection.html` | A redirect to `Login.html` |
| `Booking.html` | A "please log in" popup instead of the form |
| `Dashboard.html` | A redirect to `Login.html` |
| `Staff.html` | A redirect to `Login.html`; logged-in non-staff see "Staff only" |

Redirects to Login carry `?msg=login_required&next=<page>`, so Login shows a message and sends you back after you log in. Logged-in users who haven't verified their email see a notice on the Dashboard, and on the Booking page in place of the form.

These pages hide their real content by default (`class="hidden"`, with a `.loading-state` spinner showing instead). The page script only reveals it after `check_session.php` answers. That stops a logged-out visitor from glimpsing the form or the game list before the redirect kicks in.

### Loading states

| Where | What happens |
|---|---|
| Any button that sends a request | `setButtonLoading(button, text)` from `Assets/JS/Loading.js` shows a spinner and disables the button, and `clearButtonLoading(button)` puts it back. `Login.js`, `Signup.js`, `Booking.js`, `Dashboard.js` and `Forgot-password.js` use them. |
| `Booking.html` and `Dashboard.html` | The real content ships hidden, with a `.loading-state` next to it. The script reveals it once `check_session.php` answers. |
| `Collection.html` | `Boardgame.js` shows a `.loading-state` in `#boardgame-list` while the login check runs, so a logged-out visitor never sees the 218 games before the redirect. |
| Dashboard bookings | `#upcomingBookings` shows a `.loading-state` while `get_bookings.php` loads. |
| Navbar | `#navLinks` shows one spinner `<li>` (added by the script, not in the HTML) until `check_session.php` answers. |

All of these reuse the `.spinner`, `.loading-state` and `.btn-loading` classes in `Boardgame.css`, with no new colors or fonts.

### Legal pages

Every page's footer links to `Terms-of-Use.html` and `Privacy-Policy.html` (the `.footer-links` line under the copyright). Both pages reuse the `.about-section` card style from `About.html`.

A lawyer hasn't reviewed either page yet, including against Indonesia's Personal Data Protection Law (UU PDP). They describe what the site does: the fields it collects, the security measures listed under [Security](#security), and the booking rules. Get them reviewed before you rely on them. If you change how the site collects or uses data, update these pages in the same change, because a policy that no longer matches the site is worse than none.

### Email verification

1. Signup creates the account as unverified and emails a `Verify-email.html?token=...` link that works for 24 hours.
2. Opening the link calls `verify_email.php`, which marks the account verified.
3. Until then the user can browse everything, but `booking.php` refuses to book and answers 403 with `email_unverified`. The "Resend email" button (`resend_verification.php`) sends a fresh link, up to 3 times an hour.
4. Finishing a password reset also verifies the account, because it proves the user can read that inbox.

### Staff page

Staff accounts (`users.is_staff = 1`, set in phpMyAdmin) get a "Staff" link in the navbar that opens `Staff.html`. It shows:

- every booking for a chosen date, with prev, next and today buttons;
- the number of bookings and people that day;
- a grid of tables in use per hour, 12:00 to 21:00, out of 4.

"Cancel booking" marks a booking `cancelled_by_cafe` and emails the customer, with an optional reason. It doesn't count toward their 2 cancellations a month. The server checks the staff role in the database on every request, so granting or removing it takes effect straight away.

### Password reset

Resetting takes two steps, and nobody can change a password without the emailed token:

1. The user enters their email. `request_reset.php` creates a random 64-character token, stores it in `password_reset_tokens` for 1 hour, and emails a `Forgot-password.html?token=...` link.
2. The link opens the "new password" form. `forgot_password.php` checks the token, saves the new password and deletes the token.

### Game list

The 218 games are a hard-coded JavaScript array in `Boardgame.js`, not database rows. `Boardgame.js` looks at `window.location.pathname` to decide whether to run the home page logic (12 random games, shuffled from a copy of the array) or the Collection logic (every game, grouped A to Z).

To add a game, add an object to the `boardgames` array and put its cover image in `Assets/Images/`:

```js
{
  name: "Game Name",
  category: "Strategy",       // must match an option in the Collection.html filter dropdown
  players: "2–4",
  duration: "60–120 min",
  image: "Assets/Images/Game Name.jpg",
  description: "...",
  tags: ["tag1", "tag2"]
}
```

Write the description the way the others read: one or two plain sentences about what you do in the game. Avoid "in this exciting ___ game".

Resize new cover images to about 900px on the longest side before adding them. There's no build step or image pipeline, so whatever file you commit is what every visitor downloads. See [Image sizes](#image-sizes).

### Image sizes

Every image in `Assets/Images/` was resized to 900px on its longest side and recompressed, keeping the same file names and formats, so no code had to change. The folder went from about 96MB to about 24MB (75% smaller) with no visible loss at the sizes the site shows. `Avatars/`, `favicon_io/` and the `.avif` files were already small and weren't touched.

`ThreeFrogsPlace.jpg` is the exception. It's the home page hero background (`background: url(...) cover` in `Boardgame.css`) and stretches across the whole page, so it's 1920px wide. If you ever batch-process this folder again, search the CSS for `background: url(` first so you don't shrink it.

Both card templates in `Boardgame.js` put `loading="lazy" decoding="async"` on their `<img>` tags. `Collection.html` adds all 218 cards to the page at once, and this way the browser only downloads the images you scroll to.

---

## Database

### `users`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | Letters in any language, spaces, apostrophes, hyphens and periods; must start with a letter |
| email | VARCHAR UNIQUE | Stored in lowercase |
| password | VARCHAR | bcrypt hash from `password_hash` |
| avatar | VARCHAR | Relative path such as `Assets/Images/Avatars/Clam.jpg`, checked against a server-side whitelist |
| email_verified_at | DATETIME NULL | `NULL` until the user opens the verification link or resets their password |
| is_staff | TINYINT(1) | `1` means the account can use `Staff.html`; set by hand |

### `bookings`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | Identifies the booking when someone cancels it |
| name | VARCHAR | |
| email | VARCHAR | Always the logged-in user's email, taken from the session |
| date | DATE | Can't be in the past |
| start_time | TIME | 12:00 or later, and not already passed if the date is today |
| end_time | TIME | 22:00 or earlier, and after start_time |
| people | INT | 1 to 8 |
| status | VARCHAR | `'active'`, or `'cancelled_by_cafe'` after a staff cancellation. A customer's own cancellation deletes the row. |

The booking numbers live in `Assets/PHP/booking_rules.php`. `Booking.js`, `Booking.html` and section 4 of the Terms of Use repeat them, so change them all together.

- Only verified accounts can book.
- There are 4 tables, one booking takes one table, and a booking can have up to 8 people. The server refuses a booking only if all 4 tables are taken at some moment during it. A booking that ends at 15:00 doesn't clash with one that starts at 15:00.
- You can book up to 30 days ahead and hold up to 3 upcoming bookings.
- You can't hold two bookings that overlap.
- The checks and the insert run under a MySQL lock, so two people booking at the same moment can't both get the last table or go over the per-account limit.
- The server emails a plain-text confirmation, and the page only says it sent one if it did.
- PHP and MySQL both run on Surabaya time (`Asia/Jakarta`, UTC+7), whatever the server's own timezone.

### `cancellations`

| Column | Type | Notes |
|---|---|---|
| email | VARCHAR | |
| date | DATE | |
| start | TIME | |
| end | TIME | |
| cancel_time | DATETIME | Set to `NOW()` when the row is added |

Customers can cancel 2 bookings per calendar month. `cancel_booking.php` enforces it and `get_bookings.php` reports how many are left. A booking can only be cancelled before it starts. Café cancellations from the Staff page aren't logged here, so they never count against the customer.

### `password_reset_tokens`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| email | VARCHAR | |
| token | VARCHAR(64) UNIQUE | 64-character hex string from `random_bytes` |
| expires_at | DATETIME | 1 hour after creation; expired tokens are refused and deleted |

Forgot-password needs this table. `Data/schema.sql` creates it.

### `email_verification_tokens`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| email | VARCHAR | One live token per email; a resend replaces it |
| token | VARCHAR(64) UNIQUE | 64-character hex string from `random_bytes` |
| expires_at | DATETIME | 24 hours after creation |

### `rate_limits`

| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| action | VARCHAR(50) | e.g. `login_ip`, `login_email`, `signup_ip`, `reset_request_ip`, `verify_email_ip`, `resend_verification` |
| identifier | VARCHAR(255) | The IP address or email being limited |
| created_at | DATETIME | Set to `NOW()` for each attempt |

This table backs the rate limiting described under [Security](#security), and `Data/schema.sql` creates it. If the table is missing, rate limiting switches off instead of locking anyone out.

`Data/schema.sql` defines all six tables with `CREATE TABLE IF NOT EXISTS`, so you can run it on a database that already has some of them. It can't add columns to existing tables, though. A database created before a change needs the matching one-time script from `Data/migrations/`.

---

## PHP endpoints

Every endpoint sets `Content-Type: application/json` and `ini_set('display_errors', 0)`, and answers through a local `respond($status, $data)` helper that prints JSON and exits. Endpoints that use the session call `secure_session_start()`, never plain `session_start()`. If a database error slips through, the handler in `db_connect.php` logs it and answers with a generic JSON 500.

| Endpoint | Method | Login | What it does |
|---|---|---|---|
| `check_session.php` | POST | No | Returns the current session |
| `login.php` | POST (form) | No | Checks the password and sets `$_SESSION['user']` |
| `logout.php` | POST | No | Ends the session and clears the cookie |
| `signup.php` | POST (form) | No | Creates an unverified account, checks the name and avatar, logs the user in and emails a verification link. Answers 409 if the email is taken. |
| `request_reset.php` | POST (form) | No | Creates a reset token and emails the link. Always answers 200, so nobody can use it to find out which emails have accounts. |
| `forgot_password.php` | POST (form) | No | Checks the token, saves the new password, deletes the token and marks the email verified |
| `verify_email.php` | POST (form: `token`) | No | Marks the account verified; each link works once, for 24 hours |
| `resend_verification.php` | POST (form) | Yes | Emails a fresh verification link, up to 3 an hour |
| `booking.php` | POST (JSON) | Yes, verified | Creates a booking. Checks the date and time rules, the 30-day window, the 3-booking limit, the 4 tables, the 8-person limit and overlaps with your own bookings, then emails a confirmation. |
| `get_bookings.php` | POST | Yes | Returns your upcoming bookings and the last 90 days (with `id` and `status`), plus how many cancellations you have left |
| `cancel_booking.php` | POST (JSON: `id`) | Yes | Cancels one of your bookings that hasn't started, within the monthly limit |
| `update_avatar.php` | POST (form) | Yes | Changes your avatar to one of the allowed images |
| `staff_bookings.php` | POST (JSON: `date`) | Staff | Every booking on that date, tables in use per hour, and totals |
| `staff_cancel_booking.php` | POST (JSON: `id`, `reason`) | Staff | Café cancellation; emails the customer |

---

## Security

| Measure | Where |
|---|---|
| CSRF tokens on every request that changes data | `csrf_token()` and `verify_csrf_token()` in `Assets/PHP/security.php`. `login.php`, `signup.php`, `booking.php`, `cancel_booking.php`, `update_avatar.php`, `resend_verification.php` and `staff_cancel_booking.php` check them. |
| Rate limiting against brute force and abuse | `rate_limit_exceeded()` and `record_attempt()` in `security.php`, using the `rate_limits` table. Used by `login.php`, `signup.php`, `request_reset.php`, `forgot_password.php`, `verify_email.php` and `resend_verification.php`. |
| Hardened session cookies (`HttpOnly`, `Secure`, `SameSite=Lax`) | `secure_session_start()` in `security.php`, used everywhere instead of `session_start()` |
| Session fixation protection | `login.php` and `signup.php` call `session_regenerate_id(true)` after logging the user in |
| No internal errors shown to users | Database errors go to the server log with `error_log()`, never into a JSON response |
| Security headers, forced HTTPS, no directory listings | The root `.htaccess`. The CSP allows scripts from this site only (`script-src 'self'`). It also sets `X-Frame-Options`, HSTS and more, and skips the HTTPS redirect when `HTTP_HOST` is `localhost` or `127.0.0.1` (with or without a port) for local development. |
| Private files blocked from the web | `.htaccess` blocks `db_config.php`, `*.xlsx`, `*.sql`, `*.log`, `*.md` and `.git*`. `Data/.htaccess` blocks that whole folder. |
| Reverse-tabnabbing protection | Every `target="_blank"` link has `rel="noopener noreferrer"` |
| No open redirect | Login's `?next=` only accepts bare page names like `Booking.html` (`safeNextPage()` in `Notify.js`) |
| Staff role checked on the server | `staff_bookings.php` and `staff_cancel_booking.php` read `users.is_staff` from the database on every request |

A new endpoint that changes data should follow the same pattern: `require_once("security.php")`, call `secure_session_start()`, and check the CSRF token before doing anything else.

### 404 page

The root `.htaccess` serves `404.html` with `ErrorDocument 404 /404.html`. Two things make it work:

1. The project has to be the server's document root, not a folder inside some other `htdocs`. Apache looks for `/404.html` at the root of the server, not next to the missing URL. The [Local setup](#local-setup) steps already serve it this way.
2. `404.html` has `<base href="/" />` in its `<head>`. Apache shows the 404 page at whatever wrong URL the visitor typed, without redirecting. Without the `<base>` tag, every relative link, script and fetch on the page would point at that wrong path instead of the site root. Every other page uses plain relative paths with no `<base>` tag; `404.html` is the only exception.

---

## Design

### CSS variables

| Variable | Value | Used for |
|---|---|---|
| `--color-primary` | `#1a3c2e` | Navbar, headings, buttons, footer |
| `--color-accent` | `#c9a227` | Highlights, tags, borders, gold on dark green |
| `--color-accent-text` | `#8a6a10` | Gold for links and text on light backgrounds |
| `--color-bg` | `#faf8f2` | Page background (warm cream) |
| `--color-surface` | `#ffffff` | Cards and form panels |
| `--color-surface-alt` | `#f3ede1` | Read-only inputs, card image backgrounds |
| `--color-text-muted` | `#66605a` | Secondary text (warm grey) |
| `--color-input-border` | `#968a73` | Form field edges |
| `--color-destructive-text` | `#b91c1c` | Error text |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Easing for all UI motion |
| `--navbar-height` | `68px` (`60px` on mobile) | Offsets for sticky elements |
| `--alphabet-nav-w` | `48px` | Width of the A to Z rail on the Collection page |
| `--page-padding-x` | `clamp(1rem, 4vw, 3rem)` | Side margins |

### Fonts

Headings use Righteous and body text uses Poppins, both from Google Fonts.

### Game card grid

| Screen width | Columns |
|---|---|
| 360px or less | 1 |
| 361 to 480px | 2 |
| 481 to 768px | 3 |
| 769 to 1024px | 3 |
| 1025 to 1400px | 4 |
| 1401px or more | 5 |

---

## Conventions

- Inputs stay at `font-size: 1rem`. Anything smaller makes iOS zoom in when you tap the field.
- Anything you can tap is at least 44px tall.
- Hover effects sit inside `@media (hover: hover)`, so they only apply to mouse and trackpad users. Touch devices show the details without hovering.
- Fixed and sticky elements use `env(safe-area-inset-*)` so they clear the notch and home bar on phones.
- `Collection.html` needs `<body class="page-collection">`. The CSS uses it to add the `padding-left` that clears the A to Z rail.
- The A to Z rail only shows on screens 769px and wider.
- Don't use `alert()`. Use `showToast()` from `Notify.js`, or `redirectWithMessage()` when you navigate, and `escapeHtml()` for any text you put into `innerHTML`.
- Write visitor-facing text in the café's voice: friendly, plain, "we", sentence-case headings, and no em dashes.
- Keep contrast at WCAG AA (use `--color-accent-text` for gold text on light backgrounds), keep focus outlines visible, use SVG icons rather than emoji, and animate only `opacity` and `transform`. CLAUDE.md lists the full design rules.
- Every `Assets/CSS/` and `Assets/JS/` link ends in the same `?v=YYYY-MM-DD` tag on every page. When you change any CSS or JS file, change the tag on all pages to that day's date.
- A new page loads `Notify.js` first and `Navbar.js` last, copies the footer (legal links and `.copyright-years`), and gets added to the page list in `tests/api_test.sh`.

---

## Deployment

1. Upload the changed files to Hostinger with FTP or the File Manager.
2. There's no build step. The files in the repo are the files that run.
3. `Assets/PHP/db_config.php` has to exist on the server with the production credentials. Git ignores it and you don't upload it from the repo; create or edit it on the server.
4. Don't upload `tests/`. Its own `.htaccess` blocks it anyway.
5. If a change adds database columns, run its `Data/migrations/` script in phpMyAdmin before you upload the PHP that uses them.
6. If you changed any CSS or JS file, bump the `?v=` tag first so visitors get the new files instead of cached ones. One command does every page (Git Bash, from the project folder; put in today's date):

   ```bash
   sed -i -E 's/\?v=[0-9-]+"/?v=2026-10-22"/g' *.html
   ```

   Then upload the HTML pages along with the changed CSS and JS. `bash tests/run-tests.sh` fails if any page has a different tag or none.
