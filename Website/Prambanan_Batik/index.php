<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Home';

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
                   (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url,
                   c.name as category
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.rating_avg DESC, p.rating_count DESC
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
            <h2>Discover Authentic Batik</h2>
            <p>Premium Indonesian batik craftsmanship with trusted customer reviews</p>
            <a href="/products.php" class="btn btn-primary btn-large">Explore Collection</a>
        </div>
    </section>

    <section class="featured-section">
        <div class="container">
            <h2 class="section-title reveal">Featured Products</h2>
            <p class="section-subtitle reveal">Handpicked pieces loved by our customers</p>
            <div class="products-grid">
                <?php foreach ($featured_products as $product): ?>
                    <article class="product-card">
                        <div class="product-image">
                            <img src="<?php echo escape($product['image_url']); ?>" alt="<?php echo escape($product['name']); ?>" loading="lazy">
                        </div>
                        <div class="product-info">
                            <span class="category"><?php echo escape($product['category']); ?></span>
                            <h3><a href="/product.php?id=<?php echo $product['id']; ?>"><?php echo escape($product['name']); ?></a></h3>
                            <div class="rating">
                                <span class="stars"><?php echo get_star_rating($product['rating_avg'] ?? $product['rating'] ?? 0); ?></span>
                                <span class="rating-value"><?php echo number_format($product['rating_avg'] ?? $product['rating'] ?? 0, 1); ?></span>
                                <span class="review-count"><?php echo $product['rating_count'] ?? $product['review_count'] ?? 0; ?> reviews</span>
                            </div>
                            <div class="product-footer">
                                <span class="price"><?php echo format_currency($product['price_display'] ?? $product['price'] ?? 0); ?></span>
                                <a href="/product.php?id=<?php echo $product['id']; ?>" class="btn btn-small">View</a>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
