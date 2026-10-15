<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Terms of Use';
$meta_description = 'The rules for using Prambanan Batik: how our Shopee and Tokopedia links work, how we handle customer reviews, and who to contact.';
$canonical_url = BASE_URL . '/terms.php';

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="legal-page">
        <div class="container legal-content">
            <span class="hero-eyebrow">Legal</span>
            <h2>Terms of Use</h2>
            <p class="legal-updated">Last updated: October 2026</p>

            <p>These terms cover your use of <?php echo escape(SITE_NAME); ?>. By using the site you agree to them. If you don't agree, please don't use the site.</p>

            <h3>1. What this site is</h3>
            <p><?php echo escape(SITE_NAME); ?> is a catalog of Indonesian batik with customer reviews. We don't take orders or payments on this site. When you click a buy button, we send you to a marketplace such as Shopee or Tokopedia, and you buy the product there.</p>

            <h3>2. Marketplace links</h3>
            <p>Once you leave <?php echo escape(SITE_NAME); ?>, the marketplace's own terms and the seller's policies cover your purchase, including payment, shipping, returns and any disputes. We don't control those marketplaces, and we aren't responsible for their prices, stock, deliveries or how their sellers behave.</p>

            <h3>3. Customer reviews</h3>
            <p>Customers send us some of the reviews on this site, and we collect others from other places. If you send us a review, you confirm that it's your own honest opinion and that it isn't defamatory, unlawful or misleading. You also give us a free, non-exclusive licence to show it, shorten it or tidy it up for clarity, or remove it whenever we choose. We don't check every review, and a review doesn't necessarily reflect our own view.</p>

            <h3>4. Our name and content</h3>
            <p>We own the <?php echo escape(SITE_NAME); ?> name, logo, site design and the text we wrote, or we use them with permission. Some product photos and descriptions may belong to the brands or sellers who made them. Please don't copy, republish or use our branding without our written permission.</p>

            <h3>5. No warranties</h3>
            <p>We provide this site and its content "as is", without any warranty, express or implied. We try to keep product details, prices and ratings correct and up to date, but we can't promise that everything on the site is current or free of mistakes.</p>

            <h3>6. Limits on our liability</h3>
            <p>As far as the law allows, <?php echo escape(SITE_NAME); ?> isn't liable for any indirect, incidental or consequential damage that comes from your use of this site, or from a purchase you make on a marketplace you reached through our links.</p>

            <h3>7. Changes to these terms</h3>
            <p>We may update these terms. If you keep using the site after we post a change, you accept the new terms. The date at the top of this page shows when we last changed them.</p>

            <h3>8. Which law applies</h3>
            <p>The laws of the Republic of Indonesia govern these terms, without regard to conflict-of-law rules.</p>

            <h3>9. Contact us</h3>
            <p>If you have a question about these terms, email us at <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a>.</p>

            <p class="legal-see-also">See also our <a href="<?php echo SITE_PATH; ?>/privacy.php">Privacy Policy</a>.</p>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
