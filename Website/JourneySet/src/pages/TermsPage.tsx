import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const TermsPage: React.FC = () => {
  usePageMeta(
    'Terms of Use | JourneySet',
    'The rules for using JourneySet, in plain English.'
  );

  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="October 16, 2026">
      <section>
        <h2>1. Accepting these terms</h2>
        <p>
          By creating an account or using JourneySet (the "Service"), you agree to these Terms of
          Use. If you don't agree, please don't use the Service.
        </p>
      </section>

      <section>
        <h2>2. What JourneySet is</h2>
        <p>
          JourneySet is a personal planner for weekly tasks, goals and calendar events. We provide
          it as it is, and we may change, pause or shut it down at any time without notice.
        </p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <p>
          You need an account for most features. Keep your password to yourself: you're
          responsible for everything that happens under your account. Give accurate details when
          you sign up, and tell us if you think someone else has got into your account.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for anything illegal, or in a way that breaks any law that applies to you.</li>
          <li>Try to get into another user's account or data.</li>
          <li>Interfere with the Service or disrupt how it runs.</li>
          <li>Reverse engineer or scrape the Service, or use it beyond normal personal use.</li>
        </ul>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          The tasks, goals, events and anything else you add to JourneySet ("Your Content") stay
          yours. You let us store and process Your Content only so we can run the Service for you.
          You're responsible for Your Content and for keeping your own copies if they matter to
          you. You can print any of it, or save it as a PDF, with the <strong>Export</strong>{' '}
          button at any time.
        </p>
      </section>

      <section>
        <h2>6. Services we rely on</h2>
        <p>
          JourneySet uses <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>{' '}
          for sign-in and data storage. Supabase's own terms and privacy practices also apply to
          the parts of the Service it runs for us.
        </p>
      </section>

      <section>
        <h2>7. Availability and changes</h2>
        <p>
          We try to keep the Service running, but we can't promise it will always be available.
          Features and design may change over time.
        </p>
      </section>

      <section>
        <h2>8. Ending your account</h2>
        <p>
          You can stop using the Service and delete your account at any time from{' '}
          <strong>Settings → Delete account</strong>. We may suspend or close accounts that break
          these Terms or the Acceptable use section above.
        </p>
      </section>

      <section>
        <h2>9. No warranties</h2>
        <p>
          We provide the Service "as is" and "as available", without warranties of any kind,
          express or implied, including (but not limited to) fitness for a particular purpose,
          reliability or availability.
        </p>
      </section>

      <section>
        <h2>10. Limits on liability</h2>
        <p>
          As far as the law allows, JourneySet and its developer aren't liable for any indirect,
          incidental or consequential damages that come from using the Service or from not being
          able to use it.
        </p>
      </section>

      <section>
        <h2>11. Changes to these Terms</h2>
        <p>
          We may update these Terms. When we make a material change, we'll update the "Last
          updated" date above. If you keep using the Service after a change takes effect, you
          accept the new Terms.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          You can send questions about these Terms through the project's{' '}
          <a href="https://github.com/FullyMed/My_Projects" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsPage;
