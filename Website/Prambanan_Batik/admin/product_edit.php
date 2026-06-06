<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';
$product = null;
$productId = $_GET['id'] ?? '';

if ($productId) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        $error = 'Product not found';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request token';
    } else {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $categoryId = trim($_POST['category_id'] ?? '');
        $sku = trim($_POST['sku'] ?? '');
        $slug = trim($_POST['slug'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $priceDisplay = trim($_POST['price_display'] ?? '');
        $buyLinkShopee = trim($_POST['buy_link_shopee'] ?? '');
        $buyLinkTokopedia = trim($_POST['buy_link_tokopedia'] ?? '');
        $buyLinkOther = trim($_POST['buy_link_other'] ?? '');

        if (empty($categoryId) || empty($sku) || empty($slug) || empty($name) || empty($priceDisplay)) {
            $error = 'Category, SKU, slug, name, and price are required';
        } else {
            try {
                $stmt = $pdo->prepare('INSERT INTO products (category_id, sku, slug, name, description, price_display, buy_link_shopee, buy_link_tokopedia, buy_link_other) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$categoryId, $sku, $slug, $name, $description ?: null, $priceDisplay, $buyLinkShopee ?: null, $buyLinkTokopedia ?: null, $buyLinkOther ?: null]);
                $message = 'Product created successfully';
                header('Location: /admin/products.php');
                exit;
            } catch (Exception $e) {
                $error = 'Failed to create product: ' . $e->getMessage();
            }
        }
    } elseif ($action === 'update') {
        $id = trim($_POST['id'] ?? '');
        $categoryId = trim($_POST['category_id'] ?? '');
        $sku = trim($_POST['sku'] ?? '');
        $slug = trim($_POST['slug'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $priceDisplay = trim($_POST['price_display'] ?? '');
        $buyLinkShopee = trim($_POST['buy_link_shopee'] ?? '');
        $buyLinkTokopedia = trim($_POST['buy_link_tokopedia'] ?? '');
        $buyLinkOther = trim($_POST['buy_link_other'] ?? '');

        if (empty($id) || empty($categoryId) || empty($sku) || empty($slug) || empty($name) || empty($priceDisplay)) {
            $error = 'All required fields must be filled';
        } else {
            try {
                $stmt = $pdo->prepare('UPDATE products SET category_id = ?, sku = ?, slug = ?, name = ?, description = ?, price_display = ?, buy_link_shopee = ?, buy_link_tokopedia = ?, buy_link_other = ?, updated_at = NOW() WHERE id = ?');
                $stmt->execute([$categoryId, $sku, $slug, $name, $description ?: null, $priceDisplay, $buyLinkShopee ?: null, $buyLinkTokopedia ?: null, $buyLinkOther ?: null, $id]);
                $message = 'Product updated successfully';
                $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
                $stmt->execute([$id]);
                $product = $stmt->fetch();
            } catch (Exception $e) {
                $error = 'Failed to update product: ' . $e->getMessage();
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
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="/admin/index.php">Dashboard</a></li>
                    <li><a href="/admin/categories.php">Categories</a></li>
                    <li><a href="/admin/products.php" class="active">Products</a></li>
                    <li><a href="/admin/reviews.php">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1><?php echo $product ? 'Edit Product' : 'Create Product'; ?></h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="/admin/products.php" class="back-link">← Back to Products</a>
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
                                <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="sku">SKU <span class="required">*</span></label>
                                <input type="text" id="sku" name="sku" value="<?php echo htmlspecialchars($product['sku'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="slug">Slug <span class="required">*</span></label>
                                <input type="text" id="slug" name="slug" value="<?php echo htmlspecialchars($product['slug'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="category_id">Category <span class="required">*</span></label>
                                <select id="category_id" name="category_id" required>
                                    <option value="">Select Category</option>
                                    <?php foreach ($categories as $category): ?>
                                        <option value="<?php echo htmlspecialchars($category['id']); ?>" <?php echo ($product && (int)$product['category_id'] === (int)$category['id']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($category['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="price_display">Price <span class="required">*</span></label>
                                <input type="number" id="price_display" name="price_display" step="0.01" value="<?php echo htmlspecialchars($product['price_display'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group full">
                                <label for="description">Description</label>
                                <textarea id="description" name="description"><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_shopee">Shopee Link</label>
                                <input type="url" id="buy_link_shopee" name="buy_link_shopee" value="<?php echo htmlspecialchars($product['buy_link_shopee'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_tokopedia">Tokopedia Link</label>
                                <input type="url" id="buy_link_tokopedia" name="buy_link_tokopedia" value="<?php echo htmlspecialchars($product['buy_link_tokopedia'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="buy_link_other">Other Link</label>
                                <input type="url" id="buy_link_other" name="buy_link_other" value="<?php echo htmlspecialchars($product['buy_link_other'] ?? ''); ?>">
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn"><?php echo $product ? 'Update Product' : 'Create Product'; ?></button>
                            <a href="/admin/products.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
