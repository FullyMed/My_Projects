<?php
session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");

function respond($success, $message) {
    echo json_encode([
        "success" => $success,
        $success ? "message" : "error" => $message
    ]);
    exit;
}

if (!isset($_SESSION['user'])) {
    respond(false, "You must be logged in to make a booking.");
}

$user = $_SESSION['user'];
$emailSession = $user['email'];

$data = json_decode(file_get_contents("php://input"), true);
$name = htmlspecialchars(strip_tags($data['name'] ?? ''));
$email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
$date = $data['date'] ?? '';
$start = $data['start'] ?? '';
$end = $data['end'] ?? '';
$people = $data['people'] ?? '';

if (!$name || !$email || !$date || !$start || !$end || !$people) {
    respond(false, "All fields are required.");
}

if ($email !== $emailSession) {
    respond(false, "Email does not match the logged-in user.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "Invalid email format.");
}

if (!is_numeric($people) || $people <= 0) {
    respond(false, "Invalid number of people.");
}

if ($end <= $start) {
    respond(false, "End time must be later than start time.");
}

if (!DateTime::createFromFormat('Y-m-d', $date)) {
    respond(false, "Invalid date format.");
}

if ($date < date('Y-m-d')) {
    respond(false, "Booking date cannot be in the past.");
}

if ($start < "12:00" || $end > "22:00") {
    respond(false, "Booking hours are between 12:00 and 22:00.");
}

$checkStmt = $conn->prepare("
    SELECT COUNT(*) FROM bookings
    WHERE date = ? AND start_time < ? AND end_time > ?
      AND status = 'active'
");
$checkStmt->bind_param("sss", $date, $end, $start);
$checkStmt->execute();
$checkStmt->bind_result($count);
$checkStmt->fetch();
$checkStmt->close();

if ($count > 0) {
    respond(false, "The selected time slot is already booked.");
}

$stmt = $conn->prepare("
    INSERT INTO bookings (name, email, date, start_time, end_time, people, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'active')
");
$stmt->bind_param("sssssi", $name, $email, $date, $start, $end, $people);

if ($stmt->execute()) {
    respond(true, "Booking successful.");
} else {
    respond(false, "Failed to save booking. " . $conn->error);
}

$stmt->close();
$conn->close();
?>