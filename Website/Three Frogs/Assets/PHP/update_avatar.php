<?php
require_once("security.php");
secure_session_start();
ini_set('display_errors', 0);
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

if (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "Your session expired. Please refresh the page and try again."
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
    error_log("update_avatar.php: prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Something went wrong. Please try again later."
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
    error_log("update_avatar.php: update failed: " . $stmt->error);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to update avatar. Please try again later."
    ]);
}

$stmt->close();
$conn->close();
?>