<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_connect.php';
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
                header('Location: /admin/reviews.php');
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

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .checkbox-group input[type="checkbox"] {
            width: auto;
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
                    <li><a href="/admin/products.php">Products</a></li>
                    <li><a href="/admin/reviews.php" class="active">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1><?php echo $review ? 'Edit Review' : 'Create Review'; ?></h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="/admin/reviews.php" class="back-link">← Back to Reviews</a>
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
                        <?php if ($review): ?>
                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($review['id']); ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="product_id">Product <span class="required">*</span></label>
                                <select id="product_id" name="product_id" required>
                                    <option value="">Select Product</option>
                                    <?php foreach ($products as $product): ?>
                                        <option value="<?php echo htmlspecialchars($product['id']); ?>" <?php echo ($review && $review['product_id'] === $product['id']) ? 'selected' : ''; ?>>
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
                            <a href="/admin/reviews.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
