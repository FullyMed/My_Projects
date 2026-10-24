<?php
/*
 * Shared security helpers: hardened sessions, CSRF tokens, and DB-backed rate limiting.
 * require_once this from any endpoint that starts a session or accepts a state-changing request.
 *
 * Run this SQL once on your database before rate limiting will engage (it fails open if missing):
 *
 * CREATE TABLE IF NOT EXISTS rate_limits (
 *   id         INT AUTO_INCREMENT PRIMARY KEY,
 *   action     VARCHAR(50)  NOT NULL,
 *   identifier VARCHAR(255) NOT NULL,
 *   created_at DATETIME     NOT NULL,
 *   INDEX idx_action_identifier_time (action, identifier, created_at)
 * );
 */

function secure_session_start(): bool {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443)
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    return session_start();
}

// Returns the current session's CSRF token, generating one on first use.
function csrf_token(): string {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        secure_session_start();
    }
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token(?string $submitted): bool {
    if (empty($_SESSION['csrf_token']) || empty($submitted)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $submitted);
}

// Looks for a CSRF token in the X-CSRF-Token header, form POST body, or a
// pre-decoded JSON body (pass the array you already json_decode'd — reading
// php://input twice is not reliable across SAPIs).
function get_submitted_csrf_token(array $jsonBody = []): ?string {
    if (!empty($_SERVER['HTTP_X_CSRF_TOKEN'])) {
        return $_SERVER['HTTP_X_CSRF_TOKEN'];
    }
    if (!empty($_POST['csrf_token'])) {
        return $_POST['csrf_token'];
    }
    if (!empty($jsonBody['csrf_token'])) {
        return $jsonBody['csrf_token'];
    }
    return null;
}

// Whether this session's login still counts. A password reset bumps
// users.session_version (forgot_password.php), so every session that logged in
// before it no longer matches and is ended here, on whatever device it is.
// A deleted account ends its sessions too. Sessions from before this check
// existed carry no version and count as 0, the column's default, so a deploy
// doesn't log everyone out. Also refreshes the session's verified flag.
function session_user_is_current(mysqli $conn): bool {
    if (empty($_SESSION['user']['email'])) {
        return false;
    }

    $stmt = $conn->prepare("SELECT session_version, email_verified_at FROM users WHERE email = ?");
    $stmt->bind_param("s", $_SESSION['user']['email']);
    $stmt->execute();
    $stmt->bind_result($version, $verifiedAt);
    $found = $stmt->fetch();
    $stmt->close();

    if (!$found || (int) $version !== (int) ($_SESSION['user']['session_version'] ?? 0)) {
        $_SESSION = [];
        session_regenerate_id(true);
        return false;
    }

    $_SESSION['user']['verified'] = $verifiedAt !== null;
    return true;
}

function client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Fails OPEN (returns false / "not exceeded") if the rate_limits table doesn't
// exist yet, so a missing migration can never lock every user out of login.
// db_connect.php enables MYSQLI_REPORT_STRICT, so DB errors arrive as
// exceptions — they must be caught here, not checked via a false return.
function rate_limit_exceeded(mysqli $conn, string $action, string $identifier, int $maxAttempts, int $windowMinutes): bool {
    try {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM rate_limits WHERE action = ? AND identifier = ? AND created_at > (NOW() - INTERVAL ? MINUTE)");
        $stmt->bind_param("ssi", $action, $identifier, $windowMinutes);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count >= $maxAttempts;
    } catch (mysqli_sql_exception $e) {
        error_log("rate_limit_exceeded: " . $e->getMessage());
        return false;
    }
}

function record_attempt(mysqli $conn, string $action, string $identifier): void {
    try {
        $stmt = $conn->prepare("INSERT INTO rate_limits (action, identifier, created_at) VALUES (?, ?, NOW())");
        $stmt->bind_param("ss", $action, $identifier);
        $stmt->execute();
        $stmt->close();

        // Occasional cheap garbage-collection so the table doesn't grow forever.
        if (random_int(1, 100) === 1) {
            $conn->query("DELETE FROM rate_limits WHERE created_at < (NOW() - INTERVAL 1 DAY)");
        }
    } catch (mysqli_sql_exception $e) {
        error_log("record_attempt: " . $e->getMessage());
    }
}

// Where emailed links (password reset) point. Optional SITE_URL in
// db_config.php overrides it for local dev; never derived from the Host
// header, which an attacker controls.
function site_url(): string {
    return rtrim(defined('SITE_URL') ? SITE_URL : 'https://threefrogsboardgame.com', '/');
}

// Replaces any outstanding verification link for $email with a fresh one
// (24-hour expiry) and emails it. Returns whether the email was handed off.
function send_verification_email(mysqli $conn, string $email, string $name): bool {
    $del = $conn->prepare("DELETE FROM email_verification_tokens WHERE email = ?");
    $del->bind_param("s", $email);
    $del->execute();
    $del->close();

    $token     = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    $ins = $conn->prepare("INSERT INTO email_verification_tokens (email, token, expires_at) VALUES (?, ?, ?)");
    $ins->bind_param("sss", $email, $token, $expiresAt);
    $ins->execute();
    $ins->close();

    return send_site_email(
        $email,
        "Three Frogs - Please verify your email",
        "Hi $name,\r\n\r\n"
        . "Thanks for signing up at Three Frogs! Open this link to confirm your email address. It works for 24 hours:\r\n\r\n"
        . site_url() . "/Verify-email.html?token=" . urlencode($token) . "\r\n\r\n"
        . "Once that's done, you can book a table.\r\n\r\n"
        . "If you didn't sign up, you can ignore this email.\r\n\r\n"
        . "See you at the table,\r\n"
        . "Three Frogs Boardgame"
    );
}

// Plain-text email from the café's no-reply address. Returns false (and logs)
// if the server couldn't hand the message off — callers should never fail
// the user's actual request because of that.
function send_site_email(string $to, string $subject, string $body): bool {
    $headers = implode("\r\n", [
        "From: Three Frogs <noreply@threefrogsboardgame.com>",
        "Reply-To: noreply@threefrogsboardgame.com",
        "Content-Type: text/plain; charset=UTF-8",
        "X-Mailer: PHP/" . phpversion()
    ]);
    $sent = @mail($to, $subject, $body, $headers);
    if (!$sent) {
        error_log("send_site_email: mail() failed for subject '$subject'");
    }
    return $sent;
}
