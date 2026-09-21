import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const PrivacyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy | JourneySet',
    'How JourneySet collects, stores, and protects your data.'
  );

  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="September 21, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains what information JourneySet collects, how it is used, and
          the choices you have. We collect only what's needed to run the app — your planner tasks,
          goals, and events are yours, and we don't sell your data.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>We collect the following categories of information:</p>
        <ul>
          <li><strong>Account information:</strong> the email address and display name you provide when you register.</li>
          <li><strong>Content you create:</strong> weekly planner tasks, goals and their progress, and calendar events — including titles, descriptions, dates, times, and categories you enter.</li>
          <li><strong>Local device preferences:</strong> your selected theme, compact-mode setting, and a local cache of your data, stored in your browser's <code>localStorage</code> so the app still works and loads quickly when the network is unavailable.</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information above solely to:</p>
        <ul>
          <li>Authenticate you and keep your account secure.</li>
          <li>Store and sync your planner, goals, and calendar data across your sessions and devices.</li>
          <li>Display your data back to you — nothing more.</li>
        </ul>
        <p>We do not use your data for advertising, and we do not sell or rent it to third parties.</p>
      </section>

      <section>
        <h2>4. Where Your Data Is Stored</h2>
        <p>
          Your data is stored in a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>{' '}
          -hosted PostgreSQL database. Every table enforces Row Level Security, so the database
          itself only ever returns rows where <code>auth.uid() = user_id</code> — meaning your data
          is isolated at the database layer, not just in the app's code. A read-only local cache of
          your own data is also kept in your browser's <code>localStorage</code> to support offline
          use.
        </p>
      </section>

      <section>
        <h2>5. Cookies &amp; Local Storage</h2>
        <p>
          JourneySet does not use advertising or tracking cookies. It uses your browser's{' '}
          <code>localStorage</code> for functional purposes only: remembering your theme and
          compact-mode preference, and caching your own planner/goals/events data for offline
          resilience. Your Supabase session is also maintained via browser storage so you stay
          signed in between visits.
        </p>
      </section>

      <section>
        <h2>6. Data Sharing</h2>
        <p>
          We don't share your personal data with third parties, except with{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>,
          our infrastructure provider, which hosts the database and authentication system that
          make the Service work. We do not share your data for marketing purposes.
        </p>
      </section>

      <section>
        <h2>7. Data Retention &amp; Deletion</h2>
        <p>
          We retain your account and content data for as long as your account is active. You can
          delete individual tasks, goals, and events at any time from within the app. You can also
          clear your local cache from <strong>Settings → Reset all local data</strong>. To request
          full deletion of your account and associated data, reach out via the channel in the
          Contact section below.
        </p>
      </section>

      <section>
        <h2>8. Your Rights &amp; Choices</h2>
        <p>You can, at any time:</p>
        <ul>
          <li>View and edit any data you've entered directly within the app.</li>
          <li>Export a copy of your planner, goals, or calendar using the <strong>Export &amp; Print</strong> feature.</li>
          <li>Delete individual items, or clear your local cache from Settings.</li>
          <li>Sign out, which ends your session on this device.</li>
          <li>Request deletion of your account and all associated data.</li>
        </ul>
      </section>

      <section>
        <h2>9. Children's Privacy</h2>
        <p>
          JourneySet is not directed at children under 13, and we do not knowingly collect
          information from children under that age.
        </p>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected
          by updating the "Last updated" date above.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy, or requests to access or delete your data, can be
          raised via the project's{' '}
          <a href="https://github.com/FullyMed/My_Projects" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
