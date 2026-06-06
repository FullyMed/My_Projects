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

function loginAdmin($pdo, $email, $password) {
    try {
        $stmt = $pdo->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        if (!password_verify($password, $admin['password_hash'])) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

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
