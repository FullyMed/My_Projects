<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_connect.php';
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

        .back-link {
            color: #8b6f47;
            text-decoration: none;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
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

        .form-section {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .form-section h3 {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
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
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d6d3d1;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #8b6f47;
            box-shadow: 0 0 0 3px rgba(139, 111, 71, 0.1);
        }

        .form-group.full {
            grid-column: 1 / -1;
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

        .btn-danger {
            background: #c53030;
        }

        .btn-danger:hover {
            background: #e53e3e;
        }

        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .image-card {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .image-preview {
            width: 100%;
            height: 200px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .image-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-info {
            padding: 1rem;
        }

        .image-alt {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.5rem;
            word-break: break-word;
        }

        .image-sort {
            font-size: 0.875rem;
            color: #999;
            margin-bottom: 0.75rem;
        }

        .image-actions {
            display: flex;
            gap: 0.5rem;
        }

        .image-actions form {
            flex: 1;
        }

        .image-actions button {
            width: 100%;
            padding: 0.5rem;
            font-size: 0.875rem;
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

            .images-grid {
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
