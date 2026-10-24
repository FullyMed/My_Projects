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

// Text that isn't valid UTF-8 (e.g. a client sending Latin-1) would make the
// /u regexes below return null — reject it up front with a clear message.
$rawName = (string) ($_POST['name'] ?? '');
if (!mb_check_encoding($rawName, 'UTF-8')) {
    respond(400, [
        "success" => false,
        "error" => "That name has characters we can't accept."
    ]);
}

// Collapse runs of whitespace so "Siti   Nur'aini" is stored as "Siti Nur'aini".
$name = trim(preg_replace('/\s+/u', ' ', $rawName));
$email = strtolower(filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL));
$password = trim($_POST['password'] ?? '');
$avatar = trim($_POST['avatar'] ?? '');

$allowedAvatars = [
    "Assets/Images/Avatars/Clam.jpg",
    "Assets/Images/Avatars/Cow.jpg",
    "Assets/Images/Avatars/Crab.jpg",
    "Assets/Images/Avatars/Dolphin.jpg",
    "Assets/Images/Avatars/Nemo.jpg",
    "Assets/Images/Avatars/Puffer.jpg",
    "Assets/Images/Avatars/Seahorse.jpg",
    "Assets/Images/Avatars/Sealion.jpg",
    "Assets/Images/Avatars/Shark.jpg",
    "Assets/Images/Avatars/Squid.jpg",
    "Assets/Images/Avatars/Stingray.jpg",
    "Assets/Images/Avatars/Turtle.jpg",
    "Assets/Images/Avatars/Whale.jpg"
];
if (!in_array($avatar, $allowedAvatars)) {
    $avatar = "Assets/Images/Avatars/Clam.jpg";
}

if (!$name || !$email || !$password) {
    respond(400, [
        "success" => false,
        "error" => "Please fill in your name, email and password."
    ]);
}

if (mb_strlen($name) > 100 || strlen($email) > 255 || strlen($password) > 200) {
    respond(400, [
        "success" => false,
        "error" => "Something you typed is too long. Names can be up to 100 characters and passwords up to 200."
    ]);
}

// Letters from any language (incl. accents), plus spaces, apostrophes,
// hyphens and periods between them — e.g. "Nur'aini", "Jean-Luc", "M. Rizky".
// Keep in sync with the hint in Signup.html.
if (!preg_match("/^\p{L}[\p{L}\p{M} '’.\-]*$/u", $name)) {
    respond(400, [
        "success" => false,
        "error" => "Names can use letters, spaces, apostrophes ('), hyphens (-) and periods (.), and have to start with a letter."
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, [
        "success" => false,
        "error" => "That email address doesn't look right."
    ]);
}

if (strlen($password) < 8) {
    respond(400, [
        "success" => false,
        "error" => "Your password needs at least 8 characters."
    ]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'signup_ip', $ip, 8, 60)) {
    respond(429, [
        "success" => false,
        "error" => "Too many sign-ups from this network. Please try again in an hour."
    ]);
}
record_attempt($conn, 'signup_ip', $ip);

$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    $checkStmt->close();
    respond(409, [
        "success" => false,
        "error" => "There's already an account with that email. Try logging in, or use \"Forgot your password?\" if it's yours."
    ]);
}
$checkStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// New accounts start unverified (email_verified_at NULL) — booking is blocked
// until the emailed link is opened (verify_email.php).
$stmt = $conn->prepare("INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $hashedPassword, $avatar);
$stmt->execute();
$userId = $stmt->insert_id;
$stmt->close();

session_regenerate_id(true);
$_SESSION['user'] = [
    "id" => $userId,
    "name" => $name,
    "email" => $email,
    "avatar" => $avatar,
    "verified" => false,
    "is_staff" => false,
    "session_version" => 0 // the column's default for a new account
];

$emailSent = send_verification_email($conn, $email, $name);
$conn->close();

respond(201, [
    "success" => true,
    "verificationEmailSent" => $emailSent,
    "user" => [
        "name" => $name
    ]
]);
