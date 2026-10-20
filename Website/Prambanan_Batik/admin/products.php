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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Your session expired. Reload the page and try again.';
    } else {
        $id = post_string('id');

        if (empty($id)) {
            $error = 'We couldn\'t find that product.';
        } else {
            try {
                $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
                $stmt->execute([$id]);
                $message = 'Product deleted.';
            } catch (Exception $e) {
                error_log('Failed to delete product: ' . $e->getMessage());
                $error = 'We couldn\'t delete the product. Try again.';
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT p.id, p.name, p.sku, p.price_display, p.category_id, c.name as category_name, p.created_at FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
$stmt->execute();
$products = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage products</title>
    
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo SITE_PATH; ?>/assets/favicon/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset_url('admin/admin.css'); ?>">
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin panel</h2>
            </div>
            <nav aria-label="Admin">
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php" class="active" aria-current="page">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a></li>
                </ul>
            </nav>
        </aside>

        <main class="main-content" id="main" tabindex="-1">
            <div class="topbar">
                <h1>Products</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <h2 class="page-title">Manage products</h2>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="<?php echo SITE_PATH; ?>/admin/product_edit.php" class="btn">Create product</a>
                        <a href="<?php echo SITE_PATH; ?>/admin/import_products.php" class="btn">Import CSV</a>
                    </div>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <div class="table-section">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($product['name']); ?></td>
                                    <td class="nowrap"><?php echo htmlspecialchars($product['sku']); ?></td>
                                    <td><?php echo htmlspecialchars($product['category_name'] ?? 'N/A'); ?></td>
                                    <td class="nowrap num"><?php echo htmlspecialchars(format_currency($product['price_display'])); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($product['created_at'])); ?></td>
                                    <td>
                                        <div class="action-buttons">
                                            <a href="<?php echo SITE_PATH; ?>/admin/product_edit.php?id=<?php echo urlencode($product['id']); ?>" class="btn-primary">Edit</a>
                                            <a href="<?php echo SITE_PATH; ?>/admin/product_images.php?product_id=<?php echo urlencode($product['id']); ?>" class="btn-primary">Images</a>
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($product['id']); ?>">
                                                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this product?')">Delete</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    <script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>
</body>
</html>
