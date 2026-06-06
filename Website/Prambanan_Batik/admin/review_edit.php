<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';
$review = null;
$reviewId = $_GET['id'] ?? '';

if ($reviewId) {
    $stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ? LIMIT 1');
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();

    if (!$review) {
        $error = 'Review not found';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request token';
    } else {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $productId = trim($_POST['product_id'] ?? '');
        $rating = intval($_POST['rating'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $reviewerName = trim($_POST['reviewer_name'] ?? '');
        $reviewerEmail = trim($_POST['reviewer_email'] ?? '');
        $verifiedPurchase = isset($_POST['verified_purchase']) ? true : false;

        if (empty($productId) || $rating < 1 || $rating > 5) {
            $error = 'Product and rating (1-5) are required';
        } else {
            try {
                $stmt = $pdo->prepare('INSERT INTO reviews (product_id, rating, title, content, reviewer_name, reviewer_email, verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$productId, $rating, $title ?: null, $content ?: null, $reviewerName ?: null, $reviewerEmail ?: null, $verifiedPurchase]);
                $message = 'Review created successfully';
                header('Location: ' . BASE_URL . '/admin/reviews.php');
                exit;
            } catch (Exception $e) {
                $error = 'Failed to create review: ' . $e->getMessage();
            }
        }
    } elseif ($action === 'update') {
        $id = trim($_POST['id'] ?? '');
        $productId = trim($_POST['product_id'] ?? '');
        $rating = intval($_POST['rating'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $reviewerName = trim($_POST['reviewer_name'] ?? '');
        $reviewerEmail = trim($_POST['reviewer_email'] ?? '');
        $verifiedPurchase = isset($_POST['verified_purchase']) ? true : false;

        if (empty($id) || empty($productId) || $rating < 1 || $rating > 5) {
            $error = 'All required fields must be filled';
        } else {
            try {
                $stmt = $pdo->prepare('UPDATE reviews SET product_id = ?, rating = ?, title = ?, content = ?, reviewer_name = ?, reviewer_email = ?, verified_purchase = ?, updated_at = NOW() WHERE id = ?');
                $stmt->execute([$productId, $rating, $title ?: null, $content ?: null, $reviewerName ?: null, $reviewerEmail ?: null, $verifiedPurchase, $id]);
                $message = 'Review updated successfully';
                $stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ? LIMIT 1');
                $stmt->execute([$id]);
                $review = $stmt->fetch();
            } catch (Exception $e) {
                $error = 'Failed to update review: ' . $e->getMessage();
            }
        }
    }
    }
}

$stmt = $pdo->prepare('SELECT id, name FROM products ORDER BY name');
$stmt->execute();
$products = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $review ? 'Edit Review' : 'Create Review'; ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo SITE_PATH; ?>/admin/admin.css">
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
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="active">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1><?php echo $review ? 'Edit Review' : 'Create Review'; ?></h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="back-link">← Back to Reviews</a>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <div class="form-section">
                    <form method="POST">
                        <input type="hidden" name="action" value="<?php echo $review ? 'update' : 'create'; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                        <?php if ($review): ?>
                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($review['id']); ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="product_id">Product <span class="required">*</span></label>
                                <select id="product_id" name="product_id" required>
                                    <option value="">Select Product</option>
                                    <?php foreach ($products as $product): ?>
                                        <option value="<?php echo htmlspecialchars($product['id']); ?>" <?php echo ($review && (int)$review['product_id'] === (int)$product['id']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($product['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="rating">Rating <span class="required">*</span></label>
                                <select id="rating" name="rating" required>
                                    <option value="">Select Rating</option>
                                    <option value="5" <?php echo ($review && $review['rating'] == 5) ? 'selected' : ''; ?>>5 - Excellent</option>
                                    <option value="4" <?php echo ($review && $review['rating'] == 4) ? 'selected' : ''; ?>>4 - Good</option>
                                    <option value="3" <?php echo ($review && $review['rating'] == 3) ? 'selected' : ''; ?>>3 - Average</option>
                                    <option value="2" <?php echo ($review && $review['rating'] == 2) ? 'selected' : ''; ?>>2 - Poor</option>
                                    <option value="1" <?php echo ($review && $review['rating'] == 1) ? 'selected' : ''; ?>>1 - Terrible</option>
                                </select>
                            </div>

                            <div class="form-group full">
                                <label for="title">Title</label>
                                <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($review['title'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="reviewer_name">Reviewer Name</label>
                                <input type="text" id="reviewer_name" name="reviewer_name" value="<?php echo htmlspecialchars($review['reviewer_name'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="reviewer_email">Reviewer Email</label>
                                <input type="email" id="reviewer_email" name="reviewer_email" value="<?php echo htmlspecialchars($review['reviewer_email'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="content">Review Content</label>
                                <textarea id="content" name="content"><?php echo htmlspecialchars($review['content'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group full">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="verified_purchase" name="verified_purchase" <?php echo ($review && $review['verified_purchase']) ? 'checked' : ''; ?>>
                                    <label for="verified_purchase" style="margin-bottom: 0;">Verified Purchase</label>
                                </div>
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn"><?php echo $review ? 'Update Review' : 'Create Review'; ?></button>
                            <a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
