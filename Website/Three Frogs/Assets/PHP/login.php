<?php
require_once("security.php");
secure_session_start();
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
    respond(403, [
        "success" => false,
        "error" => "Your session timed out. Refresh the page and try again."
    ]);
}

// Lowercased to match signup.php, so the per-email rate limit can't be
// sidestepped by changing letter case.
$email = strtolower(trim($_POST['email'] ?? ''));
$password = trim($_POST['password'] ?? '');

if (!$email || !$password) {
    respond(400, [
        "success" => false,
        "error" => "Please enter your email and password."
    ]);
}

if (strlen($email) > 255 || strlen($password) > 200) {
    respond(400, [
        "success" => false,
        "error" => "That email and password don't match. Try again, or reset your password."
    ]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'login_ip', $ip, 10, 15) || rate_limit_exceeded($conn, 'login_email', $email, 5, 15)) {
    respond(429, [
        "success" => false,
        "error" => "Too many login attempts. Wait a few minutes, then try again."
    ]);
}

$stmt = $conn->prepare("SELECT name, email, password, avatar, email_verified_at, is_staff, session_version FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            "name" => $user['name'] ?? 'Unknown User',
            "email" => $user['email'],
            "avatar" => $user['avatar'] ?: 'Assets/Images/Avatars/Clam.jpg',
            "verified" => $user['email_verified_at'] !== null,
            "is_staff" => (bool) $user['is_staff'],
            // Compared on every request by session_user_is_current()
            "session_version" => (int) $user['session_version']
        ];
        respond(200, [
            "success" => true
        ]);
    }
}

record_attempt($conn, 'login_ip', $ip);
record_attempt($conn, 'login_email', $email);

respond(401, [
    "success" => false,
    "error" => "That email and password don't match. Try again, or reset your password."
]);
?>