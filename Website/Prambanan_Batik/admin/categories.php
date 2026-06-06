<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
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
        $error = 'Invalid request token';
    } else {
        $action = $_POST['action'] ?? '';

        if ($action === 'create') {
            $name = trim($_POST['name'] ?? '');
            $slug = trim($_POST['slug'] ?? '');
            $description = trim($_POST['description'] ?? '');

            if (empty($name) || empty($slug)) {
                $error = 'Name and slug are required';
            } else {
                try {
                    $stmt = $pdo->prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
                    $stmt->execute([$name, $slug, $description ?: null]);
                    $message = 'Category created successfully';
                } catch (Exception $e) {
                    $error = 'Failed to create category: ' . $e->getMessage();
                }
            }
        } elseif ($action === 'update') {
            $id = trim($_POST['id'] ?? '');
            $name = trim($_POST['name'] ?? '');
            $slug = trim($_POST['slug'] ?? '');
            $description = trim($_POST['description'] ?? '');

            if (empty($id) || empty($name) || empty($slug)) {
                $error = 'ID, name and slug are required';
            } else {
                try {
                    $stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = NOW() WHERE id = ?');
                    $stmt->execute([$name, $slug, $description ?: null, $id]);
                    $message = 'Category updated successfully';
                    $edit_category = null;
                    $edit_id = null;
                } catch (Exception $e) {
                    $error = 'Failed to update category: ' . $e->getMessage();
                }
            }
        } elseif ($action === 'delete') {
            $id = trim($_POST['id'] ?? '');

            if (empty($id)) {
                $error = 'Category ID is required';
            } else {
                try {
                    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
                    $stmt->execute([$id]);
                    $message = 'Category deleted successfully';
                } catch (Exception $e) {
                    $error = 'Failed to delete category: ' . $e->getMessage();
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
    <title>Manage Categories</title>

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
                    <li><a href="/admin/categories.php" class="active">Categories</a></li>
                    <li><a href="/admin/products.php">Products</a></li>
                    <li><a href="/admin/reviews.php">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Categories</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="/admin/logout.php">Logout</a>
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
                        <h3>Edit Category</h3>
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
                                <input type="text" id="edit_slug" name="slug" value="<?php echo htmlspecialchars($edit_category['slug']); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="edit_description">Description</label>
                                <textarea id="edit_description" name="description"><?php echo htmlspecialchars($edit_category['description'] ?? ''); ?></textarea>
                            </div>

                            <div style="display: flex; gap: 0.5rem;">
                                <button type="submit" class="btn">Update Category</button>
                                <a href="/admin/categories.php" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="form-section">
                        <h3>Create New Category</h3>
                        <form method="POST">
                            <input type="hidden" name="action" value="create">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" name="name" required>
                            </div>

                            <div class="form-group">
                                <label for="slug">Slug</label>
                                <input type="text" id="slug" name="slug" required>
                            </div>

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea id="description" name="description"></textarea>
                            </div>

                            <button type="submit" class="btn">Create Category</button>
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
                                    <td><?php echo htmlspecialchars(substr($category['description'] ?? '', 0, 50)); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($category['created_at'])); ?></td>
                                    <td>
                                        <div class="action-buttons">
                                            <a href="/admin/categories.php?edit=<?php echo urlencode($category['id']); ?>" class="btn-primary">Edit</a>
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($category['id']); ?>">
                                                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this category?')">Delete</button>
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
</body>
</html>
