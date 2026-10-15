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
    // A user who hasn't verified yet often clicks the emailed link on another
    // device, which can't update *this* session — so re-check the DB until the
    // session sees them verified. Verified users never touch the DB here.
    if (empty($_SESSION['user']['verified'])) {
        require_once("db_connect.php");
        $stmt = $conn->prepare("SELECT email_verified_at FROM users WHERE email = ?");
        $stmt->bind_param("s", $_SESSION['user']['email']);
        $stmt->execute();
        $stmt->bind_result($verifiedAt);
        $found = $stmt->fetch();
        $stmt->close();
        $conn->close();

        if (!$found) {
            // The account no longer exists — end the stale session.
            $_SESSION = [];
            echo json_encode(["loggedIn" => false, "csrfToken" => csrf_token()]);
            exit;
        }
        $_SESSION['user']['verified'] = $verifiedAt !== null;
    }

    http_response_code(200);
    echo json_encode([
        "loggedIn" => true,
        "csrfToken" => $token,
        "user" => [
            "name"          => $_SESSION['user']['name'] ?? 'Unknown User',
            "email"         => $_SESSION['user']['email'],
            "avatar"        => $_SESSION['user']['avatar'] ?? 'Assets/Images/Avatars/Clam.jpg',
            "emailVerified" => (bool) $_SESSION['user']['verified'],
            "isStaff"       => !empty($_SESSION['user']['is_staff'])
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode(["loggedIn" => false, "csrfToken" => $token]);
}
?>
