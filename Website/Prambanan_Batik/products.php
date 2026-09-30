<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$db = null;
$preview_mode = false;
$all_products = [];
$total_products = 0;

$current_page = get_query_param('page', 1, FILTER_VALIDATE_INT) ?: 1;
$category_filter = get_query_param('category', '');
$category_filter = is_string($category_filter) ? trim($category_filter) : '';

try {
    $db = require __DIR__ . '/db_connect.php';

    if ($db === null) {
        $preview_mode = true;
    } else {
        $where = '1=1';
        $params = [];

        if ($category_filter !== '') {
            $where .= ' AND c.slug = ?';
            $params[] = $category_filter;
        }

        $count_query = "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE {$where}";
        $count_stmt = $db->prepare($count_query);
        $count_stmt->execute($params);
        $count_result = $count_stmt->fetch();
        $total_products = (int)($count_result['total'] ?? 0);

        $pagination = get_pagination($current_page, $total_products, ITEMS_PER_PAGE);

        $query = "
            SELECT p.id, p.name, p.slug, p.rating_avg, p.rating_count, p.price_display,
                   (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, id LIMIT 1) as image_url,
                   c.name as category
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE {$where}
            ORDER BY p.rating_avg DESC, p.rating_count DESC, p.id ASC
            LIMIT ? OFFSET ?
        ";

        $stmt = $db->prepare($query);
        $stmt->execute(array_merge($params, [ITEMS_PER_PAGE, $pagination['offset']]));
        $all_products = $stmt->fetchAll();

        // Sample data is only for a catalog with no products at all — a category that
        // simply has no products yet gets an empty state below, not fake products.
        if ($total_products === 0 && !$db->query('SELECT 1 FROM products LIMIT 1')->fetchColumn()) {
            $preview_mode = true;
        }
    }
} catch (Exception $e) {
    error_log('Failed to fetch products: ' . $e->getMessage());
    $preview_mode = true;
}

if ($preview_mode) {
    $all_products = get_sample_batik_products();

    if ($category_filter !== '') {
        $all_products = array_values(array_filter($all_products, function ($p) use ($category_filter) {
            return slugify($p['category']) === $category_filter;
        }));
    }

    $total_products = count($all_products);
    $pagination = get_pagination($current_page, $total_products, ITEMS_PER_PAGE);
    $all_products = array_slice($all_products, $pagination['offset'], ITEMS_PER_PAGE);
}

$_ENV['PREVIEW_MODE'] = $preview_mode;

$categories_for_filter = [];
if (!$preview_mode && $db !== null) {
    try {
        $cat_stmt = $db->prepare('SELECT name, slug FROM categories ORDER BY name');
        $cat_stmt->execute();
        $categories_for_filter = $cat_stmt->fetchAll();
    } catch (Exception $e) {
        error_log('Failed to fetch categories: ' . $e->getMessage());
    }
}
if ($preview_mode) {
    // Mirrors the categories used by get_sample_batik_products().
    $categories_for_filter = [
        ['name' => 'Traditional Patterns', 'slug' => 'traditional-patterns'],
        ['name' => 'Ready to Wear',        'slug' => 'ready-to-wear'],
        ['name' => 'Fabric & Cloth',       'slug' => 'fabric-cloth'],
        ['name' => 'Traditional Wear',     'slug' => 'traditional-wear'],
        ['name' => 'Regional Styles',      'slug' => 'regional-styles'],
        ['name' => 'Premium Collection',   'slug' => 'premium-collection'],
        ['name' => 'Accessories',          'slug' => 'accessories'],
        ['name' => 'Home Decor',           'slug' => 'home-decor'],
    ];
}

$active_category_name = '';
if ($category_filter !== '') {
    foreach ($categories_for_filter as $cat) {
        if ($cat['slug'] === $category_filter) {
            $active_category_name = $cat['name'];
            break;
        }
    }
}

if ($active_category_name !== '') {
    $page_title = $active_category_name;
    $meta_description = "Shop {$active_category_name} batik at Prambanan Batik — authentic Indonesian craftsmanship with trusted customer reviews.";
} else {
    $page_title = 'Batik Collection';
    $meta_description = 'Browse our full collection of authentic Indonesian batik — traditional patterns, ready-to-wear, fabric, and accessories, with real customer ratings and reviews.';
}

$canonical_query = [];
if ($active_category_name !== '') {
    $canonical_query['category'] = $category_filter;
}
if ($pagination['current_page'] > 1) {
    $canonical_query['page'] = $pagination['current_page'];
}
$canonical_url = BASE_URL . '/products.php' . ($canonical_query ? '?' . http_build_query($canonical_query) : '');

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="products-section">
        <div class="container">
            <h2 class="section-title reveal">Batik Collection</h2>
            <p class="section-subtitle reveal">Browse our full range of authentic Indonesian batik</p>

            <div class="products-filters">
                <form method="get" class="filter-form">
                    <div class="filter-group">
                        <label for="category">Category:</label>
                        <select name="category" id="category">
                            <option value="">All Styles</option>
                            <?php foreach ($categories_for_filter as $cat): ?>
                                <option value="<?php echo escape($cat['slug']); ?>" <?php echo $category_filter === $cat['slug'] ? 'selected' : ''; ?>>
                                    <?php echo escape($cat['name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <noscript><button type="submit" class="btn btn-small">Filter</button></noscript>
                    </div>
                </form>
            </div>

            <?php if (empty($all_products)): ?>
                <div class="empty-state reveal">
                    <h3>No batik here yet</h3>
                    <p><?php echo $active_category_name !== '' ? 'There are no products in ' . escape($active_category_name) . ' right now.' : 'We couldn\'t find any products matching that filter.'; ?></p>
                    <a href="<?php echo SITE_PATH; ?>/products.php" class="btn btn-secondary">View All Styles</a>
                </div>
            <?php endif; ?>

            <div class="products-grid">
                <?php foreach ($all_products as $product): ?>
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

            <?php if ($pagination['total_pages'] > 1): ?>
                <div class="pagination">
                    <?php if ($pagination['has_prev']): ?>
                        <a href="?page=1<?php echo !empty($category_filter) ? '&category=' . urlencode($category_filter) : ''; ?>" class="pagination-link">First</a>
                        <a href="?page=<?php echo $pagination['prev_page']; ?><?php echo !empty($category_filter) ? '&category=' . urlencode($category_filter) : ''; ?>" class="pagination-link">Previous</a>
                    <?php endif; ?>

                    <span class="pagination-info">
                        Page <?php echo $pagination['current_page']; ?> of <?php echo $pagination['total_pages']; ?>
                    </span>

                    <?php if ($pagination['has_next']): ?>
                        <a href="?page=<?php echo $pagination['next_page']; ?><?php echo !empty($category_filter) ? '&category=' . urlencode($category_filter) : ''; ?>" class="pagination-link">Next</a>
                        <a href="?page=<?php echo $pagination['total_pages']; ?><?php echo !empty($category_filter) ? '&category=' . urlencode($category_filter) : ''; ?>" class="pagination-link">Last</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
