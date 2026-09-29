<?php
require_once("security.php");
secure_session_start();

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Ensure the user is logged in
if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    respond(401, [
        "success" => false,
        "error" => "You must be logged in to cancel a booking."
    ]);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    respond(400, [
        "success" => false,
        "error" => "Invalid JSON input."
    ]);
}

if (!verify_csrf_token(get_submitted_csrf_token($input))) {
    respond(403, [
        "success" => false,
        "error" => "Your session expired. Please refresh the page and try again."
    ]);
}

$email = $_SESSION['user']['email'];
$bookingId = filter_var($input['id'] ?? '', FILTER_VALIDATE_INT);
$cancelLimit = 2;

if ($bookingId === false || $bookingId < 1) {
    respond(400, [
        "success" => false,
        "error" => "Invalid booking."
    ]);
}

// Per-user lock so two parallel cancel requests can't both pass the monthly
// limit check. (Lock names max out at 64 chars, hence the hash.)
$lockName = "tf_cancel_" . sha1($email);
$lockStmt = $conn->prepare("SELECT GET_LOCK(?, 10)");
$lockStmt->bind_param("s", $lockName);
$lockStmt->execute();
$lockStmt->bind_result($locked);
$lockStmt->fetch();
$lockStmt->close();

if ((int) $locked !== 1) {
    respond(503, [
        "success" => false,
        "error" => "Please try again in a moment."
    ]);
}

function release_and_respond($conn, $lockName, $status, $data) {
    $rel = $conn->prepare("SELECT RELEASE_LOCK(?)");
    $rel->bind_param("s", $lockName);
    $rel->execute();
    $rel->close();
    respond($status, $data);
}

// The booking must exist, be active, and belong to the logged-in user —
// "not found" covers all three so IDs of other users' bookings aren't confirmed.
$findStmt = $conn->prepare("
    SELECT date, start_time, end_time,
           TIMESTAMP(date, start_time) > NOW() AS not_started
    FROM bookings
    WHERE id = ? AND email = ? AND status = 'active'
");
$findStmt->bind_param("is", $bookingId, $email);
$findStmt->execute();
$booking = $findStmt->get_result()->fetch_assoc();
$findStmt->close();

if (!$booking) {
    release_and_respond($conn, $lockName, 404, [
        "success" => false,
        "error" => "Booking not found."
    ]);
}

if (!(int) $booking['not_started']) {
    release_and_respond($conn, $lockName, 400, [
        "success" => false,
        "error" => "This booking has already started and can no longer be cancelled."
    ]);
}

// Check cancel count this month
$cancelStmt = $conn->prepare("
    SELECT COUNT(*)
    FROM cancellations
    WHERE email = ? AND YEAR(cancel_time) = YEAR(CURDATE()) AND MONTH(cancel_time) = MONTH(CURDATE())
");
$cancelStmt->bind_param("s", $email);
$cancelStmt->execute();
$cancelStmt->bind_result($cancelCount);
$cancelStmt->fetch();
$cancelStmt->close();
$cancelCount = (int) $cancelCount;

if ($cancelCount >= $cancelLimit) {
    release_and_respond($conn, $lockName, 403, [
        "success" => false,
        "error" => "You have reached the monthly cancellation limit ($cancelLimit per month)."
    ]);
}

$conn->begin_transaction();

$deleteStmt = $conn->prepare("DELETE FROM bookings WHERE id = ? AND email = ?");
$deleteStmt->bind_param("is", $bookingId, $email);
$deleteStmt->execute();
$deleted = $deleteStmt->affected_rows;
$deleteStmt->close();

if ($deleted !== 1) {
    $conn->rollback();
    release_and_respond($conn, $lockName, 404, [
        "success" => false,
        "error" => "Booking not found."
    ]);
}

$logStmt = $conn->prepare("INSERT INTO cancellations (email, date, start, end, cancel_time) VALUES (?, ?, ?, ?, NOW())");
$logStmt->bind_param("ssss", $email, $booking['date'], $booking['start_time'], $booking['end_time']);
$logStmt->execute();
$logStmt->close();

$conn->commit();

release_and_respond($conn, $lockName, 200, [
    "success" => true,
    "remaining_cancels" => max(0, $cancelLimit - ($cancelCount + 1))
]);
