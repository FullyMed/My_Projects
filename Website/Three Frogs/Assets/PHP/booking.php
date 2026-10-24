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

function fail($status, $message) {
    respond($status, ["success" => false, "error" => $message]);
}

// Accepts "HH:MM" or "HH:MM:SS" (browsers may send either); returns "HH:MM" or null.
function normalize_time($value) {
    if (!is_string($value) || !preg_match('/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/', $value, $m)) {
        return null;
    }
    return "$m[1]:$m[2]";
}

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email']) || !session_user_is_current($conn)) {
    fail(401, "Please log in to book a table.");
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    fail(400, "Something went wrong with that request. Refresh the page and try again.");
}

if (!verify_csrf_token(get_submitted_csrf_token($data))) {
    fail(403, "Your session timed out. Refresh the page and try again.");
}

// The booking always belongs to the logged-in account — the email is taken
// from the session, never from the request body.
$email  = $_SESSION['user']['email'];

// Only verified accounts can book (and so trigger confirmation emails). Checked
// against the DB, not the session, so verifying on another device counts at once.
$verifyStmt = $conn->prepare("SELECT email_verified_at FROM users WHERE email = ?");
$verifyStmt->bind_param("s", $email);
$verifyStmt->execute();
$verifyStmt->bind_result($verifiedAt);
$accountExists = $verifyStmt->fetch();
$verifyStmt->close();

if (!$accountExists) {
    fail(401, "Please log in to book a table.");
}
if ($verifiedAt === null) {
    respond(403, [
        "success" => false,
        "code" => "email_unverified",
        "error" => "Please verify your email before you book. The link is in your inbox, or you can send a new one from your Dashboard."
    ]);
}
$_SESSION['user']['verified'] = true;
$name   = trim(preg_replace('/\s+/', ' ', (string) ($data['name'] ?? '')));
$date   = (string) ($data['date'] ?? '');
$start  = normalize_time($data['start'] ?? '');
$end    = normalize_time($data['end'] ?? '');
$people = filter_var($data['people'] ?? '', FILTER_VALIDATE_INT);

if ($name === '' || $date === '' || empty($data['start']) || empty($data['end']) || ($data['people'] ?? '') === '') {
    fail(400, "Please fill in every field.");
}

if (mb_strlen($name) > 100) {
    fail(400, "That name is too long (100 characters max).");
}

if (preg_match('/[<>\x00-\x1F]/', $name)) {
    fail(400, "That name has characters we can't accept.");
}

$dateObj = DateTime::createFromFormat('!Y-m-d', $date);
if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
    fail(400, "That date isn't valid.");
}

if ($start === null || $end === null) {
    fail(400, "That time isn't valid.");
}

if ($people === false || $people < 1 || $people > MAX_PEOPLE) {
    fail(400, "A booking can be for 1 to " . MAX_PEOPLE . " people.");
}

if ($date < date('Y-m-d')) {
    fail(400, "That date has already passed.");
}

if ($date > date('Y-m-d', strtotime('+' . MAX_DAYS_AHEAD . ' days'))) {
    fail(400, "You can book up to " . MAX_DAYS_AHEAD . " days ahead.");
}

if ($start < OPEN_TIME || $end > CLOSE_TIME) {
    fail(400, "We take bookings between " . OPEN_TIME . " and " . CLOSE_TIME . ".");
}

if ($end <= $start) {
    fail(400, "The end time needs to be after the start time.");
}

if ($date === date('Y-m-d') && $start <= date('H:i')) {
    fail(400, "That start time has already passed today. Pick a later one.");
}

// Serialize the availability check + insert so two simultaneous requests can't
// both see a free table and overbook the last one.
$lock = $conn->query("SELECT GET_LOCK('threefrogs_booking', 10)")->fetch_row()[0];
if ((int) $lock !== 1) {
    fail(503, "The booking system is busy. Try again in a moment.");
}

// Returns why this booking can't be made right now, or null if it can.
// Must run while holding the lock above.
function booking_conflict(mysqli $conn, string $email, string $date, string $start, string $end): ?string {
    // Per-account cap on bookings that haven't finished yet.
    $upcomingStmt = $conn->prepare("
        SELECT COUNT(*) FROM bookings
        WHERE email = ? AND status = 'active' AND TIMESTAMP(date, end_time) > NOW()
    ");
    $upcomingStmt->bind_param("s", $email);
    $upcomingStmt->execute();
    $upcomingStmt->bind_result($upcomingCount);
    $upcomingStmt->fetch();
    $upcomingStmt->close();

    if ($upcomingCount >= MAX_UPCOMING) {
        return "You already have " . MAX_UPCOMING . " upcoming bookings, the most one account can hold. You can book again after one of them, or cancel one from your Dashboard.";
    }

    // Every active booking that overlaps the requested window.
    $overlapStmt = $conn->prepare("
        SELECT email, TIME_FORMAT(start_time, '%H:%i') AS s, TIME_FORMAT(end_time, '%H:%i') AS e
        FROM bookings
        WHERE date = ? AND start_time < ? AND end_time > ? AND status = 'active'
    ");
    $overlapStmt->bind_param("sss", $date, $end, $start);
    $overlapStmt->execute();
    $overlapping = $overlapStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $overlapStmt->close();

    foreach ($overlapping as $b) {
        if (strcasecmp($b['email'], $email) === 0) {
            return "You already have a booking at that time. Check your Dashboard.";
        }
    }

    // Peak number of tables in use at any moment inside the window. The peak
    // can only change at a booking's start, so checking those instants is enough.
    $checkpoints = [$start];
    foreach ($overlapping as $b) {
        if ($b['s'] > $start) {
            $checkpoints[] = $b['s'];
        }
    }
    $peak = 0;
    foreach ($checkpoints as $t) {
        $inUse = 0;
        foreach ($overlapping as $b) {
            if ($b['s'] <= $t && $b['e'] > $t) {
                $inUse++;
            }
        }
        $peak = max($peak, $inUse);
    }

    if ($peak >= TABLE_COUNT) {
        return "All " . TABLE_COUNT . " tables are taken for part of that time. Try a different time.";
    }

    return null;
}

// fail()/exit inside try would skip `finally`, so a conflict is recorded here
// and reported only after the lock has been released.
try {
    $conflict = booking_conflict($conn, $email, $date, $start, $end);

    if ($conflict === null) {
        $stmt = $conn->prepare("
            INSERT INTO bookings (name, email, date, start_time, end_time, people, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->bind_param("sssssi", $name, $email, $date, $start, $end, $people);
        $stmt->execute();
        $stmt->close();
    }
} finally {
    $conn->query("SELECT RELEASE_LOCK('threefrogs_booking')");
}

if ($conflict !== null) {
    fail(409, $conflict);
}

$prettyDate = $dateObj->format('l, j F Y');
$emailSent = send_site_email(
    $email,
    "Three Frogs - Booking confirmed",
    "Hi $name,\r\n\r\n"
    . "Your table is booked. Here are the details:\r\n\r\n"
    . "  Date:   $prettyDate\r\n"
    . "  Time:   $start - $end\r\n"
    . "  People: $people\r\n\r\n"
    . "Plans changed? You can cancel from your Dashboard any time before the booking starts:\r\n"
    . site_url() . "/Dashboard.html\r\n\r\n"
    . "See you there!\r\n"
    . "Three Frogs Boardgame"
);

$conn->close();

respond(201, [
    "success" => true,
    "message" => "Booking successful.",
    "emailSent" => $emailSent,
    "booking" => [
        "date" => $date,
        "start" => $start,
        "end" => $end,
        "people" => $people
    ]
]);
