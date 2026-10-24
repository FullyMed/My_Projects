<?php
require_once("security.php");
secure_session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");
require_once("booking_rules.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email']) || !session_user_is_current($conn)) {
    respond(401, ["success" => false, "error" => "Please log in to see your bookings."]);
}

$email = $_SESSION['user']['email'];
$cancelLimit = CANCEL_LIMIT;
$historyDays = 90;

// Upcoming bookings plus the last $historyDays days of past ones (for the
// Dashboard's "Booking history" list). The frontend splits them by end time.
// Bookings the café cancelled (staff_cancel_booking.php) are included so the
// customer sees what happened; ones they cancelled themselves are deleted.
$stmt = $conn->prepare("
    SELECT id, date,
           TIME_FORMAT(start_time, '%H:%i') AS start_time,
           TIME_FORMAT(end_time, '%H:%i')   AS end_time,
           people, status
    FROM bookings
    WHERE email = ? AND status IN ('active', 'cancelled_by_cafe') AND date >= (CURDATE() - INTERVAL ? DAY)
    ORDER BY date, start_time
");
$stmt->bind_param("si", $email, $historyDays);
$stmt->execute();
$bookings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$cancelStmt = $conn->prepare("
    SELECT COUNT(*)
    FROM cancellations
    WHERE email = ? AND YEAR(cancel_time) = YEAR(CURDATE()) AND MONTH(cancel_time) = MONTH(CURDATE())
");
$cancelStmt->bind_param("s", $email);
$cancelStmt->execute();
$cancelStmt->bind_result($used);
$cancelStmt->fetch();
$cancelStmt->close();

$conn->close();

respond(200, [
    "success" => true,
    "bookings" => $bookings,
    "remaining_cancels" => max(0, $cancelLimit - (int) $used),
    "cancel_limit" => $cancelLimit
]);
