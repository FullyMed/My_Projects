<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

        .reviews-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .review-card {
            background: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1rem;
            gap: 1rem;
        }

        .review-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #2d3436;
        }

        .review-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
            font-size: 0.875rem;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .rating-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #8b6f47;
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .verified-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #f0fdf4;
            color: #166534;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .reviewer-name {
            color: #666;
        }

        .reviewer-email {
            color: #999;
            word-break: break-word;
        }

        .review-content {
            color: #555;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .review-product {
            font-size: 0.875rem;
            color: #8b6f47;
            margin-bottom: 1rem;
        }

        .review-product a {
            color: #8b6f47;
            text-decoration: none;
        }

        .review-product a:hover {
            text-decoration: underline;
        }

        .review-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #8b6f47;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 200ms ease-in-out;
            font-size: 0.875rem;
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

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #999;
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

            .review-header {
                flex-direction: column;
            }

            .review-meta {
                flex-wrap: wrap;
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
