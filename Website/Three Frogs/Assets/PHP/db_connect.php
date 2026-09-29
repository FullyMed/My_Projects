<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require_once(__DIR__ . "/db_config.php");

// The café is in Surabaya (WIB, UTC+7). Pin both PHP and MySQL to that zone so
// "today", booking-in-the-past checks, NOW()/CURDATE(), and the monthly
// cancellation window all agree, whatever timezone the server itself runs in.
date_default_timezone_set('Asia/Jakarta');

// MYSQLI_REPORT_STRICT (above) makes every DB error throw. Anything an endpoint
// doesn't catch itself ends up here: log it, and return a generic JSON error
// instead of an empty 500 the frontend can't parse.
set_exception_handler(function (Throwable $e) {
    error_log(basename($_SERVER['SCRIPT_NAME'] ?? 'php') . ": " . $e->getMessage());
    if (!headers_sent()) {
        http_response_code(500);
        header("Content-Type: application/json");
    }
    echo json_encode([
        "success" => false,
        "error" => "Something went wrong. Please try again later."
    ]);
});

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, defined('DB_PORT') ? DB_PORT : 3306);
    $conn->set_charset("utf8mb4");
    $conn->query("SET time_zone = '+07:00'");
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    header("Content-Type: application/json");
    exit(json_encode([
        "success" => false,
        "error" => "Something went wrong. Please try again later."
    ]));
}
