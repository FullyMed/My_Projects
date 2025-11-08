<?php
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (!session_start()) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to start session.",
        "debug" => "Session start failed"
    ]);
    exit;
}

try {
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    if (!session_destroy()) {
        throw new Exception("Failed to destroy session.");
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "debug" => "Session destroyed and cookie cleared."
    ]);
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Server error: " . $e->getMessage(),
        "debug" => "Exception caught during logout"
    ]);
}
?>