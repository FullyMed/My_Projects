#!/bin/bash
# End-to-end API checks. Normally run via tests/run-tests.sh, which sets:
#   BASE      site URL            (e.g. http://127.0.0.1:8081)
#   DB_NAME   throwaway database  (must end in _test — this script wipes it)
#   MAIL_DIR  folder smtp_sink.py saves emails into
#   MYSQL     mysql client command (root on the XAMPP MariaDB)
cd "$(dirname "$0")"

: "${BASE:?set BASE}" "${DB_NAME:?set DB_NAME}" "${MAIL_DIR:?set MAIL_DIR}" "${MYSQL:?set MYSQL}"
if [[ "$DB_NAME" != *_test ]]; then
  echo "Refusing to run: DB_NAME '$DB_NAME' doesn't end in _test, and this script deletes all its data."
  exit 1
fi

B="$BASE/Assets/PHP"
JAR_DIR="$(mktemp -d)"
DB="$MYSQL $DB_NAME -N -e"
PASS=0; FAIL=0

$DB "DELETE FROM bookings; DELETE FROM cancellations; DELETE FROM users; DELETE FROM rate_limits; DELETE FROM password_reset_tokens; DELETE FROM email_verification_tokens;"

# ---------- helpers ----------
check() { # NAME EXPECTED_SUBSTRING ACTUAL
  if [[ "$3" == *"$2"* ]]; then PASS=$((PASS+1)); echo "PASS  $1"
  else FAIL=$((FAIL+1)); echo "FAIL  $1"; echo "      expected: $2"; echo "      got:      ${3:0:400}"; fi
}
check_not() { # NAME UNEXPECTED_SUBSTRING ACTUAL
  if [[ "$3" != *"$2"* ]]; then PASS=$((PASS+1)); echo "PASS  $1"
  else FAIL=$((FAIL+1)); echo "FAIL  $1"; echo "      did not expect: $2"; echo "      got:            ${3:0:400}"; fi
}
jar() { echo "$JAR_DIR/$1"; }
tok() { curl -s -b "$(jar $1)" -c "$(jar $1)" -X POST $B/check_session.php | php -r '$j=json_decode(stream_get_contents(STDIN),true); echo $j["csrfToken"] ?? "";'; }
session() { curl -s -b "$(jar $1)" -c "$(jar $1)" -X POST $B/check_session.php; }
post_form() { local u=$1 ep=$2; shift 2; curl -s -w " [%{http_code}]" -b "$(jar $u)" -c "$(jar $u)" -X POST $B/$ep "$@"; }
post_json() { curl -s -w " [%{http_code}]" -b "$(jar $1)" -c "$(jar $1)" -X POST $B/$2 -H "Content-Type: application/json" -d "$3"; }
json_field() { php -r '$s=stream_get_contents(STDIN); $s=preg_replace("/ \[\d+\]$/","",$s); $j=json_decode($s,true); $v=$j; foreach(explode(".",$argv[1]) as $k){$v=$v[$k]??null;} echo is_bool($v)?($v?"true":"false"):$v;' "$1"; }

