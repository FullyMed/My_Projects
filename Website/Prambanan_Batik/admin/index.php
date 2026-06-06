<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$stats = [
    'products'   => 0,
    'categories' => 0,
    'reviews'    => 0,
    'clicks'     => 0,
];

$recent_reviews = [];

if ($pdo !== null) {
    try {
        $row = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
        $stats['products'] = (int)$row;

        $row = $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
        $stats['categories'] = (int)$row;

        $row = $pdo->query('SELECT COUNT(*) FROM reviews')->fetchColumn();
        $stats['reviews'] = (int)$row;

        $row = $pdo->query('SELECT COUNT(*) FROM outbound_clicks')->fetchColumn();
        $stats['clicks'] = (int)$row;

        $stmt = $pdo->prepare('
            SELECT r.reviewer_name, r.rating, r.created_at, p.name AS product_name, p.id AS product_id
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
            LIMIT 5
        ');
        $stmt->execute();
        $recent_reviews = $stmt->fetchAll();
    } catch (Exception $e) {
        error_log('Dashboard stats error: ' . $e->getMessage());
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo SITE_PATH; ?>/admin/admin.css">
    <style>
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: #fff;
            border: 1px solid #ecddd0;
            border-radius: 0.75rem;
            padding: 1.25rem 1.5rem;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #c4872c;
            line-height: 1;
            margin-bottom: 0.25rem;
        }
        .stat-label {
            font-size: 0.8125rem;
            color: #8c7560;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .recent-table td, .recent-table th {
            padding: 0.6rem 0.75rem;
            font-size: 0.875rem;
        }
        .star-badge {
            color: #c4872c;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin Panel</h2>
                <p>Prambanan Batik</p>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php" class="active">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Dashboard</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number"><?php echo number_format($stats['products']); ?></div>
                        <div class="stat-label">Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo number_format($stats['categories']); ?></div>
                        <div class="stat-label">Categories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo number_format($stats['reviews']); ?></div>
                        <div class="stat-label">Reviews</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo number_format($stats['clicks']); ?></div>
                        <div class="stat-label">Outbound Clicks</div>
                    </div>
                </div>

                <div class="quick-actions" style="margin-bottom: 2rem;">
                    <a href="<?php echo SITE_PATH; ?>/admin/categories.php" class="action-btn">Manage Categories</a>
                    <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="action-btn">Manage Products</a>
                    <a href="<?php echo SITE_PATH; ?>/admin/reviews.php" class="action-btn">Manage Reviews</a>
                    <a href="<?php echo SITE_PATH; ?>/admin/import_products.php" class="action-btn">Import CSV</a>
                </div>

                <?php if (!empty($recent_reviews)): ?>
                <div class="table-section">
                    <h3 style="margin-bottom: 1rem;">Recent Reviews</h3>
                    <table class="recent-table">
                        <thead>
                            <tr>
                                <th>Reviewer</th>
                                <th>Rating</th>
                                <th>Product</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_reviews as $r): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($r['reviewer_name'] ?? 'Anonymous'); ?></td>
                                <td><span class="star-badge"><?php echo (int)$r['rating']; ?>★</span></td>
                                <td>
                                    <a href="<?php echo SITE_PATH; ?>/admin/product_edit.php?id=<?php echo urlencode($r['product_id']); ?>">
                                        <?php echo htmlspecialchars($r['product_name'] ?? '—'); ?>
                                    </a>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($r['created_at'])); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>

            </div>
        </div>
    </div>
</body>
</html>
