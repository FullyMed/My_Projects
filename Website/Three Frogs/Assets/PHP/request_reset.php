<?php
/*
 * Run this SQL once on your database before using the forgot-password flow:
 *
 * CREATE TABLE IF NOT EXISTS password_reset_tokens (
 *   id         INT AUTO_INCREMENT PRIMARY KEY,
 *   email      VARCHAR(255) NOT NULL,
 *   token      VARCHAR(64)  NOT NULL UNIQUE,
 *   expires_at DATETIME     NOT NULL,
 *   INDEX idx_token (token),
 *   INDEX idx_email (email)
 * );
 */

header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$email = strtolower(trim($_POST['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ["success" => false, "error" => "Invalid email format."]);
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$exists = $stmt->num_rows > 0;
$stmt->close();

if ($exists) {
    $del = $conn->prepare("DELETE FROM password_reset_tokens WHERE email = ?");
    $del->bind_param("s", $email);
    $del->execute();
    $del->close();

    $token     = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $ins = $conn->prepare("INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)");
    $ins->bind_param("sss", $email, $token, $expiresAt);
    $ins->execute();
    $ins->close();

    $resetLink = "https://threefrogsboardgame.com/Forgot-password.html?token=" . urlencode($token);
    $subject   = "Three Frogs - Password Reset Request";
    $body      = "Hello,\r\n\r\n"
               . "We received a request to reset your Three Frogs account password.\r\n\r\n"
               . "Click the link below to set a new password (expires in 1 hour):\r\n\r\n"
               . $resetLink . "\r\n\r\n"
               . "If you did not request this, you can safely ignore this email.\r\n\r\n"
               . "-- Three Frogs Boardgame";
    $headers   = implode("\r\n", [
        "From: Three Frogs <noreply@threefrogsboardgame.com>",
        "Reply-To: noreply@threefrogsboardgame.com",
        "Content-Type: text/plain; charset=UTF-8",
        "X-Mailer: PHP/" . phpversion()
    ]);
    mail($email, $subject, $body, $headers);
}

$conn->close();
respond(200, ["success" => true]);
