<?php
session_start();

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

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if ($input === null) {
    respond(400, [
        "success" => false,
        "error" => "Invalid JSON input."
    ]);
}

$email = $input['email'] ?? '';
$date = $input['date'] ?? '';
$start = $input['start'] ?? '';
$end = $input['end'] ?? '';

if (!$email || !$date || !$start || !$end) {
    respond(400, [
        "success" => false,
        "error" => "All fields are required."
    ]);
}

// Double-check the email matches session
if ($email !== $_SESSION['user']['email']) {
    respond(403, [
        "success" => false,
        "error" => "Email does not match the logged-in user."
    ]);
}

// Confirm booking exists
$checkBooking = $conn->prepare("SELECT COUNT(*) FROM bookings WHERE email = ? AND date = ? AND start_time = ? AND end_time = ?");
$checkBooking->bind_param("ssss", $email, $date, $start, $end);
$checkBooking->execute();
$checkBooking->bind_result($bookingCount);
$checkBooking->fetch();
$checkBooking->close();

if ($bookingCount === 0) {
    respond(404, [
        "success" => false,
        "error" => "Booking not found."
    ]);
}

// Check cancel count this month
$cancelLimit = 2;
$cancelStmt = $conn->prepare("
    SELECT COUNT(*) AS cancel_count 
    FROM cancellations 
    WHERE email = ? AND YEAR(cancel_time) = YEAR(CURDATE()) AND MONTH(cancel_time) = MONTH(CURDATE())
");
$cancelStmt->bind_param("s", $email);
$cancelStmt->execute();
$cancelResult = $cancelStmt->get_result();
$cancelCount = (int) $cancelResult->fetch_assoc()['cancel_count'];
$cancelStmt->close();

if ($cancelCount >= $cancelLimit) {
    respond(403, [
        "success" => false,
        "error" => "You have reached the monthly cancellation limit (2 per month)."
    ]);
}

// Delete booking
$deleteStmt = $conn->prepare("DELETE FROM bookings WHERE email = ? AND date = ? AND start_time = ? AND end_time = ?");
$deleteStmt->bind_param("ssss", $email, $date, $start, $end);

if ($deleteStmt->execute() && $deleteStmt->affected_rows > 0) {
    $deleteStmt->close();

    $logStmt = $conn->prepare("INSERT INTO cancellations (email, date, start, end, cancel_time) VALUES (?, ?, ?, ?, NOW())");
    $logStmt->bind_param("ssss", $email, $date, $start, $end);
    $logStmt->execute();
    $logStmt->close();

    $remaining = max(0, $cancelLimit - ($cancelCount + 1));
    respond(200, [
        "success" => true,
        "remaining_cancel" => $remaining
    ]);
} else {
    respond(500, [
        "success" => false,
        "error" => "Failed to cancel booking."
    ]);
}
?>