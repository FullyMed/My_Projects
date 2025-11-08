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

if (!$conn) {
    respond(500, [
        "success" => false,
        "error" => "Database connection failed: " . mysqli_connect_error()
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

$stmt = $conn->prepare("SELECT name, email, password, avatar FROM users WHERE email = ?");
if (!$stmt) {
    respond(500, [
        "success" => false,
        "error" => "Failed to prepare statement: " . $conn->error
    ]);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password'])) {
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

respond(401, [
    "success" => false,
    "error" => "Invalid email or password."
]);

$stmt->close();
$conn->close();
?>