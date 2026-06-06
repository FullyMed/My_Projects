<?php
// ONE-TIME ADMIN SETUP — DELETE THIS FILE AFTER USE

require_once __DIR__ . '/config.php';
$pdo = require __DIR__ . '/db_connect.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Email and password are required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email address.';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } elseif ($pdo === null) {
        $error = 'Database connection failed. Check DB credentials in config.php.';
    } else {
        try {
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $pdo->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, NOW())');
            $stmt->execute([$email, $hash]);
            $message = 'Admin account created! <a href="/Prambanan_Batik/admin/login.php">Go to login</a> — then DELETE this file.';
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                $error = 'That email is already registered as an admin.';
            } else {
                $error = 'Database error: ' . $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Create Admin — Prambanan Batik</title>
<style>
  body { font-family: sans-serif; background: #1e0f05; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .box { background: #fff; border-radius: 1rem; padding: 2rem; width: 100%; max-width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,.4); }
  h1 { margin: 0 0 .25rem; font-size: 1.4rem; color: #2a1a0e; }
  .warn { background: #fff8e1; border-left: 4px solid #f59e0b; padding: .6rem .9rem; border-radius: .4rem; font-size: .85rem; color: #7c4a00; margin-bottom: 1.25rem; }
  label { display: block; font-size: .8rem; font-weight: 600; color: #4a3a2a; margin-bottom: .3rem; }
  input { width: 100%; box-sizing: border-box; padding: .6rem .8rem; border: 1.5px solid #ddd; border-radius: .5rem; font-size: .95rem; margin-bottom: 1rem; }
  input:focus { outline: none; border-color: #c4872c; }
  button { width: 100%; padding: .7rem; background: #c4872c; color: #fff; border: none; border-radius: 9999px; font-weight: 700; font-size: .85rem; cursor: pointer; letter-spacing: .05em; text-transform: uppercase; }
  button:hover { background: #ae7520; }
  .error { background: #fdf0ee; color: #7a2016; padding: .7rem 1rem; border-radius: .4rem; margin-bottom: 1rem; border-left: 3px solid #b03626; font-size: .875rem; }
  .success { background: #f0faf3; color: #2d5a3d; padding: .7rem 1rem; border-radius: .4rem; margin-bottom: 1rem; border-left: 3px solid #3a6b49; font-size: .875rem; }
  .success a { color: #2d5a3d; font-weight: bold; }
</style>
</head>
<body>
<div class="box">
  <h1>Create Admin Account</h1>
  <div class="warn">⚠ Delete <strong>create_admin.php</strong> from your server after use.</div>

  <?php if ($error): ?>
    <div class="error"><?php echo htmlspecialchars($error); ?></div>
  <?php endif; ?>
  <?php if ($message): ?>
    <div class="success"><?php echo $message; ?></div>
  <?php else: ?>
  <form method="POST">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required autofocus>

    <label for="password">Password (min. 8 chars)</label>
    <input type="password" id="password" name="password" required>

    <label for="confirm">Confirm Password</label>
    <input type="password" id="confirm" name="confirm" required>

    <button type="submit">Create Admin</button>
  </form>
  <?php endif; ?>
</div>
</body>
</html>
