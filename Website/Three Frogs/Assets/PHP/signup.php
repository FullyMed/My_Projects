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

$name = trim($_POST['name'] ?? '');
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
        "error" => "Name, email, and password are required."
    ]);
}

if (strlen($name) > 100 || strlen($email) > 255 || strlen($password) > 200) {
    respond(400, [
        "success" => false,
        "error" => "One or more fields exceed the maximum allowed length."
    ]);
}

if (!preg_match("/^[a-zA-Z\s]+$/", $name)) {
    respond(400, [
        "success" => false,
        "error" => "Name can only contain letters and spaces."
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, [
        "success" => false,
        "error" => "Invalid email format."
    ]);
}

if (strlen($password) < 8) {
    respond(400, [
        "success" => false,
        "error" => "Password must be at least 8 characters long."
    ]);
}

$ip = client_ip();
if (rate_limit_exceeded($conn, 'signup_ip', $ip, 8, 60)) {
    respond(429, [
        "success" => false,
        "error" => "Too many signup attempts from this network. Please try again later."
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
        "error" => "Email already registered."
    ]);
}
$checkStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    error_log("signup.php: prepare failed: " . $conn->error);
    respond(500, [
        "success" => false,
        "error" => "Something went wrong. Please try again later."
    ]);
}

$stmt->bind_param("ssss", $name, $email, $hashedPassword, $avatar);

if ($stmt->execute()) {
    session_regenerate_id(true);
    $_SESSION['user'] = [
        "id" => $stmt->insert_id,
        "name" => $name,
        "email" => $email,
        "avatar" => $avatar
    ];
    respond(201, [
        "success" => true,
        "user" => [
            "name" => $name
        ]
    ]);
} else {
    error_log("signup.php: insert failed: " . $stmt->error);
    respond(500, [
        "success" => false,
        "error" => "Signup failed. Please try again later."
    ]);
}
?>