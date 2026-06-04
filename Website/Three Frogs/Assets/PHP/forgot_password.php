<?php
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$token       = trim($_POST['token'] ?? '');
$newPassword = trim($_POST['password'] ?? '');

if (empty($token) || empty($newPassword)) {
    respond(400, ["success" => false, "error" => "Token and new password are required."]);
}

if (strlen($newPassword) < 8) {
    respond(400, ["success" => false, "error" => "Password must be at least 8 characters long."]);
}

$stmt = $conn->prepare("SELECT email, expires_at FROM password_reset_tokens WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    respond(400, ["success" => false, "error" => "Invalid or expired reset link. Please request a new one."]);
}

if (new DateTime('now') > new DateTime($row['expires_at'])) {
    $del = $conn->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
    $del->bind_param("s", $token);
    $del->execute();
    $del->close();
    respond(400, ["success" => false, "error" => "This reset link has expired. Please request a new one."]);
}

$email          = $row['email'];
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$update->bind_param("ss", $hashedPassword, $email);
if (!$update->execute()) {
    respond(500, ["success" => false, "error" => "Failed to update password."]);
}
$update->close();

$del = $conn->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
$del->bind_param("s", $token);
$del->execute();
$del->close();

$conn->close();
respond(200, ["success" => true, "message" => "Password updated successfully."]);
