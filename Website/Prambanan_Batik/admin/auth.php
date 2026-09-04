<?php

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

function isAdminLoggedIn() {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['admin_email'])) {
        return false;
    }
    if (!isset($_SESSION['admin_login_time']) || (time() - $_SESSION['admin_login_time']) > SESSION_TIMEOUT) {
        session_destroy();
        return false;
    }
    $_SESSION['admin_login_time'] = time();
    return true;
}

function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && is_string($token) && hash_equals($_SESSION['csrf_token'], $token);
}

function requireAdminLogin() {
    if (!isAdminLoggedIn()) {
        header('Location: ' . BASE_URL . '/admin/login.php');
        exit;
    }
}

function getAdminSession() {
    if (isAdminLoggedIn()) {
        return [
            'id' => $_SESSION['admin_id'],
            'email' => $_SESSION['admin_email'],
        ];
    }
    return null;
}

// Valid-format bcrypt hash with no matching plaintext — verified against on a miss so that
// "unknown email" and "wrong password" take the same amount of time (timing-safe lookup).
define('DUMMY_PASSWORD_HASH', '$2y$12$Y.nYtL4wJ6HPjR/sAr96XucPXkKcSyeeYOyLWMCR8sJmmPWraHlD2');

function loginAdmin($pdo, $email, $password) {
    try {
        $stmt = $pdo->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        $hashToCheck = $admin['password_hash'] ?? DUMMY_PASSWORD_HASH;
        $passwordOk = password_verify($password, $hashToCheck);

        if (!$admin || !$passwordOk) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        // Regenerate the session ID on privilege change to prevent session fixation.
        session_regenerate_id(true);

        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_login_time'] = time();

        return ['success' => true, 'message' => 'Login successful'];
    } catch (Exception $e) {
        error_log('Admin login error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'An error occurred during login'];
    }
}

function logoutAdmin() {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
    return true;
}

function createAdmin($pdo, $email, $password) {
    try {
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, NOW())');
        $stmt->execute([$email, $passwordHash]);

        return ['success' => true, 'message' => 'Admin account created'];
    } catch (Exception $e) {
        error_log('Admin creation error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Failed to create admin account'];
    }
}

function updateAdminPassword($pdo, $adminId, $newPassword) {
    try {
        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$passwordHash, $adminId]);

        return ['success' => true, 'message' => 'Password updated successfully'];
    } catch (Exception $e) {
        error_log('Password update error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Failed to update password'];
    }
}

// Max failed attempts per IP before lockout; window is 15 minutes.
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_MINUTES', 15);

function isLoginRateLimited($pdo, $ip) {
    if ($pdo === null) return false;
    try {
        $stmt = $pdo->prepare('
            SELECT COUNT(*) FROM login_attempts
            WHERE ip_address = ?
              AND attempted_at > DATE_SUB(NOW(), INTERVAL ' . LOGIN_LOCKOUT_MINUTES . ' MINUTE)
        ');
        $stmt->execute([$ip]);
        return (int)$stmt->fetchColumn() >= LOGIN_MAX_ATTEMPTS;
    } catch (Exception $e) {
        return false;
    }
}

function recordFailedLoginAttempt($pdo, $ip) {
    if ($pdo === null) return;
    try {
        $stmt = $pdo->prepare('INSERT INTO login_attempts (ip_address) VALUES (?)');
        $stmt->execute([$ip]);
        // Prune old rows to keep the table small
        $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 1 DAY)')->execute();
    } catch (Exception $e) {
        error_log('Failed to record login attempt: ' . $e->getMessage());
    }
}

function clearLoginAttempts($pdo, $ip) {
    if ($pdo === null) return;
    try {
        $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE ip_address = ?');
        $stmt->execute([$ip]);
    } catch (Exception $e) {
        error_log('Failed to clear login attempts: ' . $e->getMessage());
    }
}
