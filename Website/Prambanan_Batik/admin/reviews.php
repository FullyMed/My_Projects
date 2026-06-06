<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request token';
    } else {
        $action = $_POST['action'] ?? '';

        if ($action === 'delete') {
            $id = trim($_POST['id'] ?? '');

            if (empty($id)) {
                $error = 'Review ID is required';
            } else {
                try {
                    $stmt = $pdo->prepare('DELETE FROM reviews WHERE id = ?');
                    $stmt->execute([$id]);
                    $message = 'Review deleted successfully';
                } catch (Exception $e) {
                    $error = 'Failed to delete review: ' . $e->getMessage();
                }
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT r.id, r.content, r.rating, r.reviewer_name, r.verified_purchase, r.created_at, p.name as product_name, p.id as product_id FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC');
$stmt->execute();
$reviews = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Reviews</title>
    
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
                    <li><a href="/admin/reviews.php" class="active">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Reviews</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <h2 class="page-title">Manage Reviews</h2>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <?php if (count($reviews) > 0): ?>
                    <div class="reviews-list">
                        <?php foreach ($reviews as $review): ?>
                            <div class="review-card">
                                <div class="review-header">
                                    <div>
                                        <div class="review-meta">
                                            <div class="meta-item">
                                                <span class="rating-badge"><?php echo htmlspecialchars($review['rating']); ?></span>
                                                <span>stars</span>
                                            </div>
                                            <div class="meta-item">
                                                <span class="reviewer-name"><?php echo htmlspecialchars($review['reviewer_name'] ?? 'Anonymous'); ?></span>
                                            </div>
                                            <?php if ($review['verified_purchase']): ?>
                                                <span class="verified-badge">Verified Purchase</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div style="text-align: right; color: #999; font-size: 0.875rem;">
                                        <?php echo date('M d, Y', strtotime($review['created_at'])); ?>
                                    </div>
                                </div>

                                <?php if ($review['content']): ?>
                                    <div class="review-content"><?php echo nl2br(htmlspecialchars($review['content'])); ?></div>
                                <?php endif; ?>

                                <?php if ($review['product_name']): ?>
                                    <div class="review-product">
                                        Product: <a href="/admin/product_edit.php?id=<?php echo urlencode($review['product_id']); ?>"><?php echo htmlspecialchars($review['product_name']); ?></a>
                                    </div>
                                <?php endif; ?>

                                <div class="review-actions">
                                    <a href="/admin/review_edit.php?id=<?php echo urlencode($review['id']); ?>" class="btn">Edit</a>
                                    <form method="POST" style="display: inline;">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?php echo htmlspecialchars($review['id']); ?>">
                                        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                        <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this review?')">Delete</button>
                                    </form>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="empty-state">
                        <p>No reviews yet</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>
