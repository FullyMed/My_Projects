<?php
session_start();
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (!$conn || $conn->connect_error) {
    respond(500, [
        "success" => false,
        "error" => "Database connection failed: " . ($conn ? $conn->connect_error : "no connection object")
    ]);
}

$name = trim($_POST['name'] ?? '');
$email = strtolower(filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL));
$password = trim($_POST['password'] ?? '');
$avatar = trim($_POST['avatar'] ?? 'Assets/Images/Avatars/Clam.jpg');

if (!$name || !$email || !$password) {
    respond(400, [
        "success" => false,
        "error" => "Name, email, and password are required."
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
    respond(500, [
        "success" => false,
        "error" => "Database error: " . $conn->error
    ]);
}

$stmt->bind_param("ssss", $name, $email, $hashedPassword, $avatar);

if ($stmt->execute()) {
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
    respond(500, [
        "success" => false,
        "error" => "Signup failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>