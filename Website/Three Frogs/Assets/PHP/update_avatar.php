<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");

// Ensure user is logged in
if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "You must be logged in to update your avatar."
    ]);
    exit;
}

$email = $_SESSION['user']['email'];
$newAvatar = trim($_POST['avatar'] ?? '');

// Validate avatar input
if (empty($newAvatar)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Avatar selection is required."
    ]);
    exit;
}

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

if (!in_array($newAvatar, $allowedAvatars)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid avatar selection."
    ]);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET avatar = ? WHERE email = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $conn->error
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("ss", $newAvatar, $email);
if ($stmt->execute()) {
    $_SESSION['user']['avatar'] = $newAvatar;

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Avatar updated successfully."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to update avatar: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>