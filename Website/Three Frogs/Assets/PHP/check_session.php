<?php
require_once("security.php");

header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (!secure_session_start()) {
    http_response_code(500);
    echo json_encode([
        "loggedIn" => false,
        "error" => "Failed to start session"
    ]);
    exit;
}

$token = csrf_token();

if (isset($_SESSION['user']) && !empty($_SESSION['user']['email'])) {
    http_response_code(200);
    echo json_encode([
        "loggedIn" => true,
        "csrfToken" => $token,
        "user" => [
            "name"   => $_SESSION['user']['name'] ?? 'Unknown User',
            "email"  => $_SESSION['user']['email'],
            "avatar" => $_SESSION['user']['avatar'] ?? 'Assets/Images/Avatars/Clam.jpg'
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode(["loggedIn" => false, "csrfToken" => $token]);
}
?>