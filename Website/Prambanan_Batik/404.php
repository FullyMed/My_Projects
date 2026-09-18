<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

http_response_code(404);

$page_title = 'Page Not Found';

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="error-page">
        <div class="container">
            <span class="error-code">404</span>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist or may have been moved.</p>
            <div class="error-actions">
                <a href="<?php echo SITE_PATH; ?>/" class="btn btn-primary">Back to Home</a>
                <a href="<?php echo SITE_PATH; ?>/products.php" class="btn btn-secondary">Browse Collection</a>
            </div>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
