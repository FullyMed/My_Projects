<?php
// Step 2 of email verification: the link from send_verification_email()
// opens Verify-email.html, which POSTs the token here. No login needed —
// the token itself proves the visitor received the email.
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

$token = trim($_POST['token'] ?? '');

if ($token === '' || strlen($token) > 64) {
    respond(400, ["success" => false, "error" => "This verification link doesn't work. Please open the full link from your email."]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'verify_email_ip', $ip, 10, 15)) {
    respond(429, ["success" => false, "error" => "Too many tries. Wait a few minutes, then try again."]);
}
record_attempt($conn, 'verify_email_ip', $ip);

$stmt = $conn->prepare("SELECT email, expires_at < NOW() AS expired FROM email_verification_tokens WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    respond(400, [
        "success" => false,
        "error" => "This link doesn't work anymore. Maybe you already used it? Log in and press \"Resend email\" on your Dashboard to get a new one."
    ]);
}

if ((int) $row['expired']) {
    $del = $conn->prepare("DELETE FROM email_verification_tokens WHERE token = ?");
    $del->bind_param("s", $token);
    $del->execute();
    $del->close();
    respond(400, [
        "success" => false,
        "error" => "This link has expired. Log in and press \"Resend email\" on your Dashboard to get a new one."
    ]);
}

$email = $row['email'];

$upd = $conn->prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE email = ?");
$upd->bind_param("s", $email);
$upd->execute();
$upd->close();

$del = $conn->prepare("DELETE FROM email_verification_tokens WHERE email = ?");
$del->bind_param("s", $email);
$del->execute();
$del->close();

$conn->close();

// If the link was opened in the same browser the user is logged in on,
// update the session now (other sessions catch up via check_session.php).
if (!empty($_SESSION['user']['email']) && $_SESSION['user']['email'] === $email) {
    $_SESSION['user']['verified'] = true;
}

respond(200, ["success" => true]);
