<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    respond(401, ["success" => false, "error" => "You must be logged in to view bookings."]);
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $_SESSION['user']['email'];

$stmt = $conn->prepare("
    SELECT date, start_time, end_time, people 
    FROM bookings 
    WHERE email = ? AND date >= CURDATE() AND status = 'active'
    ORDER BY date, start_time
");
$stmt->bind_param("s", $email);

$bookings = [];

if ($stmt->execute()) {
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    $stmt->close();
} else {
    respond(500, ["success" => false, "error" => "Error fetching bookings: " . $conn->error]);
}

$currentYear = date("Y");
$currentMonth = date("m");
$cancelLimit = 2;

$cancelStmt = $conn->prepare("
    SELECT COUNT(*) AS cancel_count
    FROM cancellations
    WHERE email = ? AND YEAR(cancel_time) = ? AND MONTH(cancel_time) = ?
");
$cancelStmt->bind_param("sii", $email, $currentYear, $currentMonth);

$remainingCancels = $cancelLimit;
if ($cancelStmt->execute()) {
    $result = $cancelStmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $used = (int) $row["cancel_count"];
        $remainingCancels = max(0, $cancelLimit - $used);
    }
    $cancelStmt->close();
}

$conn->close();

respond(200, [
    "success" => true,
    "bookings" => $bookings,
    "remaining_cancels" => $remainingCancels
]);