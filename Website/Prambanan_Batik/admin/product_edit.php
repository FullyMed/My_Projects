<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireDatabase($pdo);
requireAdminLogin($pdo);
$admin = getAdminSession();

$message = '';
$error = '';
$product = null;
$productId = get_query_param('id', 0, FILTER_VALIDATE_INT) ?: 0;

if ($productId) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        $error = 'Product not found';
    }
}

if (isset($_GET['created']) && $product) {
    $message = 'Product created successfully. Add images from the Products list (Images button).';
}

// Values shown in the form: the saved product, or what was just submitted if saving failed.
$form = $product ?: [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request token';
    } else {
        $action = post_string('action');

        $form = [
            'category_id'        => post_string('category_id'),
            'sku'                => post_string('sku'),
            'slug'               => post_string('slug'),
            'name'               => post_string('name'),
            'description'        => post_string('description'),
            'price_display'      => post_string('price_display'),
            'buy_link_shopee'    => post_string('buy_link_shopee'),
            'buy_link_tokopedia' => post_string('buy_link_tokopedia'),
            'buy_link_other'     => post_string('buy_link_other'),
        ];
        // Normalise the slug (lowercase, hyphens); if left blank, derive it from the name.
        $form['slug'] = slugify($form['slug'] !== '' ? $form['slug'] : $form['name']);

        if (!in_array($action, ['create', 'update'], true) || ($action === 'update') !== (bool)$product) {
            $error = 'Invalid action';
        } elseif ($form['category_id'] === '' || $form['sku'] === '' || $form['name'] === '' || $form['price_display'] === '') {
            $error = 'Category, SKU, name, and price are required';
        } elseif ($form['slug'] === '') {
            $error = 'Slug must contain at least one letter or number';
        } elseif (!is_numeric($form['price_display']) || (float)$form['price_display'] < 0 || (float)$form['price_display'] > 99999999.99) {
            $error = 'Price must be a number between 0 and 99,999,999 (plain digits, e.g. 350000)';
        } elseif (!is_valid_buy_link($form['buy_link_shopee']) || !is_valid_buy_link($form['buy_link_tokopedia']) || !is_valid_buy_link($form['buy_link_other'])) {
            $error = 'Buy links must start with http:// or https://';
        } else {
            $currentId = $product ? (int)$product['id'] : 0;

            $catStmt = $pdo->prepare('SELECT 1 FROM categories WHERE id = ? LIMIT 1');
            $catStmt->execute([(int)$form['category_id']]);

            $dupStmt = $pdo->prepare('SELECT sku, slug FROM products WHERE (sku = ? OR slug = ?) AND id <> ? LIMIT 1');
            $dupStmt->execute([$form['sku'], $form['slug'], $currentId]);
            $duplicate = $dupStmt->fetch();

            if (!$catStmt->fetchColumn()) {
                $error = 'Selected category does not exist';
            } elseif ($duplicate) {
                $error = strcasecmp($duplicate['sku'], $form['sku']) === 0
                    ? 'Another product already uses this SKU'
                    : 'Another product already uses this slug';
            } else {
                $values = [
                    (int)$form['category_id'],
                    $form['sku'],
                    $form['slug'],
                    $form['name'],
                    $form['description'] !== '' ? $form['description'] : null,
                    $form['price_display'],
                    $form['buy_link_shopee'] !== '' ? $form['buy_link_shopee'] : null,
                    $form['buy_link_tokopedia'] !== '' ? $form['buy_link_tokopedia'] : null,
                    $form['buy_link_other'] !== '' ? $form['buy_link_other'] : null,
                ];

                try {
                    if ($action === 'create') {
                        $stmt = $pdo->prepare('INSERT INTO products (category_id, sku, slug, name, description, price_display, buy_link_shopee, buy_link_tokopedia, buy_link_other) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                        $stmt->execute($values);
                        header('Location: ' . BASE_URL . '/admin/product_edit.php?id=' . (int)$pdo->lastInsertId() . '&created=1');
                        exit;
                    }

                    $values[] = $currentId;
                    $stmt = $pdo->prepare('UPDATE products SET category_id = ?, sku = ?, slug = ?, name = ?, description = ?, price_display = ?, buy_link_shopee = ?, buy_link_tokopedia = ?, buy_link_other = ?, updated_at = NOW() WHERE id = ?');
                    $stmt->execute($values);
                    $message = 'Product updated successfully';
                    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
                    $stmt->execute([$currentId]);
                    $product = $stmt->fetch();
                    $form = $product;
                } catch (Exception $e) {
                    error_log('Failed to save product: ' . $e->getMessage());
                    $error = 'Failed to save product. Please try again.';
                }
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT id, name FROM categories ORDER BY name');
$stmt->execute();
$categories = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $product ? 'Edit Product' : 'Create Product'; ?></title>
    
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo SITE_PATH; ?>/assets/favicon/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset_url('admin/admin.css'); ?>">
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php" class="active">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1><?php echo $product ? 'Edit Product' : 'Create Product'; ?></h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="back-link">← Back to Products</a>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <div class="form-section">
                    <form method="POST">
                        <input type="hidden" name="action" value="<?php echo $product ? 'update' : 'create'; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                        <?php if ($product): ?>
                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($product['id']); ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="name">Product Name <span class="required">*</span></label>
                                <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($form['name'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="sku">SKU <span class="required">*</span></label>
                                <input type="text" id="sku" name="sku" value="<?php echo htmlspecialchars($form['sku'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="slug">Slug</label>
                                <input type="text" id="slug" name="slug" value="<?php echo htmlspecialchars($form['slug'] ?? ''); ?>" placeholder="Leave blank to generate from the name">
                            </div>

                            <div class="form-group">
                                <label for="category_id">Category <span class="required">*</span></label>
                                <select id="category_id" name="category_id" required>
                                    <option value="">Select Category</option>
                                    <?php foreach ($categories as $category): ?>
                                        <option value="<?php echo htmlspecialchars($category['id']); ?>" <?php echo ((int)($form['category_id'] ?? 0) === (int)$category['id']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($category['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="price_display">Price (Rp) <span class="required">*</span></label>
                                <input type="number" id="price_display" name="price_display" min="0" max="99999999" step="1" value="<?php echo htmlspecialchars(isset($form['price_display']) && is_numeric($form['price_display']) ? (string)(0 + $form['price_display']) : ($form['price_display'] ?? '')); ?>" required>
                            </div>

                            <div class="form-group full">
                                <label for="description">Description</label>
                                <textarea id="description" name="description"><?php echo htmlspecialchars($form['description'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_shopee">Shopee Link</label>
                                <input type="url" id="buy_link_shopee" name="buy_link_shopee" value="<?php echo htmlspecialchars($form['buy_link_shopee'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_tokopedia">Tokopedia Link</label>
                                <input type="url" id="buy_link_tokopedia" name="buy_link_tokopedia" value="<?php echo htmlspecialchars($form['buy_link_tokopedia'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_other">Other Link</label>
                                <input type="url" id="buy_link_other" name="buy_link_other" value="<?php echo htmlspecialchars($form['buy_link_other'] ?? ''); ?>">
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn"><?php echo $product ? 'Update Product' : 'Create Product'; ?></button>
                            <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>
</body>
</html>
