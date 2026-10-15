#!/bin/bash
# Serve the site locally for manual testing (Git Bash):
#
#   bash tests/dev-server.sh
#
# → http://localhost:8080, using your dev database `threefrogs_local`.
# Emails the site sends (verification, booking, reset) are caught and saved
# to tests/.tmp/mail-dev/NNN.eml instead of being delivered — open them to
# click verification/reset links. Press Ctrl+C to stop.
source "$(dirname "$0")/lib.sh"

PORT=8080
SMTP_PORT=2525
MAIL_DIR="$TMP_DIR/mail-dev"

require_mariadb
use_pid_file dev-server
trap stop_all EXIT INT TERM

start_mail_sink "$SMTP_PORT" "$MAIL_DIR"
start_apache "$PORT" "$SMTP_PORT" threefrogs_local

echo "Three Frogs running at http://localhost:$PORT  (DB: threefrogs_local)"
echo "Captured emails: $(cygpath -w "$MAIL_DIR")"
echo "Press Ctrl+C to stop."
while true; do sleep 3600; done
