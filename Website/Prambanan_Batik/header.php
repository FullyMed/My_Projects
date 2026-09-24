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
    <meta name="description" content="<?php echo escape($meta_description ?? DEFAULT_META_DESCRIPTION); ?>">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo SITE_PATH; ?>/assets/favicon/apple-touch-icon.png">
    <link rel="mask-icon" href="<?php echo SITE_PATH; ?>/assets/favicon/safari-pinned-tab.svg" color="#c4872c">
    <link rel="manifest" href="<?php echo SITE_PATH; ?>/assets/favicon/site.webmanifest">
    <meta name="theme-color" content="#2a1a0e">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo SITE_PATH; ?>/assets/css/styles.css">
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
                        <a href="<?php echo SITE_PATH; ?>/"><?php echo SITE_NAME; ?></a>
                    </h1>
                    <p class="tagline"><?php echo SITE_TAGLINE; ?></p>
                </div>
            </div>
            <nav class="nav">
                <ul>
                    <li><a href="<?php echo SITE_PATH; ?>/" class="<?php echo $current_page === 'index.php' ? 'active' : ''; ?>">Home</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/products.php" class="<?php echo $current_page === 'products.php' ? 'active' : ''; ?>">Batik Collection</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="main-content">
