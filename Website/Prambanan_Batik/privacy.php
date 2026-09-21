<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Privacy Policy';
$meta_description = 'How Prambanan Batik collects and uses information, including review submissions, outbound marketplace click tracking, and cookies.';

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="legal-page">
        <div class="container legal-content">
            <span class="hero-eyebrow">Legal</span>
            <h2>Privacy Policy</h2>
            <p class="legal-updated">Last updated: <?php echo date('F Y'); ?></p>

            <p>This policy explains what information <?php echo escape(SITE_NAME); ?> collects, how we use it, and the choices you have. We collect only what's needed to run a product catalog and review site — we do not sell your data.</p>

            <h3>1. Information We Collect</h3>
            <p><strong>Reviews you submit.</strong> If you leave a review, we store the reviewer name, an optional email address, your rating, and the review text. Your email is never shown publicly and is used only if we need to follow up about your review.</p>
            <p><strong>Outbound click data.</strong> When you click a "Buy" link to Shopee, Tokopedia, or another marketplace, we log which product and platform you clicked, along with your IP address, browser user agent, and the page you came from. This is used in aggregate to understand which products and marketplaces are popular — it is not linked to any account, since the public site has no customer accounts.</p>
            <p><strong>Cookies.</strong> We set one strictly necessary session cookie to keep the site working correctly (for example, to keep an admin signed in). It is <code>HttpOnly</code> and marked <code>SameSite=Lax</code>. We do not use advertising or third-party tracking cookies.</p>
            <p><strong>Admin accounts.</strong> Store staff who manage this catalog have their own login (email + a securely hashed password). This is separate from anything collected about site visitors.</p>

            <h3>2. How We Use Information</h3>
            <p>We use the information above to: display and moderate reviews, understand which products and marketplace links are getting engagement, keep the admin panel secure (including rate-limiting repeated failed logins), and diagnose technical issues.</p>

            <h3>3. Third-Party Marketplaces</h3>
            <p>Once you follow a link to Shopee, Tokopedia, or another marketplace, that site's own privacy policy applies. We don't receive your payment details, shipping address, or order history from those marketplaces — the transaction happens entirely on their platform.</p>

            <h3>4. Data Retention</h3>
            <p>Failed admin login attempts (used only for brute-force protection) are automatically deleted after 24 hours. Reviews and outbound click logs are kept for as long as the associated product listing exists, or until you ask us to remove a review you submitted.</p>

            <h3>5. Data Security</h3>
            <p>Admin passwords are hashed with bcrypt and never stored in plain text. All database queries use parameterized statements, admin forms are protected against CSRF, and admin sessions time out automatically after 30 minutes of inactivity.</p>

            <h3>6. Your Choices</h3>
            <p>If you'd like a review you submitted edited or removed, or have questions about data we hold, contact us at <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a> and we'll respond as soon as we can.</p>

            <h3>7. Children's Privacy</h3>
            <p>This site is not directed at children, and we do not knowingly collect personal information from children.</p>

            <h3>8. Changes to This Policy</h3>
            <p>We may update this policy as the site evolves. The "last updated" date at the top of this page reflects the most recent revision.</p>

            <h3>9. Contact Us</h3>
            <p>Privacy questions can be sent to <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a>.</p>

            <p class="legal-see-also">See also our <a href="<?php echo SITE_PATH; ?>/terms.php">Terms of Use</a>.</p>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