signup() { # USER NAME EMAIL
  local t=$(tok $1)
  post_form $1 signup.php --data-urlencode "name=$2" --data-urlencode "email=$3" -d "password=password123&avatar=Assets/Images/Avatars/Shark.jpg&csrf_token=$t"
}
login() { # USER EMAIL [PASSWORD]
  local t=$(tok $1)
  post_form $1 login.php --data-urlencode "email=$2" --data-urlencode "password=${3:-password123}" -d "csrf_token=$t"
}
book() { # USER DATE START END PEOPLE [NAME]
  local t=$(tok $1)
  post_json $1 booking.php "{\"name\":\"${6:-Tester}\",\"date\":\"$2\",\"start\":\"$3\",\"end\":\"$4\",\"people\":\"$5\",\"csrf_token\":\"$t\"}"
}
resend() { local t=$(tok $1); post_form $1 resend_verification.php -d "csrf_token=$t"; }
verify() { post_form nobody verify_email.php -d "token=$1"; }
staff_list() { post_json $1 staff_bookings.php "{\"date\":\"$2\"}"; }
staff_cancel() { local t=$(tok $1); post_json $1 staff_cancel_booking.php "{\"id\":$2,\"reason\":\"$3\",\"csrf_token\":\"$t\"}"; }
self_cancel() { local t=$(tok $1); post_json $1 cancel_booking.php "{\"id\":$2,\"csrf_token\":\"$t\"}"; }
verification_token() { $DB "SELECT token FROM email_verification_tokens WHERE email='$1'"; }
mark_verified() { $DB "UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL"; }
clear_rate_limits() { $DB "DELETE FROM rate_limits"; }
all_mail() { cat "$MAIL_DIR"/*.eml 2>/dev/null; }

d() { php -r 'date_default_timezone_set("Asia/Jakarta"); echo date("Y-m-d", strtotime($argv[1]));' -- "$1"; }
YESTERDAY=$(d "-1 day"); TOMORROW=$(d "+1 day"); D2=$(d "+2 days"); D3=$(d "+3 days"); D30=$(d "+30 days"); D31=$(d "+31 days")

echo "=== Static pages + server config"
H=$(curl -sI "$BASE/")
check     "CSP: scripts from self only"      "script-src 'self';"           "$H"
check_not "no jQuery CDN in CSP"             "code.jquery.com"              "$H"
check     "404 page under a nested path"     "Page Not Found"               "$(curl -s "$BASE/no/such/page")"
check     "404 status"                       "404"                          "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/no/such/page")"
check     "db_config.php blocked"            "403"                          "$(curl -s -o /dev/null -w '%{http_code}' "$B/db_config.php")"
check     "schema.sql blocked"               "403"                          "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/Data/schema.sql")"
check     "migration blocked"                "403"                          "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/Data/migrations/2026-10-15-verification-and-staff.sql")"
check     "tests/ blocked"                   "403"                          "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/tests/run-tests.sh")"
for page in index Booking Collection Dashboard Login Signup About Forgot-password Terms-of-Use Privacy-Policy Staff Verify-email; do
  HTML=$(curl -s "$BASE/$page.html")
  check   "$page.html loads Notify.js"        "Assets/JS/Notify.js"          "$HTML"
  check   "$page.html footer legal links"     "footer-links"                 "$HTML"
  check_not "$page.html has no jQuery"        "jquery"                       "$HTML"
  check   "$page.html logo links home"        'href="index.html" class="logo"' "$HTML"
  check   "$page.html back-to-top labelled"   'aria-label="Back to top"'     "$HTML"
  check_not "$page.html no emoji buttons"     "⬆️"                           "$HTML"
done
for page in Login Signup Forgot-password; do
  check   "$page.html password toggle is a button" 'class="toggle-password" aria-label="Show password"' "$(curl -s "$BASE/$page.html")"
done
CSS=$(curl -s "$BASE/Assets/CSS/Boardgame.css")
check     "CSS: readable gold for links"     "--color-accent-text"          "$CSS"
check     "CSS: visible input borders"       "--color-input-border"         "$CSS"
check     "CSS: keyboard focus style"        ":focus-visible"               "$CSS"
check_not "CSS: no max-height menu anim"     "max-height 0.35s"             "$CSS"

echo "=== Signup + name rules"
R=$(signup a 'Alice Tester' 'Alice@Example.com')
check "signup ok"                        '[201]'                        "$R"
check "signup sends verification email"  '"verificationEmailSent":true' "$R"
check "new account starts unverified"    '"emailVerified":false'        "$(session a)"
check "signup duplicate"                 '[409]'                        "$(signup x 'Alice Again' 'alice@example.com')"
check "signup bad csrf"                  '[403]'                        "$(post_form x signup.php -d 'name=X&email=x@x.com&password=password123&csrf_token=bad')"
check "name with apostrophe ok"          '[201]'                        "$(signup b "Siti  Nur'aini" 'userb@example.com')"
check "stored name: spaces collapsed"    "Siti Nur'aini"                "$($DB "SELECT name FROM users WHERE email='userb@example.com'")"
check "name with hyphen ok"              '[201]'                        "$(signup c 'Jean-Luc Picard' 'userc@example.com')"
# Accented names are sent as explicit UTF-8 bytes — the shell's own encoding may not be UTF-8.
check "name with accents ok"             '[201]'                        "$(signup d $'JosÃ© MÃ¼ller' 'userd@example.com')"
check "stored accented name intact"      '4A6F73C3A9204DC3BC6C6C6572'   "$($DB "SELECT HEX(name) FROM users WHERE email='userd@example.com'")"  # "José Müller" in UTF-8
check "non-UTF-8 name: clean 400"        'characters we can'           "$(signup x $'José' 'x0@example.com')"
check "non-UTF-8 booking body: clean 400" '[400]'                    "$(book a $TOMORROW 14:00 16:00 2 $'José')"
check "name with period ok"              '[201]'                        "$(signup e 'M. Rizky' 'usere@example.com')"
clear_rate_limits   # signup allows 8 per IP per hour
check "name with < rejected"             'have to start with a letter'     "$(signup x 'Bob<script>' 'x1@example.com')"
check "name starting with ' rejected"    'have to start with a letter'     "$(signup x "'Bob" 'x2@example.com')"
check "name with digits rejected"        'have to start with a letter'     "$(signup x 'R2D2' 'x3@example.com')"
check "blank name rejected"              '[400]'                        "$(signup x '   ' 'x4@example.com')"
check "short password rejected"          'at least 8'                   "$(t=$(tok x); post_form x signup.php -d "name=Bob&email=bob@example.com&password=short&csrf_token=$t")"
check "email stored lowercase"           'alice@example.com'            "$($DB "SELECT email FROM users WHERE name='Alice Tester'")"

echo "=== Email verification"
check "unverified can't book"            '"code":"email_unverified"'    "$(book a $TOMORROW 14:00 16:00 2)"
check "verification email has link"      "/Verify-email.html?token="    "$(all_mail)"
FIRST_TOKEN=$(verification_token alice@example.com)
check "resend logged out"                '[401]'                        "$(post_form nobody resend_verification.php -d 'csrf_token=x')"
check "resend without csrf"              '[403]'                        "$(post_form a resend_verification.php -d 'csrf_token=bad')"
check "resend ok"                        '"success":true'               "$(resend a)"
SECOND_TOKEN=$(verification_token alice@example.com)
check "resend replaces the token"        'x'                            "$([ -n "$SECOND_TOKEN" ] && [ "$FIRST_TOKEN" != "$SECOND_TOKEN" ] && echo x)"
check "old link no longer works"         'already used it' "$(verify "$FIRST_TOKEN")"
check "garbage token rejected"           '[400]'                        "$(verify deadbeef)"
check "verify ok"                        '"success":true'               "$(verify "$SECOND_TOKEN")"
check "link is single-use"               'already used it'            "$(verify "$SECOND_TOKEN")"
check "other device's session catches up" '"emailVerified":true'        "$(session a)"
check "resend when already verified"     '"alreadyVerified":true'       "$(resend a)"
signup f 'User F' 'userf@example.com' >/dev/null
check "resend 1"                         '"success":true'               "$(resend f)"
check "resend 2"                         '"success":true'               "$(resend f)"
check "resend 3"                         '"success":true'               "$(resend f)"
check "resend 4 rate-limited"            '[429]'                        "$(resend f)"
signup g 'User G' 'userg@example.com' >/dev/null
$DB "SET time_zone='+07:00'; UPDATE email_verification_tokens SET expires_at = NOW() - INTERVAL 1 MINUTE WHERE email='userg@example.com'"
check "expired link rejected"            'has expired'                  "$(verify "$(verification_token userg@example.com)")"
signup h 'User H' 'userh@example.com' >/dev/null
post_form nobody request_reset.php -d 'email=userh@example.com' >/dev/null
RESET_H=$($DB "SELECT token FROM password_reset_tokens WHERE email='userh@example.com'")
post_form nobody forgot_password.php -d "token=$RESET_H&password=password123" >/dev/null
check "password reset also verifies"     '1'                            "$($DB "SELECT email_verified_at IS NOT NULL FROM users WHERE email='userh@example.com'")"

echo "=== Login / session"
check "logout"                           '"success":true'               "$(post_form a logout.php)"
check "session cleared"                  '"loggedIn":false'             "$(session a)"
check "login wrong password"             '[401]'                        "$(login a alice@example.com wrongpass1)"
check "login mixed-case email"           '"success":true'               "$(login a ALICE@example.COM)"
S=$(session a)
check "session has avatar"               'Shark.jpg'                    "$S"
check "session: verified"                '"emailVerified":true'         "$S"
check "session: not staff"               '"isStaff":false'              "$S"

echo "=== Avatar"
check "avatar update ok"                 '"success":true'               "$(t=$(tok a); post_form a update_avatar.php -d "avatar=Assets/Images/Avatars/Whale.jpg&csrf_token=$t")"
check "avatar not whitelisted"           '[400]'                        "$(t=$(tok a); post_form a update_avatar.php -d "avatar=../../evil.jpg&csrf_token=$t")"
check "avatar no csrf"                   '[403]'                        "$(post_form a update_avatar.php -d "avatar=Assets/Images/Avatars/Cow.jpg")"
check "avatar logged out"                '[401]'                        "$(post_form nobody update_avatar.php -d "avatar=Assets/Images/Avatars/Cow.jpg")"

echo "=== Booking validation"
mark_verified
check "booking logged out"               '[401]'                        "$(book nobody $TOMORROW 14:00 16:00 2)"
check "booking bad csrf"                 '[403]'                        "$(post_json a booking.php "{\"name\":\"A\",\"date\":\"$TOMORROW\",\"start\":\"14:00\",\"end\":\"15:00\",\"people\":2,\"csrf_token\":\"bad\"}")"
check "booking past date"                'already passed'        "$(book a $YESTERDAY 14:00 16:00 2)"
check "booking 31 days ahead"            'up to 30 days ahead'     "$(book a $D31 14:00 16:00 2)"
check "booking invalid date"             'date isn'                 "$(book a 2026-02-31 14:00 16:00 2)"
check "booking before open"              'between 12:00 and 22:00'      "$(book a $TOMORROW 11:00 13:00 2)"
check "booking after close"              'between 12:00 and 22:00'      "$(book a $TOMORROW 21:00 23:00 2)"
check "booking end<=start"               'needs to be after the start'       "$(book a $TOMORROW 16:00 15:00 2)"
check "booking 9 people"                 '1 to 8 people'              "$(book a $TOMORROW 14:00 16:00 9)"
check "booking 0 people"                 '1 to 8 people'              "$(book a $TOMORROW 14:00 16:00 0)"
check "booking 2.5 people"               '1 to 8 people'              "$(book a $TOMORROW 14:00 16:00 2.5)"
check "booking bad time"                 'time isn'                 "$(book a $TOMORROW 1400 16:00 2)"
check "booking name with <"              'characters we can'           "$(book a $TOMORROW 14:00 16:00 2 'A<b>')"
check "booking empty body"               '[400]'                        "$(post_json a booking.php 'nope')"
check "booking 30 days ahead ok"         '[201]'                        "$(book h $D30 12:00 13:00 2)"

echo "=== Booking limits + capacity (4 tables, 3 upcoming per account)"
check "a books 14-16"                    '[201]'                        "$(book a $TOMORROW 14:00 16:00 2 'Alice Tester')"
check "confirmation emailed"             '"emailSent":true'             "$(book a $TOMORROW 18:00 19:00 8)"
check "a overlaps self"                  'already have a booking'       "$(book a $TOMORROW 15:00 17:00 2)"
check "a exact duplicate"                'already have a booking'       "$(book a $TOMORROW 14:00 16:00 2)"
check "a 3rd upcoming ok"                '[201]'                        "$(book a $D2 12:00 13:00 2)"
check "a 4th upcoming refused"           'the most one account can hold'         "$(book a $D2 14:00 15:00 2)"
check "b books 14-16 (table 2)"          '[201]'                        "$(book b $TOMORROW 14:00 16:00 4)"
check "c books 15-17 (table 3)"          '[201]'                        "$(book c $TOMORROW 15:00 17:00 4)"
check "d books 13-14:30 (table 4)"       '[201]'                        "$(book d $TOMORROW 13:00 14:30 4)"
check "e 14-15 ok (only 3 in use)"       '[201]'                        "$(book e $TOMORROW 14:00 15:00 2)"
check "e 15:30-16 ok (table 4)"          '[201]'                        "$(book e $TOMORROW 15:30 16:00 2)"
check "f 15:45-16 full (4 in use)"       'All 4 tables are taken'      "$(book f $TOMORROW 15:45 16:00 2)"
check "f 12-14 ok"                       '[201]'                        "$(book f $TOMORROW 12:00 14:00 2)"
check "g 19-22 ok (back-to-back)"        '[201]'                        "$(book g $TOMORROW 19:00 22:00 8)"

echo "=== Dashboard bookings + self-cancel"
GB=$(post_form a get_bookings.php)
check "get bookings"                     '"remaining_cancels":2'        "$GB"
check "times are HH:MM"                  '"start_time":"14:00"'         "$GB"
check "status included"                  '"status":"active"'            "$GB"
A1=$($DB "SELECT id FROM bookings WHERE email='alice@example.com' ORDER BY date, start_time LIMIT 1")
A2=$($DB "SELECT id FROM bookings WHERE email='alice@example.com' ORDER BY date, start_time LIMIT 1 OFFSET 1")
BID=$($DB "SELECT id FROM bookings WHERE email='userb@example.com' LIMIT 1")
check "cancel someone else's"            '[404]'                        "$(self_cancel a $BID)"
check "cancel without csrf"              '[403]'                        "$(post_json a cancel_booking.php "{\"id\":$A1}")"
check "cancel bad id"                    '[400]'                        "$(self_cancel a abc)"
check "cancel #1"                        '"remaining_cancels":1'        "$(self_cancel a $A1)"
check "cancel same again"                '[404]'                        "$(self_cancel a $A1)"
check "cancel #2"                        '"remaining_cancels":0'        "$(self_cancel a $A2)"
book a $TOMORROW 20:00 21:00 2 >/dev/null
A3=$($DB "SELECT id FROM bookings WHERE email='alice@example.com' AND start_time='20:00:00'")
check "monthly cancel limit"             'cancellations for this month'   "$(self_cancel a $A3)"
check "cancellations logged"             '2'                            "$($DB "SELECT COUNT(*) FROM cancellations WHERE email='alice@example.com'")"
$DB "INSERT INTO bookings (name,email,date,start_time,end_time,people,status) VALUES ('Old','userb@example.com','$YESTERDAY','14:00','16:00',2,'active')"
OLD=$($DB "SELECT id FROM bookings WHERE date='$YESTERDAY'")
check "history includes past"            "\"date\":\"$YESTERDAY\""      "$(post_form b get_bookings.php)"
check "can't cancel past booking"        'already started'              "$(self_cancel b $OLD)"

echo "=== Staff page"
for u in b c d f; do book $u $D3 15:00 16:00 3 >/dev/null; done
check "staff list logged out"            '[401]'                        "$(staff_list nobody $D3)"
check "staff list as non-staff"          '[403]'                        "$(staff_list a $D3)"
$DB "UPDATE users SET is_staff = 1 WHERE email='userc@example.com'"
SL=$(staff_list c $D3)
check "staff list (role checked in DB)"  '"success":true'               "$SL"
check "staff sees booking names"         "Siti Nur'aini"                "$SL"
check "hourly: 4/4 at 15:00"             '"15:00":4'                    "$SL"
check "hourly: 0 at 14:00"               '"14:00":0'                    "$SL"
check "totals"                           '"totals":{"bookings":4,"people":12}' "$SL"
check "staff list bad date"              '[400]'                        "$(staff_list c 2026-13-01)"
login c userc@example.com >/dev/null
check "staff flag in session after login" '"isStaff":true'              "$(session c)"
SB=$($DB "SELECT id FROM bookings WHERE email='userb@example.com' AND date='$D3'")
check "staff cancel: non-staff"          '[403]'                        "$(staff_cancel a $SB 'x')"
check "staff cancel: no csrf"            '[403]'                        "$(post_json c staff_cancel_booking.php "{\"id\":$SB}")"
R=$(staff_cancel c $SB 'Private event')
check "staff cancel ok"                  '"success":true'               "$R"
check "staff cancel emails customer"     '"emailSent":true'             "$R"
check "booking kept as cancelled_by_cafe" 'cancelled_by_cafe'           "$($DB "SELECT status FROM bookings WHERE id=$SB")"
check "doesn't use customer's cancels"   '0'                            "$($DB "SELECT COUNT(*) FROM cancellations WHERE email='userb@example.com'")"
check "customer sees café cancellation"  '"status":"cancelled_by_cafe"' "$(post_form b get_bookings.php)"
check "customer can't self-cancel it"    '[404]'                        "$(self_cancel b $SB)"
check "staff cancel twice"               '[409]'                        "$(staff_cancel c $SB 'again')"
check "staff can't cancel past booking"  '[409]'                        "$(staff_cancel c $OLD 'x')"
check "freed table: 3/4 at 15:00"        '"15:00":3'                    "$(staff_list c $D3)"
check "freed table is bookable"          '[201]'                        "$(book h $D3 15:00 16:00 2)"
check "cancellation email content"       'Reason: Private event'        "$(all_mail)"

echo "=== Password reset"
check "reset invalid email"              '[400]'                        "$(post_form nobody request_reset.php -d 'email=notanemail')"
check "reset unknown email"              '"success":true'               "$(post_form nobody request_reset.php -d 'email=nobody@example.com')"
check "reset known email"                '"success":true'               "$(post_form nobody request_reset.php -d 'email=userb@example.com')"
TOKEN=$($DB "SELECT token FROM password_reset_tokens WHERE email='userb@example.com'")
check "reset token stored"               'x'                            "x${TOKEN:0:1}"
check "reset bad token"                  'work anymore'           "$(post_form nobody forgot_password.php -d 'token=deadbeef&password=newpassword1')"
check "reset short password"             'at least 8'                   "$(post_form nobody forgot_password.php -d "token=$TOKEN&password=short")"
check "reset ok"                         '"success":true'               "$(post_form nobody forgot_password.php -d "token=$TOKEN&password=newpassword1")"
check "token consumed"                   '0'                            "$($DB "SELECT COUNT(*) FROM password_reset_tokens WHERE email='userb@example.com'")"
check "login with new password"          '"success":true'               "$(login y userb@example.com newpassword1)"
post_form nobody request_reset.php -d 'email=userd@example.com' >/dev/null
$DB "SET time_zone='+07:00'; UPDATE password_reset_tokens SET expires_at = NOW() - INTERVAL 1 MINUTE"
check "reset expired token"              'expired'                      "$(post_form nobody forgot_password.php -d "token=$($DB "SELECT token FROM password_reset_tokens WHERE email='userd@example.com'")&password=newpassword1")"

echo "=== Rate limiting"
clear_rate_limits
for i in 1 2 3 4 5; do login r userd@example.com wrongwrong >/dev/null; done
check "login locked after 5 failures"    '[429]'                        "$(login r userd@example.com password123)"

echo "=== Emails"
MAILS=$(all_mail)
check "booking confirmation sent"        'Booking confirmed'         "$MAILS"
check "café-cancellation email sent"     'Your booking has been cancelled' "$MAILS"
check "verification email sent"          'Please verify your email'     "$MAILS"
check "reset link in email"              '/Forgot-password.html?token=' "$MAILS"

rm -rf "$JAR_DIR"
echo
echo "RESULT: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ]
