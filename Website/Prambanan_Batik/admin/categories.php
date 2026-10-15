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
$edit_category = null;
$edit_id = isset($_GET['edit']) ? (int)$_GET['edit'] : null;

if ($edit_id) {
    $stmt = $pdo->prepare('SELECT id, name, slug, description FROM categories WHERE id = ? LIMIT 1');
    $stmt->execute([$edit_id]);
    $edit_category = $stmt->fetch();
    if (!$edit_category) {
        $edit_id = null;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Your session expired. Reload the page and try again.';
    } else {
        $action = $_POST['action'] ?? '';

        if ($action === 'create') {
            $name = post_string('name');
            // Normalise the slug (lowercase, hyphens); if left blank, derive it from the name.
            $slug = slugify(post_string('slug') !== '' ? post_string('slug') : $name);
            $description = post_string('description');

            if ($name === '' || $slug === '') {
                $error = 'Enter a name for the category.';
            } else {
                try {
                    $stmt = $pdo->prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
                    $stmt->execute([$name, $slug, $description ?: null]);
                    $message = 'Category created.';
                } catch (Exception $e) {
                    error_log('Failed to create category: ' . $e->getMessage());
                    $error = 'We couldn\'t create the category. Another category may already use that name or slug.';
                }
            }
        } elseif ($action === 'update') {
            $id = (int)post_string('id');
            $name = post_string('name');
            $slug = slugify(post_string('slug') !== '' ? post_string('slug') : $name);
            $description = post_string('description');

            if ($id < 1 || $name === '' || $slug === '') {
                $error = 'Enter a name for the category.';
            } else {
                try {
                    $stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = NOW() WHERE id = ?');
                    $stmt->execute([$name, $slug, $description ?: null, $id]);
                    $message = 'Category saved.';
                    $edit_category = null;
                    $edit_id = null;
                } catch (Exception $e) {
                    error_log('Failed to update category: ' . $e->getMessage());
                    $error = 'We couldn\'t save the category. Another category may already use that name or slug.';
                }
            }
        } elseif ($action === 'delete') {
            $id = (int)post_string('id');

            if ($id < 1) {
                $error = 'We couldn\'t find that category.';
            } else {
                try {
                    // Products in this category are kept; the FK sets their category_id to NULL.
                    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
                    $countStmt->execute([$id]);
                    $orphaned = (int)$countStmt->fetchColumn();

                    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
                    $stmt->execute([$id]);
                    $message = 'Category deleted.' . ($orphaned > 0 ? ' ' . $orphaned . ($orphaned === 1 ? ' product now has' : ' products now have') . ' no category.' : '');
                    if ($edit_id === $id) {
                        $edit_category = null;
                        $edit_id = null;
                    }
                } catch (Exception $e) {
                    error_log('Failed to delete category: ' . $e->getMessage());
                    $error = 'We couldn\'t delete the category. Try again.';
                }
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT id, name, slug, description, created_at FROM categories ORDER BY created_at DESC');
$stmt->execute();
$categories = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage categories</title>

    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo SITE_PATH; ?>/assets/favicon/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset_url('admin/admin.css'); ?>">
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin panel</h2>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php" class="active">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Categories</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a>
                </div>
            </div>

            <div class="content">
                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <?php if ($edit_category): ?>
                    <div class="form-section">
                        <h3>Edit category</h3>
                        <form method="POST">
                            <input type="hidden" name="action" value="update">
                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($edit_category['id']); ?>">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                            <div class="form-group">
                                <label for="edit_name">Name</label>
                                <input type="text" id="edit_name" name="name" value="<?php echo htmlspecialchars($edit_category['name']); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="edit_slug">Slug</label>
                                <input type="text" id="edit_slug" name="slug" value="<?php echo htmlspecialchars($edit_category['slug']); ?>" placeholder="Leave blank to make one from the name">
                            </div>

                            <div class="form-group">
                                <label for="edit_description">Description</label>
                                <textarea id="edit_description" name="description"><?php echo htmlspecialchars($edit_category['description'] ?? ''); ?></textarea>
                            </div>

                            <div style="display: flex; gap: 0.5rem;">
                                <button type="submit" class="btn">Save category</button>
                                <a href="<?php echo SITE_PATH; ?>/admin/categories.php" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="form-section">
                        <h3>New category</h3>
                        <form method="POST">
                            <input type="hidden" name="action" value="create">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" name="name" required>
                            </div>

                            <div class="form-group">
                                <label for="slug">Slug</label>
                                <input type="text" id="slug" name="slug" placeholder="Leave blank to make one from the name">
                            </div>

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea id="description" name="description"></textarea>
                            </div>

                            <button type="submit" class="btn">Create category</button>
                        </form>
                    </div>
                <?php endif; ?>

                <div class="table-section">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Description</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($categories as $category): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($category['name']); ?></td>
                                    <td><?php echo htmlspecialchars($category['slug']); ?></td>
                                    <td><?php echo htmlspecialchars(truncate_text($category['description'] ?? '', 50)); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($category['created_at'])); ?></td>
                                    <td>
                                        <div class="action-buttons">
                                            <a href="<?php echo SITE_PATH; ?>/admin/categories.php?edit=<?php echo urlencode($category['id']); ?>" class="btn-primary">Edit</a>
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($category['id']); ?>">
                                                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this category? Its products stay, but they\'ll have no category.')">Delete</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>
</body>
</html>
