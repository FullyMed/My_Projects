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
$review = null;
$reviewId = get_query_param('id', 0, FILTER_VALIDATE_INT) ?: 0;

if ($reviewId) {
    $stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ? LIMIT 1');
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();

    if (!$review) {
        $error = 'We couldn\'t find that review.';
    }
}

/**
 * Recalculate the denormalized rating_avg / rating_count for one product (see CLAUDE.md).
 */
function recalculateProductRating($pdo, $productId) {
    $stmt = $pdo->prepare('
        UPDATE products SET
            rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = products.id), 0),
            rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id)
        WHERE id = ?
    ');
    $stmt->execute([$productId]);
}

// Values shown in the form: the saved review, or what was just submitted if saving failed.
$form = $review ?: [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Your session expired. Reload the page and try again.';
    } else {
        $action = post_string('action');

        $form = [
            'product_id'        => (int)post_string('product_id'),
            'rating'            => (int)post_string('rating'),
            'title'             => post_string('title'),
            'content'           => post_string('content'),
            'reviewer_name'     => post_string('reviewer_name'),
            'reviewer_email'    => post_string('reviewer_email'),
            'verified_purchase' => isset($_POST['verified_purchase']) ? 1 : 0,
        ];

        $productStmt = $pdo->prepare('SELECT 1 FROM products WHERE id = ? LIMIT 1');
        $productStmt->execute([$form['product_id']]);

        if (!in_array($action, ['create', 'update'], true) || ($action === 'update') !== (bool)$review) {
            $error = 'Something went wrong. Reload the page and try again.';
        } elseif ($form['product_id'] < 1 || $form['rating'] < 1 || $form['rating'] > 5) {
            $error = 'Pick a product and a rating from 1 to 5.';
        } elseif (!$productStmt->fetchColumn()) {
            $error = 'That product no longer exists. Pick another one.';
        } elseif ($form['reviewer_email'] !== '' && (!is_valid_email($form['reviewer_email']) || strlen($form['reviewer_email']) > 255)) {
            $error = 'The reviewer\'s email address doesn\'t look right.';
        } else {
            $values = [
                $form['product_id'],
                $form['rating'],
                $form['title'] !== '' ? mb_substr($form['title'], 0, 255, 'UTF-8') : null,
                $form['content'] !== '' ? $form['content'] : null,
                $form['reviewer_name'] !== '' ? mb_substr($form['reviewer_name'], 0, 255, 'UTF-8') : null,
                $form['reviewer_email'] !== '' ? $form['reviewer_email'] : null,
                $form['verified_purchase'],
            ];

            try {
                $pdo->beginTransaction();

                if ($action === 'create') {
                    $stmt = $pdo->prepare('INSERT INTO reviews (product_id, rating, title, content, reviewer_name, reviewer_email, verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)');
                    $stmt->execute($values);
                    recalculateProductRating($pdo, $form['product_id']);
                    $pdo->commit();
                    header('Location: ' . BASE_URL . '/admin/reviews.php');
                    exit;
                }

                $values[] = (int)$review['id'];
                $stmt = $pdo->prepare('UPDATE reviews SET product_id = ?, rating = ?, title = ?, content = ?, reviewer_name = ?, reviewer_email = ?, verified_purchase = ?, updated_at = NOW() WHERE id = ?');
                $stmt->execute($values);
                recalculateProductRating($pdo, $form['product_id']);
                // If the review was moved to a different product, the old product's rating changes too.
                if ((int)$review['product_id'] !== $form['product_id']) {
                    recalculateProductRating($pdo, (int)$review['product_id']);
                }
                $pdo->commit();

                $message = 'Review saved.';
                $stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ? LIMIT 1');
                $stmt->execute([(int)$review['id']]);
                $review = $stmt->fetch();
                $form = $review;
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log('Failed to save review: ' . $e->getMessage());
                $error = 'We couldn\'t save the review. Try again.';
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
    <title><?php echo $review ? 'Edit review' : 'Create review'; ?></title>
    
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
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="active" aria-current="page">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a></li>
                </ul>
            </nav>
        </aside>

        <main class="main-content" id="main" tabindex="-1">
            <div class="topbar">
                <h1><?php echo $review ? 'Edit review' : 'Create review'; ?></h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="back-link">← Back to reviews</a>
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
                                    <option value="">Choose a product</option>
                                    <?php foreach ($products as $product): ?>
                                        <option value="<?php echo htmlspecialchars($product['id']); ?>" <?php echo ((int)($form['product_id'] ?? 0) === (int)$product['id']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($product['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="rating">Rating <span class="required">*</span></label>
                                <select id="rating" name="rating" required>
                                    <option value="">Choose a rating</option>
                                    <option value="5" <?php echo (int)($form['rating'] ?? 0) === 5 ? 'selected' : ''; ?>>5 - Excellent</option>
                                    <option value="4" <?php echo (int)($form['rating'] ?? 0) === 4 ? 'selected' : ''; ?>>4 - Good</option>
                                    <option value="3" <?php echo (int)($form['rating'] ?? 0) === 3 ? 'selected' : ''; ?>>3 - Average</option>
                                    <option value="2" <?php echo (int)($form['rating'] ?? 0) === 2 ? 'selected' : ''; ?>>2 - Poor</option>
                                    <option value="1" <?php echo (int)($form['rating'] ?? 0) === 1 ? 'selected' : ''; ?>>1 - Terrible</option>
                                </select>
                            </div>

                            <div class="form-group full">
                                <label for="title">Title</label>
                                <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($form['title'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="reviewer_name">Reviewer name</label>
                                <input type="text" id="reviewer_name" name="reviewer_name" value="<?php echo htmlspecialchars($form['reviewer_name'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="reviewer_email">Reviewer email</label>
                                <input type="email" id="reviewer_email" name="reviewer_email" value="<?php echo htmlspecialchars($form['reviewer_email'] ?? ''); ?>">
                            </div>

                            <div class="form-group full">
                                <label for="content">Review text</label>
                                <textarea id="content" name="content"><?php echo htmlspecialchars($form['content'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group full">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="verified_purchase" name="verified_purchase" <?php echo !empty($form['verified_purchase']) ? 'checked' : ''; ?>>
                                    <label for="verified_purchase" style="margin-bottom: 0;">Verified purchase</label>
                                </div>
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn"><?php echo $review ? 'Save review' : 'Create review'; ?></button>
                            <a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
    <script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>
</body>
</html>
