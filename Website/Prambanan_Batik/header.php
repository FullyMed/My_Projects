<?php

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? escape($page_title) . ' - ' . SITE_NAME : SITE_NAME; ?></title>
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <?php if (is_preview_mode()): ?>
        <div class="preview-banner">
            ⚠ Preview Mode (Database unavailable) - Sample data displayed
        </div>
    <?php endif; ?>

    <header class="header">
        <div class="header-content">
            <div class="header-left">
                <div class="logo-section">
                    <h1 class="logo">
                        <a href="/"><?php echo SITE_NAME; ?></a>
                    </h1>
                    <p class="tagline"><?php echo SITE_TAGLINE; ?></p>
                </div>
            </div>
            <nav class="nav">
                <ul>
                    <li><a href="/" class="<?php echo $current_page === 'index.php' ? 'active' : ''; ?>">Home</a></li>
                    <li><a href="/products.php" class="<?php echo $current_page === 'products.php' ? 'active' : ''; ?>">Batik Collection</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="main-content">
