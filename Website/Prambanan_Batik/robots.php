<?php

// Served as /robots.txt via the RewriteRule in .htaccess, so the Disallow paths and the
// Sitemap URL always follow BASE_URL/SITE_PATH instead of being hand-edited per deployment.
// (Crawlers only read robots.txt at the domain root, i.e. when SITE_PATH is empty.)

require_once __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=utf-8');

$lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: ' . SITE_PATH . '/admin/',
    'Disallow: ' . SITE_PATH . '/go.php',
    '',
    'Sitemap: ' . BASE_URL . '/sitemap.php',
];

echo implode("\n", $lines) . "\n";
