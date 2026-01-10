<?php
$host     = 'localhost';
$user     = 'u181047418_prambanan';
$pass     = 'Pr4mbanan*';
$dbname   = 'u181047418_prambanan';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    // Comment out the detailed error in production
    die("Database connection failed. Please try again later !");
    // Uncomment for development/debugging:
    // die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>
