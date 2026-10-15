<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

http_response_code(404);

$page_title = 'Page not found';
$meta_description = "We couldn't find this page at Prambanan Batik. Go back to the home page or browse the batik collection.";

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="error-page">
        <div class="container">
            <span class="error-code">404</span>
            <h2>Page not found</h2>
            <p>We couldn't find that page. The link may be old, or the product may no longer be listed.</p>
            <div class="error-actions">
                <a href="<?php echo SITE_PATH; ?>/" class="btn btn-primary">Go to the home page</a>
                <a href="<?php echo SITE_PATH; ?>/products.php" class="btn btn-secondary">Browse batik</a>
            </div>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
