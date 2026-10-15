<?php
// "Resend email" button on Dashboard.html / Booking.html for unverified users.
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

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    respond(401, ["success" => false, "error" => "Please log in first."]);
}

if (!verify_csrf_token(get_submitted_csrf_token())) {
    respond(403, ["success" => false, "error" => "Your session timed out. Refresh the page and try again."]);
}

$email = $_SESSION['user']['email'];

$stmt = $conn->prepare("SELECT name, email_verified_at FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    respond(404, ["success" => false, "error" => "We couldn't find your account. Please log in again."]);
}

if ($user['email_verified_at'] !== null) {
    $_SESSION['user']['verified'] = true;
    respond(200, ["success" => true, "alreadyVerified" => true]);
}

// Each resend emails a third party's inbox if someone signed up with an address
// that isn't theirs, so keep it tight.
if (rate_limit_exceeded($conn, 'resend_verification', $email, 3, 60)) {
    respond(429, ["success" => false, "error" => "We've sent you a few emails already. Check your inbox and spam folder, or try again in an hour."]);
}
record_attempt($conn, 'resend_verification', $email);

$sent = send_verification_email($conn, $email, $user['name']);
$conn->close();

if (!$sent) {
    respond(500, ["success" => false, "error" => "We couldn't send the email right now. Please try again later."]);
}

respond(200, ["success" => true]);
