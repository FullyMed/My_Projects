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

function client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Fails OPEN (returns false / "not exceeded") if the rate_limits table doesn't
// exist yet, so a missing migration can never lock every user out of login.
function rate_limit_exceeded(mysqli $conn, string $action, string $identifier, int $maxAttempts, int $windowMinutes): bool {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM rate_limits WHERE action = ? AND identifier = ? AND created_at > (NOW() - INTERVAL ? MINUTE)");
    if (!$stmt) {
        error_log("rate_limit_exceeded: prepare failed: " . $conn->error);
        return false;
    }
    $stmt->bind_param("ssi", $action, $identifier, $windowMinutes);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count >= $maxAttempts;
}

function record_attempt(mysqli $conn, string $action, string $identifier): void {
    $stmt = $conn->prepare("INSERT INTO rate_limits (action, identifier, created_at) VALUES (?, ?, NOW())");
    if (!$stmt) {
        error_log("record_attempt: prepare failed: " . $conn->error);
        return;
    }
    $stmt->bind_param("ss", $action, $identifier);
    $stmt->execute();
    $stmt->close();

    // Occasional cheap garbage-collection so the table doesn't grow forever.
    if (random_int(1, 100) === 1) {
        $conn->query("DELETE FROM rate_limits WHERE created_at < (NOW() - INTERVAL 1 DAY)");
    }
}
