<?php

// Site Configuration
define('SITE_NAME', 'Prambanan Batik');
define('SITE_TAGLINE', 'Authentic Indonesian Batik Craftsmanship');
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost/Prambanan_Batik');
define('SITE_PATH', rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/'));
define('SITE_TIMEZONE', 'Asia/Jakarta');

// Database Configuration - MySQL
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'prambanan_batik');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');

// Application Settings
define('ITEMS_PER_PAGE', 12);
define('REVIEWS_PER_PAGE', 10);
define('PREVIEW_MODE', false);
define('DEBUG_MODE', false);

// Session Configuration
define('SESSION_TIMEOUT', 1800); // 30 minutes
define('SESSION_NAME', 'product_hub_session');

// Security
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB

// Set timezone
date_default_timezone_set(SITE_TIMEZONE);

// Never leak stack traces / paths to visitors; always keep a server-side record.
ini_set('log_errors', '1');
ini_set('display_errors', DEBUG_MODE ? '1' : '0');

$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || (($_SERVER['SERVER_PORT'] ?? '') === '443');

// Session cookie hardening — must run before session_start() (header.php / admin/auth.php).
if (PHP_SAPI !== 'cli' && session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => (SITE_PATH !== '' ? SITE_PATH : '') . '/',
        'domain'   => '',
        'secure'   => $is_https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

// Baseline security headers for every response (also reinforced at the web-server level in .htaccess).
if (PHP_SAPI !== 'cli' && !headers_sent()) {
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    header(
        "Content-Security-Policy: default-src 'self'; " .
        "script-src 'self' 'unsafe-inline'; " .
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
        "font-src https://fonts.gstatic.com; " .
        "img-src 'self' https: data:; " .
        "connect-src 'self'; " .
        "frame-ancestors 'self'; " .
        "base-uri 'self'; " .
        "form-action 'self'"
    );
    if ($is_https) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}
