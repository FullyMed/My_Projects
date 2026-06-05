<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$db = null;
$preview_mode = false;
$product = null;
$reviews = [];

$product_id = get_query_param('id', 0, FILTER_VALIDATE_INT);

if (!$product_id) {
    header('Location: /products.php');
    exit;
}

try {
    $db = require __DIR__ . '/db_connect.php';

    if ($db === null) {
        $preview_mode = true;
    } else {
        $stmt = $db->prepare('
            SELECT p.id, p.name, p.slug, p.rating_avg, p.rating_count, p.price_display, p.description,
                   p.buy_link_shopee, p.buy_link_tokopedia, p.buy_link_other,
                   (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url,
                   c.name as category, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
            LIMIT 1
        ');
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();

        if (!$product) {
            $preview_mode = true;
        } else {
            $reviews_stmt = $db->prepare('
                SELECT id, reviewer_name, rating, content, created_at
                FROM reviews
                WHERE product_id = ?
                ORDER BY created_at DESC
                LIMIT ' . REVIEWS_PER_PAGE . '
            ');
            $reviews_stmt->execute([$product_id]);
            $reviews = $reviews_stmt->fetchAll();
        }
    }
} catch (Exception $e) {
    error_log('Failed to fetch product: ' . $e->getMessage());
    $preview_mode = true;
}

if ($preview_mode || !$product) {
    $preview_mode = true;

    $sample_products = get_sample_batik_products();

    $product = null;
    foreach ($sample_products as $p) {
        if ($p['id'] == $product_id) {
            $product = $p;
            break;
        }
    }

    if (!$product) {
        $product = $sample_products[0];
    }

    // Sample data uses category name as slug (slugified)
    if (!isset($product['category_slug'])) {
        $product['category_slug'] = strtolower(str_replace(' ', '-', $product['category'] ?? ''));
    }

    $reviews = [
        [
            'id' => 1,
            'reviewer_name' => 'Siti Nurhaliza',
            'rating' => 5,
            'content' => 'Authentic batik with incredible craftsmanship. The cloud patterns are so intricate! Truly a masterpiece.',
            'created_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
        ],
        [
            'id' => 2,
            'reviewer_name' => 'Bambang',
            'rating' => 5,
            'content' => 'Absolutely beautiful piece. Perfect for my batik collection. Prambanan Batik delivers exceptional quality.',
            'created_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
        ],
        [
            'id' => 3,
            'reviewer_name' => 'Dewi',
            'rating' => 4,
            'content' => 'Love the modern take on traditional batik. Very comfortable to wear and excellent quality fabric.',
            'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
        ],
    ];
}

$page_title = $product['name'] ?? 'Product Detail';
$_ENV['PREVIEW_MODE'] = $preview_mode;

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="product-detail">
        <div class="container">
            <div class="breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <a href="/products.php">Products</a>
                <span>/</span>
                <a href="/products.php?category=<?php echo urlencode($product['category_slug'] ?? ''); ?>"><?php echo escape($product['category']); ?></a>
                <span>/</span>
                <span><?php echo escape($product['name']); ?></span>
            </div>

            <div class="product-layout">
                <div class="product-image-section">
                    <img src="<?php echo escape($product['image_url']); ?>" alt="<?php echo escape($product['name']); ?>" class="product-main-image">
                </div>

                <div class="product-details-section">
                    <span class="category-tag"><?php echo escape($product['category']); ?></span>
                    <h1><?php echo escape($product['name']); ?></h1>

                    <div class="rating-section">
                        <div class="stars"><?php echo get_star_rating($product['rating_avg'] ?? $product['rating'] ?? 0); ?></div>
                        <span class="rating-text"><?php echo number_format($product['rating_avg'] ?? $product['rating'] ?? 0, 1); ?> out of 5</span>
                        <span class="review-text"><?php echo $product['rating_count'] ?? $product['review_count'] ?? 0; ?> customer reviews</span>
                    </div>

                    <div class="price-section">
                        <span class="price"><?php echo format_currency($product['price_display'] ?? $product['price'] ?? 0); ?></span>
                    </div>

                    <div class="product-description">
                        <h3>Description</h3>
                        <p><?php echo nl2br(escape($product['description'])); ?></p>
                    </div>

                    <div class="action-buttons">
                        <?php if (!empty($product['buy_link_shopee'])): ?>
                            <a href="/go.php?id=<?php echo $product['id']; ?>&platform=shopee" class="btn btn-primary btn-large" target="_blank">Buy on Shopee</a>
                        <?php endif; ?>
                        <?php if (!empty($product['buy_link_tokopedia'])): ?>
                            <a href="/go.php?id=<?php echo $product['id']; ?>&platform=tokopedia" class="btn btn-primary btn-large" target="_blank">Buy on Tokopedia</a>
                        <?php endif; ?>
                        <?php if (!empty($product['buy_link_other'])): ?>
                            <a href="/go.php?id=<?php echo $product['id']; ?>&platform=other" class="btn btn-primary btn-large" target="_blank">Buy Now</a>
                        <?php endif; ?>
                        <?php if (empty($product['buy_link_shopee']) && empty($product['buy_link_tokopedia']) && empty($product['buy_link_other'])): ?>
                            <a href="https://shopee.co.id/search?keyword=<?php echo urlencode($product['name']); ?>" class="btn btn-primary btn-large" target="_blank">Search on Shopee</a>
                        <?php endif; ?>
                        <a href="/products.php" class="btn btn-secondary btn-large">Back to Products</a>
                    </div>
                </div>
            </div>

            <?php if (!empty($reviews)): ?>
                <div class="reviews-section">
                    <h2 class="reveal">Customer Reviews</h2>
                    <div class="reviews-list">
                        <?php foreach ($reviews as $review): ?>
                            <article class="review-item reveal">
                                <div class="review-header">
                                    <div class="review-info">
                                        <div class="reviewer-avatar" data-name="<?php echo escape($review['reviewer_name'] ?? ''); ?>"></div>
                                        <div>
                                            <strong><?php echo escape($review['reviewer_name'] ?? 'Anonymous'); ?></strong>
                                            <div class="review-rating"><?php echo get_star_rating($review['rating']); ?></div>
                                        </div>
                                    </div>
                                    <span class="review-date"><?php echo time_ago($review['created_at']); ?></span>
                                </div>
                                <p class="review-text"><?php echo escape($review['content']); ?></p>
                            </article>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
