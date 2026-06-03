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

        .btn-danger {
            background: #c53030;
        }

        .btn-danger:hover {
            background: #e53e3e;
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

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #8b6f47;
            box-shadow: 0 0 0 3px rgba(139, 111, 71, 0.1);
        }

        .table-section {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f5f5f5;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: #2d3436;
            border-bottom: 1px solid #e0e0e0;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid #e0e0e0;
        }

        tr:hover {
            background: #fafafa;
        }

        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .action-buttons button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }

        .hidden-form {
            display: none;
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

            table {
                font-size: 0.875rem;
            }

            th, td {
                padding: 0.75rem;
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

                <div class="form-section">
                    <h3>Create New Category</h3>
                    <form method="POST">
                        <input type="hidden" name="action" value="create">

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
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($category['id']); ?>">
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
