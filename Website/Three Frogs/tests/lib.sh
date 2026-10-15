#!/bin/bash
# Shared helpers for run-tests.sh and dev-server.sh (Git Bash on Windows + XAMPP).
# Sourced, not run directly.

XAMPP="${XAMPP:-C:/xampp}"
XAMPP_UNIX="$(cygpath -u "$XAMPP")"
MYSQL_PORT="${MYSQL_PORT:-3307}"
MYSQL="$XAMPP_UNIX/mysql/bin/mysql.exe -uroot -P$MYSQL_PORT -h127.0.0.1"

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$TESTS_DIR/.." && pwd)"
TMP_DIR="$TESTS_DIR/.tmp"
mkdir -p "$TMP_DIR"

PIDS_TO_KILL=()
# Windows PIDs of everything this run starts, so the next run can clean up
# if this one was killed without running its EXIT trap (e.g. window closed).
PID_FILE=""

# use_pid_file NAME — kill anything a previous run of NAME left behind, then
# record this run's processes in tests/.tmp/NAME.pids
use_pid_file() {
  PID_FILE="$TMP_DIR/$1.pids"
  if [ -f "$PID_FILE" ]; then
    while read -r pid; do
      [ -n "$pid" ] && taskkill //F //T //PID "$pid" >/dev/null 2>&1
    done < "$PID_FILE"
    rm -f "$PID_FILE"
    sleep 1
  fi
}

remember_pid() {
  PIDS_TO_KILL+=("$1")
  [ -n "$PID_FILE" ] && echo "$1" >> "$PID_FILE"
}

require_mariadb() {
  if ! $MYSQL -e "SELECT 1" >/dev/null 2>&1; then
    echo "ERROR: can't reach XAMPP MariaDB on port $MYSQL_PORT as root."
    echo "       Start MySQL in the XAMPP Control Panel and try again."
    exit 1
  fi
}

# start_apache PORT SMTP_PORT DB_NAME — serves the project with XAMPP's Apache
start_apache() {
  local port=$1 smtp_port=$2 db_name=$3
  local conf="$TMP_DIR/httpd-$port.conf"
  sed -e "s#@XAMPP@#$XAMPP#g" \
      -e "s#@PORT@#$port#g" \
      -e "s#@SMTP_PORT@#$smtp_port#g" \
      -e "s#@DB_NAME@#$db_name#g" \
      -e "s#@TMP@#$(cygpath -m "$TMP_DIR")#g" \
      -e "s#@DOCROOT@#$(cygpath -m "$PROJECT_DIR")#g" \
      "$TESTS_DIR/httpd.conf.template" > "$conf"

  if ! "$XAMPP_UNIX/apache/bin/httpd.exe" -t -f "$(cygpath -m "$conf")" >/dev/null 2>&1; then
    echo "ERROR: generated Apache config is invalid:"
    "$XAMPP_UNIX/apache/bin/httpd.exe" -t -f "$(cygpath -m "$conf")"
    exit 1
  fi

  "$XAMPP_UNIX/apache/bin/httpd.exe" -f "$(cygpath -m "$conf")" -DFOREGROUND &
  remember_pid "$(cat /proc/$!/winpid)"

  for _ in $(seq 1 30); do
    curl -s -o /dev/null "http://127.0.0.1:$port/" && return 0
    sleep 0.5
  done
  echo "ERROR: Apache didn't start on port $port (is something else using it?)."
  echo "       See $TMP_DIR/apache_error-$port.log"
  exit 1
}

# start_mail_sink PORT FOLDER
start_mail_sink() {
  local port=$1 folder=$2
  mkdir -p "$folder"
  python "$(cygpath -m "$TESTS_DIR/smtp_sink.py")" "$port" "$(cygpath -m "$folder")" >/dev/null &
  remember_pid "$(cat /proc/$!/winpid)"
  sleep 1
}

# Apache on Windows runs a parent + child process; kill each whole tree.
stop_all() {
  for pid in "${PIDS_TO_KILL[@]}"; do
    taskkill //F //T //PID "$pid" >/dev/null 2>&1
  done
  PIDS_TO_KILL=()
  [ -n "$PID_FILE" ] && rm -f "$PID_FILE"
}
