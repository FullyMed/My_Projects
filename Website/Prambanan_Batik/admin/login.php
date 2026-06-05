<?php

require_once __DIR__ . '/../config.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

$error = '';
$success = '';

if (isAdminLoggedIn()) {
    header('Location: /admin/index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Email and password are required';
    } else {
        $result = loginAdmin($pdo, $email, $password);
        if ($result['success']) {
            header('Location: /admin/index.php');
            exit;
        } else {
            $error = $result['message'];
        }
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/admin.css">
    <style>
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(160deg, #1e0f05 0%, #3a1e0a 55%, #1e0f05 100%);
            padding: 1rem;
        }
        .login-box {
            background: #fffcf8;
            border-radius: 1rem;
            border: 1px solid #ecddd0;
            box-shadow: 0 28px 56px rgba(42,26,14,0.28);
            padding: 2.5rem;
            width: 100%;
            max-width: 400px;
        }
        .login-brand {
            text-align: center;
            margin-bottom: 2rem;
        }
        .login-brand h1 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 1.875rem;
            font-weight: 500;
            color: #2a1a0e;
            margin: 0 0 0.25rem;
        }
        .login-brand p {
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #c4872c;
            font-weight: 600;
            margin: 0;
        }
        .form-group {
            margin-bottom: 1.25rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.375rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: #4a3a2a;
        }
        .form-group input {
            width: 100%;
            padding: 0.65rem 0.875rem;
            border: 1.5px solid #ecddd0;
            border-radius: 0.5rem;
            font-size: 0.9375rem;
            font-family: inherit;
            background: #fff;
            color: #2a1a0e;
            transition: border-color 200ms, box-shadow 200ms;
        }
        .form-group input:focus {
            outline: none;
            border-color: #c4872c;
            box-shadow: 0 0 0 3px rgba(196,135,44,0.14);
        }
        .btn-login {
            width: 100%;
            padding: 0.75rem;
            background: #c4872c;
            color: white;
            border: none;
            border-radius: 9999px;
            font-family: inherit;
            font-weight: 700;
            font-size: 0.8125rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms, box-shadow 200ms;
            margin-top: 0.5rem;
        }
        .btn-login:hover {
            background: #ae7520;
            box-shadow: 0 4px 16px rgba(196,135,44,0.35);
        }
        .error-message {
            background: #fdf0ee;
            color: #7a2016;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.25rem;
            border-left: 3px solid #b03626;
            font-size: 0.875rem;
        }
        .success-message {
            background: #f0faf3;
            color: #2d5a3d;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.25rem;
            border-left: 3px solid #3a6b49;
            font-size: 0.875rem;
        }
        @media (max-width: 480px) {
            .login-box { padding: 1.75rem 1.25rem; }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <div class="login-brand">
                <h1>Prambanan Batik</h1>
                <p>Admin Panel</p>
            </div>

            <?php if ($error): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="admin@example.com"
                        required
                        autofocus
                    >
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                    >
                </div>

                <button type="submit" class="btn-login">Login</button>
            </form>
        </div>
    </div>
</body>
</html>
