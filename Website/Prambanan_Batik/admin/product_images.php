<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';
$productId = $_GET['product_id'] ?? '';

if (!$productId) {
    $error = 'Product ID is required';
} else {
    $stmt = $pdo->prepare('SELECT id, name FROM products WHERE id = ? LIMIT 1');
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

        if ($action === 'upload') {
            $imageUrl = trim($_POST['image_url'] ?? '');
            $altText = trim($_POST['alt_text'] ?? '');
            $sortOrder = intval($_POST['sort_order'] ?? 0);

            if (empty($productId) || empty($imageUrl)) {
                $error = 'Product and image URL are required';
            } else {
                try {
                    $stmt = $pdo->prepare('INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)');
                    $stmt->execute([$productId, $imageUrl, $altText ?: null, $sortOrder]);
                    $message = 'Image added successfully';
                } catch (Exception $e) {
                    $error = 'Failed to add image: ' . $e->getMessage();
                }
            }
        } elseif ($action === 'delete') {
            $imageId = trim($_POST['id'] ?? '');

            if (empty($imageId)) {
                $error = 'Image ID is required';
            } else {
                try {
                    $stmt = $pdo->prepare('DELETE FROM product_images WHERE id = ?');
                    $stmt->execute([$imageId]);
                    $message = 'Image deleted successfully';
                } catch (Exception $e) {
                    $error = 'Failed to delete image: ' . $e->getMessage();
                }
            }
        }
    }
}

$images = [];
if ($productId) {
    $stmt = $pdo->prepare('SELECT id, image_url, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC');
    $stmt->execute([$productId]);
    $images = $stmt->fetchAll();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Product Images</title>
    
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
                    <li><a href="/admin/products.php">Products</a></li>
                    <li><a href="/admin/reviews.php">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Product Images</h1>
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

                <?php if ($product): ?>
                    <div class="form-section">
                        <h3>Product: <?php echo htmlspecialchars($product['name']); ?></h3>
                    </div>

                    <div class="form-section">
                        <h3>Add Image</h3>
                        <form method="POST">
                            <input type="hidden" name="action" value="upload">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                            <div class="form-grid">
                                <div class="form-group full">
                                    <label for="image_url">Image URL <span class="required">*</span></label>
                                    <input type="url" id="image_url" name="image_url" required>
                                </div>

                                <div class="form-group full">
                                    <label for="alt_text">Alt Text</label>
                                    <input type="text" id="alt_text" name="alt_text" placeholder="Describe the image">
                                </div>

                                <div class="form-group full">
                                    <label for="sort_order">Sort Order</label>
                                    <input type="number" id="sort_order" name="sort_order" value="0">
                                </div>
                            </div>

                            <button type="submit" class="btn">Add Image</button>
                        </form>
                    </div>

                    <?php if (count($images) > 0): ?>
                        <div class="form-section">
                            <h3>Product Images</h3>
                            <div class="images-grid">
                                <?php foreach ($images as $image): ?>
                                    <div class="image-card">
                                        <div class="image-preview">
                                            <img src="<?php echo htmlspecialchars($image['image_url']); ?>" alt="<?php echo htmlspecialchars($image['alt_text'] ?? ''); ?>">
                                        </div>
                                        <div class="image-info">
                                            <?php if ($image['alt_text']): ?>
                                                <div class="image-alt"><?php echo htmlspecialchars($image['alt_text']); ?></div>
                                            <?php endif; ?>
                                            <div class="image-sort">Order: <?php echo htmlspecialchars($image['sort_order']); ?></div>
                                            <div class="image-actions">
                                                <form method="POST">
                                                    <input type="hidden" name="action" value="delete">
                                                    <input type="hidden" name="id" value="<?php echo htmlspecialchars($image['id']); ?>">
                                                    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this image?')">Delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="form-section">
                            <p style="color: #999; text-align: center;">No images yet. Add one above.</p>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>
