import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const PrivacyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy | JourneySet',
    'What JourneySet stores about you, where it keeps it, and how to delete it.'
  );

  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="October 16, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains what JourneySet collects, how we use it and the choices you
          have. We only collect what we need to run the app. Your tasks, goals and events are
          yours, and we don't sell your data.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <ul>
          <li>The email address and name you give when you sign up.</li>
          <li>The tasks, goals (with their progress) and calendar events you create, including the titles, descriptions, dates, times and categories you enter.</li>
          <li>On your own device: your theme, your compact mode setting and an offline copy of your data. Your browser keeps these in <code>localStorage</code> so the app still loads when you lose your connection.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use it</h2>
        <p>We use this information only to:</p>
        <ul>
          <li>Sign you in and keep your account secure.</li>
          <li>Store your planner, goals and calendar, and keep them in sync across your sessions and devices.</li>
          <li>Show your data back to you.</li>
        </ul>
        <p>We don't use your data for advertising, and we don't sell or rent it to anyone.</p>
      </section>

      <section>
        <h2>4. Where your data is stored</h2>
        <p>
          Your data lives in a PostgreSQL database hosted by{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>.
          Every table uses Row Level Security, so the database only returns rows where{' '}
          <code>auth.uid() = user_id</code>. The database itself keeps your data apart from other
          users' data, on top of the checks in the app's code. Your browser also keeps a read-only
          offline copy of your own data in <code>localStorage</code>.
        </p>
      </section>

      <section>
        <h2>5. Cookies and local storage</h2>
        <p>
          JourneySet doesn't use advertising or tracking cookies. It uses your browser's{' '}
          <code>localStorage</code> only to remember your theme and compact mode setting and to
          keep the offline copy of your planner, goals and events. Supabase also keeps your
          sign-in session in browser storage, so you stay signed in between visits.
        </p>
      </section>

      <section>
        <h2>6. Who we share data with</h2>
        <p>
          We don't share your personal data with anyone except{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>,
          which hosts the database and the sign-in system that run the Service. We don't share
          your data for marketing.
        </p>
      </section>

      <section>
        <h2>7. How long we keep data, and deleting it</h2>
        <p>
          We keep your account and content for as long as your account exists. You can delete
          single tasks, goals and events in the app at any time. You can clear the offline copy
          from <strong>Settings → Clear offline copy</strong>, and signing out clears it too. You
          can delete your account, with all your tasks, goals and events, yourself from{' '}
          <strong>Settings → Delete account</strong>. The deletion happens straight away and
          can't be undone.
        </p>
      </section>

      <section>
        <h2>8. Your choices</h2>
        <p>At any time, you can:</p>
        <ul>
          <li>See and edit anything you've entered in the app.</li>
          <li>Print your planner, goals or calendar, or save them as a PDF, with the <strong>Export</strong> button.</li>
          <li>Delete single items, or clear the offline copy from Settings.</li>
          <li>Sign out, which ends your session on this device and removes the offline copy of your data from this browser.</li>
          <li>Delete your account and all its data from <strong>Settings → Delete account</strong>.</li>
        </ul>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          JourneySet isn't meant for children under 13, and we don't knowingly collect
          information from them.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy. When we make a material change, we'll update the
          "Last updated" date above.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          You can send questions about this policy, or requests to see or delete your data,
          through the project's{' '}
          <a href="https://github.com/FullyMed/My_Projects" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
