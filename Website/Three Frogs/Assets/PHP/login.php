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
        "error" => "Your session expired. Please refresh the page and try again."
    ]);
}

$email = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');

if (!$email || !$password) {
    respond(400, [
        "success" => false,
        "error" => "Email and password are required."
    ]);
}

if (strlen($email) > 255 || strlen($password) > 200) {
    respond(400, [
        "success" => false,
        "error" => "Invalid email or password."
    ]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'login_ip', $ip, 10, 15) || rate_limit_exceeded($conn, 'login_email', $email, 5, 15)) {
    respond(429, [
        "success" => false,
        "error" => "Too many login attempts. Please try again in a few minutes."
    ]);
}

$stmt = $conn->prepare("SELECT name, email, password, avatar FROM users WHERE email = ?");
if (!$stmt) {
    error_log("login.php: prepare failed: " . $conn->error);
    respond(500, [
        "success" => false,
        "error" => "Something went wrong. Please try again later."
    ]);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            "name" => $user['name'] ?? 'Unknown User',
            "email" => $user['email'],
            "avatar" => $user['avatar'] ?? ''
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
    "error" => "Invalid email or password."
]);
?>