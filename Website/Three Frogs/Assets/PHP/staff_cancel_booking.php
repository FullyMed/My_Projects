<?php
// Staff.html: café-initiated cancellation (e.g. an unexpected closure).
// The booking is kept with status 'cancelled_by_cafe' (so the customer still
// sees it on their Dashboard), the customer is emailed, and it does NOT count
// toward their monthly self-cancellation limit (that counts `cancellations` rows).
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

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    respond(401, ["success" => false, "error" => "Please log in first."]);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    respond(400, ["success" => false, "error" => "Something went wrong with that request. Refresh the page and try again."]);
}

if (!verify_csrf_token(get_submitted_csrf_token($input))) {
    respond(403, ["success" => false, "error" => "Your session timed out. Refresh the page and try again."]);
}

$staffStmt = $conn->prepare("SELECT is_staff FROM users WHERE email = ?");
$staffStmt->bind_param("s", $_SESSION['user']['email']);
$staffStmt->execute();
$staffStmt->bind_result($isStaff);
$staffStmt->fetch();
$staffStmt->close();

if (!$isStaff) {
    respond(403, ["success" => false, "error" => "Only café staff can do that."]);
}

$bookingId = filter_var($input['id'] ?? '', FILTER_VALIDATE_INT);
if ($bookingId === false || $bookingId < 1) {
    respond(400, ["success" => false, "error" => "We couldn't find that booking."]);
}

// Optional note for the customer, single line, plain text.
$reason = trim(preg_replace('/\s+/u', ' ', (string) ($input['reason'] ?? '')));
if (mb_strlen($reason) > 300) {
    respond(400, ["success" => false, "error" => "Please keep the reason to 300 characters or fewer."]);
}

// Only active bookings that haven't ended can be cancelled. The status check in
// the UPDATE itself means two staff cancelling at once can't both "succeed".
$upd = $conn->prepare("
    UPDATE bookings SET status = 'cancelled_by_cafe'
    WHERE id = ? AND status = 'active' AND TIMESTAMP(date, end_time) > NOW()
");
$upd->bind_param("i", $bookingId);
$upd->execute();
$changed = $upd->affected_rows;
$upd->close();

if ($changed !== 1) {
    respond(409, ["success" => false, "error" => "This booking was already cancelled or has already ended. Refresh the page to see the latest."]);
}

$stmt = $conn->prepare("
    SELECT b.name, b.email, b.date, b.people,
           TIME_FORMAT(b.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(b.end_time, '%H:%i')   AS end_time
    FROM bookings b WHERE b.id = ?
");
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$b = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

$prettyDate = DateTime::createFromFormat('!Y-m-d', $b['date'])->format('l, j F Y');
$emailSent = send_site_email(
    $b['email'],
    "Three Frogs - Your booking has been cancelled",
    "Hi {$b['name']},\r\n\r\n"
    . "We're sorry, but we've had to cancel your booking:\r\n\r\n"
    . "  Date:   $prettyDate\r\n"
    . "  Time:   {$b['start_time']} - {$b['end_time']}\r\n"
    . "  People: {$b['people']}\r\n\r\n"
    . ($reason !== '' ? "Reason: $reason\r\n\r\n" : "")
    . "This doesn't count toward your 2 cancellations for the month. We'd love to see you another time, and you can book again here:\r\n"
    . site_url() . "/Booking.html\r\n\r\n"
    . "Questions? Email us at threefrogs@threefrogsboardgame.com.\r\n\r\n"
    . "Sorry again,\r\n"
    . "Three Frogs Boardgame"
);

respond(200, ["success" => true, "emailSent" => $emailSent]);
