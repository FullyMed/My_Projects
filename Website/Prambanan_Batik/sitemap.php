<?php

require_once __DIR__ . '/config.php';
$pdo = require __DIR__ . '/db_connect.php';

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL); ?></loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/products.php'); ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <?php if ($pdo !== null):
    $stmt = $pdo->prepare('SELECT id, updated_at FROM products ORDER BY updated_at DESC');
    $stmt->execute();
    $products = $stmt->fetchAll();

    foreach ($products as $product):
        $lastmod = date('c', strtotime($product['updated_at']));
        ?>
    <url>
        <loc><?php echo htmlspecialchars(BASE_URL . '/product.php?id=' . urlencode($product['id'])); ?></loc>
        <lastmod><?php echo $lastmod; ?></lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <?php
    endforeach;
    endif;
    ?>
</urlset>
