import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const TermsPage: React.FC = () => {
  usePageMeta(
    'Terms of Use | JourneySet',
    'The terms and conditions that govern your use of JourneySet.'
  );

  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="September 21, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or otherwise using JourneySet (the "Service"), you agree to be
          bound by these Terms of Use. If you do not agree to these terms, please do not use the
          Service.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          JourneySet is a personal productivity planner that lets you schedule weekly tasks, track
          goals, and manage calendar events. The Service is provided on an as-is basis and may be
          changed, suspended, or discontinued at any time without notice.
        </p>
      </section>

      <section>
        <h2>3. Accounts and Eligibility</h2>
        <p>
          You need an account to use most features of the Service. You are responsible for
          maintaining the confidentiality of your login credentials and for all activity that
          occurs under your account. Provide accurate information when you register, and let us
          know if you believe your account has been accessed without authorization.
        </p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
          <li>Attempt to gain unauthorized access to another user's account or data.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li>Reverse engineer, scrape, or misuse the Service beyond normal, personal use.</li>
        </ul>
      </section>

      <section>
        <h2>5. Your Content</h2>
        <p>
          You retain ownership of the tasks, goals, events, and other content you create in
          JourneySet ("Your Content"). You grant us the limited right to store and process Your
          Content solely to operate and provide the Service to you. You are solely responsible for
          Your Content and for keeping backups if that matters to you — use the built-in{' '}
          <strong>Export &amp; Print</strong> feature at any time.
        </p>
      </section>

      <section>
        <h2>6. Third-Party Services</h2>
        <p>
          JourneySet relies on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>{' '}
          for authentication and data storage. Your use of the Service is also subject to
          Supabase's own terms and privacy practices for the infrastructure it provides on our
          behalf.
        </p>
      </section>

      <section>
        <h2>7. Service Availability &amp; Changes</h2>
        <p>
          We aim to keep the Service available and reliable, but we don't guarantee uninterrupted
          access. Features, design, and functionality may change over time as JourneySet evolves.
        </p>
      </section>

      <section>
        <h2>8. Termination</h2>
        <p>
          You may stop using the Service and delete your account at any time. We may suspend or
          terminate access to the Service for accounts that violate these Terms or the Acceptable
          Use section above.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available," without warranties of any kind,
          express or implied, including but not limited to fitness for a particular purpose,
          reliability, or availability.
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, JourneySet and its developer shall not be liable
          for any indirect, incidental, or consequential damages arising from your use of, or
          inability to use, the Service.
        </p>
      </section>

      <section>
        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be reflected by
          updating the "Last updated" date above. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms can be raised via the project's{' '}
          <a href="https://github.com/FullyMed/My_Projects" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsPage;
