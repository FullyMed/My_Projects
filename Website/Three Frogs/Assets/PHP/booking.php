<?php
require_once("security.php");
secure_session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once("db_connect.php");

// Business rules — keep in sync with Booking.js, Booking.html, and the
// booking section of Terms-of-Use.html.
const TABLE_COUNT      = 4;       // bookings that may overlap at any moment (one booking = one table)
const MAX_PEOPLE       = 8;       // per booking / table
const OPEN_TIME        = "12:00";
const CLOSE_TIME       = "22:00";

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

if (!isset($_SESSION['user']) || empty($_SESSION['user']['email'])) {
    fail(401, "You must be logged in to make a booking.");
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    fail(400, "Invalid request.");
}

if (!verify_csrf_token(get_submitted_csrf_token($data))) {
    fail(403, "Your session expired. Please refresh the page and try again.");
}

// The booking always belongs to the logged-in account — the email is taken
// from the session, never from the request body.
$email  = $_SESSION['user']['email'];
$name   = trim(preg_replace('/\s+/', ' ', (string) ($data['name'] ?? '')));
$date   = (string) ($data['date'] ?? '');
$start  = normalize_time($data['start'] ?? '');
$end    = normalize_time($data['end'] ?? '');
$people = filter_var($data['people'] ?? '', FILTER_VALIDATE_INT);

if ($name === '' || $date === '' || empty($data['start']) || empty($data['end']) || ($data['people'] ?? '') === '') {
    fail(400, "All fields are required.");
}

if (mb_strlen($name) > 100) {
    fail(400, "Name is too long.");
}

if (preg_match('/[<>\x00-\x1F]/', $name)) {
    fail(400, "Name contains invalid characters.");
}

$dateObj = DateTime::createFromFormat('!Y-m-d', $date);
if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
    fail(400, "Invalid date.");
}

if ($start === null || $end === null) {
    fail(400, "Invalid time.");
}

if ($people === false || $people < 1 || $people > MAX_PEOPLE) {
    fail(400, "Number of people must be between 1 and " . MAX_PEOPLE . " per booking.");
}

if ($date < date('Y-m-d')) {
    fail(400, "Booking date cannot be in the past.");
}

if ($start < OPEN_TIME || $end > CLOSE_TIME) {
    fail(400, "Booking hours are between " . OPEN_TIME . " and " . CLOSE_TIME . ".");
}

if ($end <= $start) {
    fail(400, "End time must be later than start time.");
}

if ($date === date('Y-m-d') && $start <= date('H:i')) {
    fail(400, "That start time has already passed. Please choose a later time.");
}

// Serialize the availability check + insert so two simultaneous requests can't
// both see a free table and overbook the last one.
$lock = $conn->query("SELECT GET_LOCK('threefrogs_booking', 10)")->fetch_row()[0];
if ((int) $lock !== 1) {
    fail(503, "The booking system is busy. Please try again in a moment.");
}

// fail()/exit inside try would skip `finally`, so conflicts are recorded here
// and reported only after the lock has been released.
$conflict = null;

try {
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
            $conflict = "You already have a booking that overlaps this time. Check your Dashboard.";
            break;
        }
    }

    if ($conflict === null) {
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
            $conflict = "All " . TABLE_COUNT . " tables are booked for part of that time. Please choose a different time.";
        }
    }

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
    "Three Frogs - Booking Confirmation",
    "Hello $name,\r\n\r\n"
    . "Your table at Three Frogs Boardgame is booked:\r\n\r\n"
    . "  Date:   $prettyDate\r\n"
    . "  Time:   $start - $end\r\n"
    . "  People: $people\r\n\r\n"
    . "You can view or cancel this booking from your Dashboard:\r\n"
    . site_url() . "/Dashboard.html\r\n\r\n"
    . "See you there!\r\n\r\n"
    . "-- Three Frogs Boardgame"
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
