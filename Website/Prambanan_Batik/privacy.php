<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$page_title = 'Privacy Policy';
$meta_description = 'What Prambanan Batik records about visitors (customer reviews, buy-button clicks and one session cookie), how long we keep it, and how to ask us to remove it.';
$canonical_url = BASE_URL . '/privacy.php';

?>
<?php include __DIR__ . '/header.php'; ?>

    <section class="legal-page">
        <div class="container legal-content">
            <span class="hero-eyebrow">Legal</span>
            <h2>Privacy Policy</h2>
            <p class="legal-updated">Last updated: October 2026</p>

            <p>This page explains what <?php echo escape(SITE_NAME); ?> collects, what we do with it, and what you can ask us to change. We only collect what we need to run a catalog with reviews, and we don't sell your data.</p>

            <h3>1. What we collect</h3>
            <p><strong>Customer reviews.</strong> Our staff add the reviews you see on product pages, using feedback customers send us (by message or email, for example) or reviews from marketplaces. You can't post a review on the site yourself. For each review we store the reviewer's name, an email address if we have one, the rating, a title if there is one, and the review text. We never show the email address, and we only use it if we need to ask about that review.</p>
            <p><strong>Buy-button clicks.</strong> When you click a button that takes you to Shopee, Tokopedia or another marketplace, we record which product and marketplace you picked, your IP address, your browser's user agent and the page you came from. We look at these records in bulk to see which products and marketplaces people use. The public site has no customer accounts, so we can't link a click to an account.</p>
            <p><strong>Cookies.</strong> We set one session cookie that the site needs to work, for example to keep a staff member signed in to the admin panel. It's <code>HttpOnly</code> and <code>SameSite=Lax</code>. We don't use advertising or third-party tracking cookies.</p>
            <p><strong>Other services our pages use.</strong> Our pages load fonts from Google Fonts, and some product photos come from outside image hosts. When your browser fetches those files, those services see your IP address and browser details, as they would for any website.</p>
            <p><strong>Staff accounts.</strong> The people who manage this catalog sign in with an email address and a password, which we store only as a secure hash. We keep these accounts separate from anything we record about visitors.</p>

            <h3>2. How we use it</h3>
            <p>We use this information to show and moderate reviews, to see which products and marketplace links people click, to keep the admin panel secure (for example, by blocking repeated failed logins), and to fix technical problems.</p>

            <h3>3. Marketplaces</h3>
            <p>Once you follow a link to Shopee, Tokopedia or another marketplace, that marketplace's privacy policy applies. You pay and give your delivery address on their site, and they don't send us your payment details, address or order history.</p>

            <h3>4. How long we keep it</h3>
            <p>We only use records of failed admin logins to block password guessing, and we clear them out once they're more than a day old. We keep reviews and click records for as long as the product they belong to is listed, or until you ask us to remove a review of yours.</p>

            <h3>5. How we protect it</h3>
            <p>We store staff passwords as bcrypt hashes, never as plain text. Every database query uses parameterized statements, the admin forms have CSRF protection, and an admin session ends after 30 minutes without activity.</p>

            <h3>6. Your choices</h3>
            <p>If you'd like us to edit or remove a review of yours, or you have a question about the data we hold, email us at <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a> and we'll reply as soon as we can.</p>

            <h3>7. Children</h3>
            <p>This site isn't aimed at children, and we don't knowingly collect personal information from children.</p>

            <h3>8. Changes to this policy</h3>
            <p>We may update this policy when the site changes. The date at the top of this page shows when we last changed it.</p>

            <h3>9. Contact us</h3>
            <p>Send privacy questions to <a href="mailto:<?php echo escape(CONTACT_EMAIL); ?>"><?php echo escape(CONTACT_EMAIL); ?></a>.</p>

            <p class="legal-see-also">See also our <a href="<?php echo SITE_PATH; ?>/terms.php">Terms of Use</a>.</p>
        </div>
    </section>

<?php include __DIR__ . '/footer.php'; ?>
