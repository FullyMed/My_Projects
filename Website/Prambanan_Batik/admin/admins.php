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

        if ($action === 'create') {
            $email    = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $confirm  = $_POST['confirm'] ?? '';

            if (empty($email) || empty($password)) {
                $error = 'Email and password are required';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'Invalid email address';
            } elseif (strlen($password) < 8) {
                $error = 'Password must be at least 8 characters';
            } elseif ($password !== $confirm) {
                $error = 'Passwords do not match';
            } else {
                try {
                    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
                    $stmt = $pdo->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, NOW())');
                    $stmt->execute([$email, $hash]);
                    $message = 'Admin account created successfully';
                } catch (PDOException $e) {
                    if ($e->getCode() === '23000') {
                        $error = 'That email is already registered as an admin';
                    } else {
                        $error = 'Failed to create admin: ' . $e->getMessage();
                    }
                }
            }

        } elseif ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);

            if ($id === (int)$admin['id']) {
                $error = 'You cannot delete your own account';
            } elseif ($id < 1) {
                $error = 'Invalid admin ID';
            } else {
                // Prevent deleting the last admin
                $countStmt = $pdo->prepare('SELECT COUNT(*) FROM admin_users');
                $countStmt->execute();
                $total = (int)$countStmt->fetchColumn();

                if ($total <= 1) {
                    $error = 'Cannot delete the last admin account';
                } else {
                    try {
                        $stmt = $pdo->prepare('DELETE FROM admin_users WHERE id = ?');
                        $stmt->execute([$id]);
                        $message = 'Admin account deleted';
                    } catch (Exception $e) {
                        $error = 'Failed to delete admin: ' . $e->getMessage();
                    }
                }
            }

        } elseif ($action === 'change_password') {
            $id       = (int)($_POST['id'] ?? 0);
            $password = $_POST['new_password'] ?? '';
            $confirm  = $_POST['confirm_password'] ?? '';

            if ($id < 1) {
                $error = 'Invalid admin ID';
            } elseif (strlen($password) < 8) {
                $error = 'Password must be at least 8 characters';
            } elseif ($password !== $confirm) {
                $error = 'Passwords do not match';
            } else {
                try {
                    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
                    $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
                    $stmt->execute([$hash, $id]);
                    $message = 'Password updated successfully';
                } catch (Exception $e) {
                    $error = 'Failed to update password: ' . $e->getMessage();
                }
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT id, email, created_at FROM admin_users ORDER BY created_at ASC');
$stmt->execute();
$admins = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Admins</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo SITE_PATH; ?>/admin/admin.css">
    <style>
        .admin-card {
            background: #fff;
            border: 1px solid #ecddd0;
            border-radius: 0.75rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .admin-card.is-self {
            border-color: #c4872c;
            background: #fffbf5;
        }
        .admin-info { display: flex; align-items: center; gap: 0.75rem; }
        .admin-avatar {
            width: 2.5rem; height: 2.5rem;
            background: #c4872c;
            color: #fff;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 1rem;
            flex-shrink: 0;
        }
        .admin-email { font-weight: 600; color: #2a1a0e; font-size: 0.9375rem; }
        .admin-meta  { font-size: 0.8125rem; color: #8c7560; margin-top: 0.1rem; }
        .self-badge {
            font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
            text-transform: uppercase; background: #c4872c; color: #fff;
            padding: 0.15rem 0.5rem; border-radius: 9999px; margin-left: 0.4rem;
        }
        .admin-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

        /* Inline password change form (hidden by default) */
        .pw-form {
            display: none;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #ecddd0;
            width: 100%;
        }
        .pw-form.open { display: block; }
        .pw-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end; }
        .pw-row .form-group { flex: 1; min-width: 160px; margin-bottom: 0; }
        .pw-row .form-group label { font-size: 0.8rem; }
        .pw-row .form-group input { margin-bottom: 0; }
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
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php" class="active">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Admins</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>
                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <!-- Existing admins -->
                <div class="page-header">
                    <h2 class="page-title">Admin Accounts</h2>
                </div>

                <div style="margin-bottom: 2rem;">
                    <?php foreach ($admins as $a):
                        $isSelf = (int)$a['id'] === (int)$admin['id'];
                        $initial = strtoupper(substr($a['email'], 0, 1));
                    ?>
                    <div class="admin-card <?php echo $isSelf ? 'is-self' : ''; ?>">
                        <div style="width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
                            <div class="admin-info">
                                <div class="admin-avatar"><?php echo htmlspecialchars($initial); ?></div>
                                <div>
                                    <div class="admin-email">
                                        <?php echo htmlspecialchars($a['email']); ?>
                                        <?php if ($isSelf): ?><span class="self-badge">You</span><?php endif; ?>
                                    </div>
                                    <div class="admin-meta">Added <?php echo date('M d, Y', strtotime($a['created_at'])); ?></div>
                                </div>
                            </div>

                            <div class="admin-actions">
                                <button type="button" class="btn" onclick="togglePwForm(<?php echo $a['id']; ?>)">
                                    Change Password
                                </button>
                                <?php if (!$isSelf): ?>
                                <form method="POST" style="display:inline;">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $a['id']; ?>">
                                    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                                    <button type="submit" class="btn btn-danger"
                                            onclick="return confirm('Delete admin <?php echo htmlspecialchars($a['email']); ?>?')">
                                        Delete
                                    </button>
                                </form>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Inline password change form -->
                        <form method="POST" class="pw-form" id="pw-form-<?php echo $a['id']; ?>">
                            <input type="hidden" name="action" value="change_password">
                            <input type="hidden" name="id" value="<?php echo $a['id']; ?>">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                            <div class="pw-row">
                                <div class="form-group">
                                    <label>New Password (min. 8 chars)</label>
                                    <input type="password" name="new_password" required minlength="8">
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirm_password" required minlength="8">
                                </div>
                                <div>
                                    <button type="submit" class="btn">Save</button>
                                    <button type="button" class="btn btn-secondary" onclick="togglePwForm(<?php echo $a['id']; ?>)">Cancel</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <?php endforeach; ?>
                </div>

                <!-- Add new admin -->
                <div class="form-section">
                    <h3>Add New Admin</h3>
                    <form method="POST">
                        <input type="hidden" name="action" value="create">
                        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="email">Email <span class="required">*</span></label>
                                <input type="email" id="email" name="email"
                                       value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                                       placeholder="newadmin@example.com" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Password <span class="required">*</span></label>
                                <input type="password" id="password" name="password"
                                       placeholder="Min. 8 characters" required minlength="8">
                            </div>

                            <div class="form-group">
                                <label for="confirm">Confirm Password <span class="required">*</span></label>
                                <input type="password" id="confirm" name="confirm"
                                       placeholder="Repeat password" required minlength="8">
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn">Create Admin</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script>
        function togglePwForm(id) {
            const form = document.getElementById('pw-form-' + id);
            form.classList.toggle('open');
        }
    </script>
</body>
</html>
