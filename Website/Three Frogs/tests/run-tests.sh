#!/bin/bash
# One-command end-to-end test run (Git Bash, from anywhere):
#
#   bash tests/run-tests.sh
#
# Needs: XAMPP (Apache + PHP + MariaDB on port 3307, MariaDB started) and Python.
# It never touches your dev data: it (re)creates a throwaway `threefrogs_test`
# database from Data/schema.sql, starts its own Apache on port 8081 pointed at
# that DB plus a mail catcher on 2526, runs tests/api_test.sh, fails if PHP
# logged any warning/notice, then shuts everything down.
source "$(dirname "$0")/lib.sh"

PORT=8081
SMTP_PORT=2526
DB_NAME=threefrogs_test
MAIL_DIR="$TMP_DIR/mail-test"

require_mariadb
use_pid_file run-tests
trap stop_all EXIT

echo "Preparing $DB_NAME…"
$MYSQL -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" || exit 1
$MYSQL "$DB_NAME" < "$PROJECT_DIR/Data/schema.sql" || exit 1
# The app connects as the dev user from db_config.php; give it the test DB too.
DEV_USER=$(grep -o 'DB_USER", *"[^"]*"' "$PROJECT_DIR/Assets/PHP/db_config.php" | sed 's/.*"\([^"]*\)"$/\1/')
for host in localhost 127.0.0.1; do
  $MYSQL -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DEV_USER'@'$host';" 2>/dev/null
done

rm -rf "$MAIL_DIR"
rm -f "$TMP_DIR/php_errors-$PORT.log"

start_mail_sink "$SMTP_PORT" "$MAIL_DIR"
start_apache "$PORT" "$SMTP_PORT" "$DB_NAME"

BASE="http://127.0.0.1:$PORT" DB_NAME="$DB_NAME" MAIL_DIR="$MAIL_DIR" MYSQL="$MYSQL" \
  bash "$TESTS_DIR/api_test.sh"
STATUS=$?

# Anything PHP logged as a warning/notice/error is a bug even if the API answered.
PHP_LOG="$TMP_DIR/php_errors-$PORT.log"
if [ -s "$PHP_LOG" ] && grep -qE "PHP (Warning|Notice|Deprecated|Fatal|Parse)" "$PHP_LOG"; then
  echo
  echo "FAIL  PHP logged problems during the run:"
  grep -E "PHP (Warning|Notice|Deprecated|Fatal|Parse)" "$PHP_LOG" | sort | uniq -c | head -20
  STATUS=1
fi

echo
[ $STATUS -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit $STATUS
