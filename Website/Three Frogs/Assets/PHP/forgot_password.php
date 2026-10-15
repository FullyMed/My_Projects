<?php
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once("db_connect.php");
require_once("security.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$token       = trim($_POST['token'] ?? '');
$newPassword = trim($_POST['password'] ?? '');

if (empty($token) || empty($newPassword)) {
    respond(400, ["success" => false, "error" => "Please open the full link from your email and enter a new password."]);
}

if (strlen($newPassword) < 8) {
    respond(400, ["success" => false, "error" => "Your password needs at least 8 characters."]);
}

if (strlen($newPassword) > 200) {
    respond(400, ["success" => false, "error" => "That password is too long (200 characters max)."]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'reset_confirm_ip', $ip, 10, 15)) {
    respond(429, ["success" => false, "error" => "Too many tries. Wait a few minutes, then try again."]);
}
record_attempt($conn, 'reset_confirm_ip', $ip);

$stmt = $conn->prepare("SELECT email, expires_at FROM password_reset_tokens WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    respond(400, ["success" => false, "error" => "This reset link doesn't work anymore. Please ask for a new one."]);
}

if (new DateTime('now') > new DateTime($row['expires_at'])) {
    $del = $conn->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
    $del->bind_param("s", $token);
    $del->execute();
    $del->close();
    respond(400, ["success" => false, "error" => "This reset link has expired. Please ask for a new one."]);
}

$email          = $row['email'];
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Opening the emailed reset link proves the user owns this address, so it
// also counts as email verification (lets the real owner reclaim an address
// someone else signed up with and never verified).
$update = $conn->prepare("UPDATE users SET password = ?, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE email = ?");
$update->bind_param("ss", $hashedPassword, $email);
$update->execute();
$update->close();

$delVerify = $conn->prepare("DELETE FROM email_verification_tokens WHERE email = ?");
$delVerify->bind_param("s", $email);
$delVerify->execute();
$delVerify->close();

$del = $conn->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
$del->bind_param("s", $token);
$del->execute();
$del->close();

$conn->close();
respond(200, ["success" => true, "message" => "Password updated successfully."]);
