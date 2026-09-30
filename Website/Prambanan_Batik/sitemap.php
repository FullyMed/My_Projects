<?php

require_once __DIR__ . '/config.php';
$pdo = require __DIR__ . '/db_connect.php';

$products = [];
if ($pdo !== null) {
    try {
        $stmt = $pdo->prepare('SELECT id, updated_at FROM products ORDER BY updated_at DESC, id ASC');
        $stmt->execute();
        $products = $stmt->fetchAll();
    } catch (Exception $e) {
        // Still serve a valid sitemap of the static pages rather than broken XML.
        error_log('Sitemap product query failed: ' . $e->getMessage());
    }
}

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/'); ?></loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/products.php'); ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/terms.php'); ?></loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/privacy.php'); ?></loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
    <?php foreach ($products as $product): ?>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/product.php?id=' . (int)$product['id']); ?></loc>
        <?php if (!empty($product['updated_at'])): ?>
        <lastmod><?php echo date('c', strtotime($product['updated_at'])); ?></lastmod>
        <?php endif; ?>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <?php endforeach; ?>
</urlset>
