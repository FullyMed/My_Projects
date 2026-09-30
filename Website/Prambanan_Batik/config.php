<?php

// Load KEY=VALUE pairs from the gitignored .env file next to this one. Real environment
// variables (e.g. Apache SetEnv or the host's control panel) always win over .env values.
// Stored in $_ENV rather than putenv(), which isn't thread-safe under threaded Apache (XAMPP).
if (is_readable(__DIR__ . '/.env')) {
    foreach (file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $env_line) {
        $env_line = trim($env_line);
        if ($env_line === '' || $env_line[0] === '#' || strpos($env_line, '=') === false) {
            continue;
        }
        list($env_key, $env_value) = array_map('trim', explode('=', $env_line, 2));
        $env_quote = $env_value !== '' ? $env_value[0] : '';
        if (strlen($env_value) >= 2 && ($env_quote === '"' || $env_quote === "'") && substr($env_value, -1) === $env_quote) {
            $env_value = substr($env_value, 1, -1);
        }
        if ($env_key !== '' && !array_key_exists($env_key, $_ENV)) {
            $_ENV[$env_key] = $env_value;
        }
    }
    unset($env_line, $env_key, $env_value, $env_quote);
}

/**
 * Read a config value: real environment variable first, then .env, then the default.
 * Empty values fall back to the default, matching the old `getenv('X') ?: 'default'` pattern.
 */
function config_env($key, $default = '') {
    $value = getenv($key);
    if ($value === false || $value === '') {
        $value = $_ENV[$key] ?? '';
    }
    return $value !== '' ? $value : $default;
}

// Site Configuration
define('SITE_NAME', 'Prambanan Batik');
define('SITE_TAGLINE', 'Authentic Indonesian Batik Craftsmanship');
define('DEFAULT_META_DESCRIPTION', 'Shop authentic Indonesian batik at Prambanan Batik — premium handcrafted pieces with trusted customer reviews.');
define('CONTACT_EMAIL', config_env('CONTACT_EMAIL', 'hello@prambananbatik.com'));
define('BASE_URL', rtrim(config_env('BASE_URL', 'http://localhost/Prambanan_Batik'), '/'));
define('SITE_PATH', rtrim(parse_url(BASE_URL, PHP_URL_PATH) ?: '', '/'));
define('SITE_TIMEZONE', 'Asia/Jakarta');

// Database Configuration - MySQL
define('DB_HOST', config_env('DB_HOST', 'localhost'));
define('DB_PORT', (int)config_env('DB_PORT', '3306'));
define('DB_NAME', config_env('DB_NAME', 'prambanan_batik'));
define('DB_USER', config_env('DB_USER', 'root'));
define('DB_PASSWORD', config_env('DB_PASSWORD', ''));

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
