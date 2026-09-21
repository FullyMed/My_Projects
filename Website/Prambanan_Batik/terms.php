<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Terms of Use';
$meta_description = 'The terms that govern your use of Prambanan Batik, including our partner marketplace links and customer review guidelines.';

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="legal-page">
        <div class="container legal-content">
            <span class="hero-eyebrow">Legal</span>
            <h2>Terms of Use</h2>
            <p class="legal-updated">Last updated: <?php echo date('F Y'); ?></p>

            <p>Welcome to <?php echo escape(SITE_NAME); ?>. By accessing or using this website, you agree to the following terms. If you do not agree with any part of these terms, please do not use the site.</p>

            <h3>1. About This Site</h3>
            <p><?php echo escape(SITE_NAME); ?> is a product catalog and review website for authentic Indonesian batik. We showcase products and customer reviews, but we do not sell products directly or process payments ourselves. When you choose to buy a product, we redirect you to a third-party marketplace (such as Shopee or Tokopedia) where the actual purchase takes place.</p>

            <h3>2. Third-Party Marketplace Links</h3>
            <p>Links from our product pages to Shopee, Tokopedia, or other marketplaces are provided for your convenience. Once you leave <?php echo escape(SITE_NAME); ?>, your purchase, payment, shipping, returns, and any disputes are governed entirely by that marketplace's own terms of service and the individual seller's policies. We do not control, and are not responsible for, pricing, product availability, order fulfillment, or the conduct of third-party sellers.</p>

            <h3>3. Customer Reviews</h3>
            <p>Reviews displayed on this site may be submitted by customers or curated from other sources. By submitting a review, you confirm that the content is your own genuine opinion, is not defamatory, unlawful, or misleading, and you grant us a non-exclusive, royalty-free license to display, edit for length or clarity, or remove it at our discretion. We do not verify the accuracy of every review and reviews do not necessarily reflect our own views.</p>

            <h3>4. Intellectual Property</h3>
            <p>The <?php echo escape(SITE_NAME); ?> name, logo, site design, and original written content are our property or used with permission. Product photos and descriptions may belong to their respective brands or sellers. You may not reproduce, redistribute, or use our branding without prior written permission.</p>

            <h3>5. No Warranties</h3>
            <p>This site and its content are provided "as is," without warranties of any kind, express or implied. We do our best to keep product information, pricing, and ratings accurate and up to date, but we cannot guarantee that everything displayed is always current or error-free.</p>

            <h3>6. Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, <?php echo escape(SITE_NAME); ?> is not liable for any indirect, incidental, or consequential damages arising from your use of this site or from any transaction completed on a third-party marketplace reached through our links.</p>

            <h3>7. Changes to These Terms</h3>
            <p>We may update these Terms of Use from time to time. Continued use of the site after changes are posted means you accept the revised terms. We encourage you to review this page periodically.</p>

            <h3>8. Governing Law</h3>
            <p>These terms are governed by the laws of the Republic of Indonesia, without regard to conflict-of-law principles.</p>

            <h3>9. Contact Us</h3>
            <p>Questions about these terms can be sent to <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a>.</p>

            <p class="legal-see-also">See also our <a href="<?php echo SITE_PATH; ?>/privacy.php">Privacy Policy</a>.</p>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
