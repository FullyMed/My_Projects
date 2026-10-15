<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Handmade Indonesian batik';
$meta_description = 'Handmade Indonesian batik from Prambanan Batik: traditional patterns, clothing, fabric and pieces for the home. See photos, prices and what other customers thought.';
$canonical_url = BASE_URL . '/';

$db = null;
$preview_mode = false;
$featured_products = [];

try {
    $db = require __DIR__ . '/db_connect.php';

    if ($db === null) {
        $preview_mode = true;
    } else {
        $stmt = $db->prepare('
            SELECT p.id, p.name, p.slug, p.rating_avg, p.rating_count, p.price_display,
                   (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, id LIMIT 1) as image_url,
                   c.name as category
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.rating_avg DESC, p.rating_count DESC, p.id ASC
            LIMIT 6
        ');
        $stmt->execute();
        $featured_products = $stmt->fetchAll();
    }
} catch (Exception $e) {
    error_log('Failed to fetch featured products: ' . $e->getMessage());
    $preview_mode = true;
}

if ($preview_mode || empty($featured_products)) {
    $preview_mode = true;
    $featured_products = array_slice(get_sample_batik_products(), 0, 6);
}

$_ENV['PREVIEW_MODE'] = $preview_mode;

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="hero">
        <div class="hero-content">
            <span class="hero-eyebrow">Prambanan Batik</span>
            <h2>Indonesian batik, made by hand</h2>
            <p>Traditional patterns, clothing and cloth, with reviews from the people who bought them.</p>
            <a href="<?php echo SITE_PATH; ?>/products.php" class="btn btn-primary btn-large">Browse the collection</a>
        </div>
    </section>

    <section class="featured-section">
        <div class="container">
            <h2 class="section-title reveal">Top-rated batik</h2>
            <p class="section-subtitle reveal">The pieces our customers rate highest.</p>
            <div class="products-grid">
                <?php foreach ($featured_products as $product): ?>
                    <article class="product-card">
                        <div class="product-image">
                            <img src="<?php echo escape(product_image_url($product['image_url'] ?? '')); ?>" data-fallback="<?php echo SITE_PATH; ?>/assets/images/product-placeholder.svg" alt="<?php echo escape($product['name']); ?>" loading="lazy">
                        </div>
                        <div class="product-info">
                            <span class="category"><?php echo escape($product['category']); ?></span>
                            <h3><a href="<?php echo SITE_PATH; ?>/product.php?id=<?php echo (int)$product['id']; ?>"><?php echo escape($product['name']); ?></a></h3>
                            <div class="rating">
                                <span class="stars"><?php echo get_star_rating($product['rating_avg'] ?? $product['rating'] ?? 0); ?></span>
                                <span class="rating-value"><?php echo number_format($product['rating_avg'] ?? $product['rating'] ?? 0, 1); ?></span>
                                <span class="review-count"><?php echo review_count_label($product['rating_count'] ?? $product['review_count'] ?? 0); ?></span>
                            </div>
                            <div class="product-footer">
                                <span class="price"><?php echo format_currency($product['price_display'] ?? $product['price'] ?? 0); ?></span>
                                <a href="<?php echo SITE_PATH; ?>/product.php?id=<?php echo (int)$product['id']; ?>" class="btn btn-small">View</a>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
