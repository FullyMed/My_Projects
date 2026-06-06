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
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'Pel1kmysql*');

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
