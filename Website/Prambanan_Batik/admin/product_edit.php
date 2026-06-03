<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_connect.php';
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
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="stylesheet" href="/admin/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-container {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 240px;
            background: #2d3436;
            color: #ecf0f1;
            padding: 2rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 0 1.5rem 2rem;
            border-bottom: 1px solid #34495e;
        }

        .sidebar-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
        }

        .sidebar-nav {
            list-style: none;
        }

        .sidebar-nav li a {
            display: block;
            padding: 0.75rem 1.5rem;
            color: #bdc3c7;
            text-decoration: none;
            transition: all 200ms ease-in-out;
            border-left: 3px solid transparent;
        }

        .sidebar-nav li a:hover {
            background: #34495e;
            color: #ecf0f1;
            border-left-color: #8b6f47;
        }

        .sidebar-nav li a.active {
            background: #34495e;
            color: #8b6f47;
            border-left-color: #8b6f47;
            font-weight: 600;
        }

        .main-content {
            flex: 1;
            margin-left: 240px;
        }

        .topbar {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .topbar-user {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .topbar-user a {
            color: #8b6f47;
            text-decoration: none;
            font-weight: 500;
            transition: color 200ms ease-in-out;
        }

        .topbar-user a:hover {
            color: #a0824d;
        }

        .content {
            padding: 2rem;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 1.875rem;
            color: #2d3436;
        }

        .back-link {
            color: #8b6f47;
            text-decoration: none;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        .form-section {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2d3436;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d6d3d1;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-family: inherit;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 120px;
            grid-column: 1 / -1;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #8b6f47;
            box-shadow: 0 0 0 3px rgba(139, 111, 71, 0.1);
        }

        .form-group.full {
            grid-column: 1 / -1;
        }

        .button-group {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #8b6f47;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 200ms ease-in-out;
        }

        .btn:hover {
            background: #a0824d;
        }

        .btn-secondary {
            background: #666;
        }

        .btn-secondary:hover {
            background: #777;
        }

        .message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid;
        }

        .message.success {
            background: #f0fdf4;
            color: #166534;
            border-color: #166534;
        }

        .message.error {
            background: #fdeaea;
            color: #c53030;
            border-color: #c53030;
        }

        .required {
            color: #c53030;
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 0;
                overflow: hidden;
            }

            .main-content {
                margin-left: 0;
            }

            .page-header {
                flex-direction: column;
                gap: 1rem;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
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
                                        <option value="<?php echo htmlspecialchars($category['id']); ?>" <?php echo ($product && $product['category_id'] === $category['id']) ? 'selected' : ''; ?>>
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
