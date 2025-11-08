<?php
$host = "localhost";
$user = "u181047418_threefrogs";
$password = "Threefr0gs*";
$database = "u181047418_threefrogs";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

define("DB_HOST", "localhost");
define("DB_USER", "u181047418_threefrogs");
define("DB_PASS", "Threefr0gs*");
define("DB_NAME", "u181047418_threefrogs");

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    error_log($e->getMessage());
    exit("Database connection error.");
}