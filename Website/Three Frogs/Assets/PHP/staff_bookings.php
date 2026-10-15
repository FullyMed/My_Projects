<?php
// Staff.html: every booking on one date, for café staff only.
// Staff = users.is_staff = 1, set by hand in phpMyAdmin (see CLAUDE.md).
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

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    respond(401, ["success" => false, "error" => "Please log in first."]);
}

// Checked against the DB on every request, so removing someone's staff flag
// takes effect immediately, not at their next login.
$staffStmt = $conn->prepare("SELECT is_staff FROM users WHERE email = ?");
$staffStmt->bind_param("s", $_SESSION['user']['email']);
$staffStmt->execute();
$staffStmt->bind_result($isStaff);
$staffStmt->fetch();
$staffStmt->close();
$_SESSION['user']['is_staff'] = (bool) $isStaff;

if (!$isStaff) {
    respond(403, ["success" => false, "error" => "Only café staff can open this page."]);
}

$data = json_decode(file_get_contents("php://input"), true);
$date = is_array($data) ? (string) ($data['date'] ?? '') : '';
$dateObj = DateTime::createFromFormat('!Y-m-d', $date);
if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
    respond(400, ["success" => false, "error" => "That date isn't valid."]);
}

$stmt = $conn->prepare("
    SELECT b.id, b.name, b.email, b.people, b.status,
           TIME_FORMAT(b.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(b.end_time, '%H:%i')   AS end_time,
           TIMESTAMP(b.date, b.end_time) > NOW() AS not_ended,
           u.name AS account_name
    FROM bookings b
    LEFT JOIN users u ON u.email = b.email
    WHERE b.date = ? AND b.status IN ('active', 'cancelled_by_cafe')
    ORDER BY b.start_time, b.end_time
");
$stmt->bind_param("s", $date);
$stmt->execute();
$bookings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

// Tables in use per opening hour, e.g. "15:00" => 3 (bookings overlapping 15:00–16:00).
$active = array_values(array_filter($bookings, fn($b) => $b['status'] === 'active'));
$hourly = [];
for ($h = (int) substr(OPEN_TIME, 0, 2); $h < (int) substr(CLOSE_TIME, 0, 2); $h++) {
    $slotStart = sprintf("%02d:00", $h);
    $slotEnd   = sprintf("%02d:00", $h + 1);
    $hourly[$slotStart] = count(array_filter($active, fn($b) => $b['start_time'] < $slotEnd && $b['end_time'] > $slotStart));
}

foreach ($bookings as &$b) {
    $b['not_ended'] = (bool) $b['not_ended'];
    $b['people'] = (int) $b['people'];
}
unset($b);

respond(200, [
    "success" => true,
    "date" => $date,
    "tableCount" => TABLE_COUNT,
    "bookings" => $bookings,
    "hourly" => $hourly,
    "totals" => [
        "bookings" => count($active),
        "people" => array_sum(array_column($active, 'people'))
    ]
]);
