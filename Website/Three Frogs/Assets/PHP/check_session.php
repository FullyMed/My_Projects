<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
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
            "name" => $_SESSION['user']['name'] ?? 'Unknown User',
            "email" => $_SESSION['user']['email'],
            "avatar" => $_SESSION['user']['avatar'] ?? 'Assets/Images/Avatars/Clam.jpg'
        ],
        "debug" => "Session found"
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "loggedIn" => false,
        "debug" => "No valid session"
    ]);
}
?>