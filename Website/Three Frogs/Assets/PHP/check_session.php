<?php
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (!session_start()) {
    http_response_code(500);
    echo json_encode([
        "loggedIn" => false,
        "error" => "Failed to start session"
    ]);
    exit;
}

if (isset($_SESSION['user']) && !empty($_SESSION['user']['email'])) {
    http_response_code(200);
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "name"   => $_SESSION['user']['name'] ?? 'Unknown User',
            "email"  => $_SESSION['user']['email'],
            "avatar" => $_SESSION['user']['avatar'] ?? 'Assets/Images/Avatars/Clam.jpg'
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode(["loggedIn" => false]);
}
?>