import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Talent AI",
};

// [PLACEHOLDER] Same note as terms/page.tsx: fill in your legal entity name
// and jurisdiction, and have this reviewed before relying on it, especially
// if candidate data from the EU/UK (GDPR) or California (CCPA) ever passes
// through the Service. The sub-processor list and data flows below match the
// code as of 2026-10-16. Keep them in step if you add a third-party service
// (a different email provider, a new AI vendor).
const LEGAL_ENTITY = "Talent AI";
const CONTACT_EMAIL = "maxfelix05@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="October 16, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains what information {LEGAL_ENTITY} (&quot;we&quot;,
          &quot;us&quot;) collects through Talent AI (the &quot;Service&quot;), and what we do
          with it. It covers two groups of people: <strong>account holders</strong> (the
          recruiters and companies who sign up) and <strong>job candidates</strong> whose resumes
          account holders upload. We treat the two groups differently, and section 7 explains the
          candidate side.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <p>From account holders:</p>
        <ul>
          <li>Account details: your work email, company name and password. Our authentication provider handles the password, and we never store it in plain text.</li>
          <li>Billing details: Stripe collects and stores your payment details. We never see or store full card numbers.</li>
          <li>What you upload: resume PDFs, job descriptions and any category labels you add.</li>
          <li>Usage: the candidates you rank, the AI reviews you request and how many AI tokens you use, which we need to apply plan limits.</li>
        </ul>
        <p>
          A resume contains whatever the candidate wrote, which usually includes their name and
          contact details. We store the original file and its text, and we pull out the
          candidate&apos;s skills, education and experience. Section 7 covers how we handle this.
        </p>
      </section>

      <section>
        <h2>3. How we use it</h2>
        <ul>
          <li>To run the Service: reading resumes, ranking candidates, and producing skill-gap summaries and AI reviews;</li>
          <li>To run your account: signing you in, billing and applying plan limits;</li>
          <li>To send emails about the Service, such as account confirmation emails and an optional weekly shortlist for jobs where you turn it on;</li>
          <li>To keep the Service secure and prevent abuse.</li>
        </ul>
        <p>We don&apos;t sell your data, or the data of candidates you upload, to anyone.</p>
      </section>

      <section>
        <h2>4. AI processing</h2>
        <p>
          When you ask for an AI review of a candidate, we send an <strong>anonymized</strong>{" "}
          copy of the resume text to our AI provider, OpenAI. Before we send it, we remove the
          names, email addresses and phone numbers our software can find. That removal is
          automatic and can miss things, especially unusual name formats or resume layouts. We
          only create an AI review when you ask for one, for one candidate and one job at a time.
          We never send resumes to the AI provider automatically or in bulk.
        </p>
      </section>

      <section>
        <h2>5. Who we share data with</h2>
        <p>These companies help us run Talent AI. Each one processes data only for its part of the Service:</p>
        <ul>
          <li><strong>Supabase</strong>: database, sign-in and file storage. The database itself keeps each company&apos;s data separate (Row-Level Security).</li>
          <li><strong>OpenAI</strong>: writes AI reviews from anonymized resume text (section 4).</li>
          <li><strong>Stripe</strong>: payments and subscription billing.</li>
          <li><strong>Google (Gmail SMTP)</strong>: sends the optional weekly shortlist email, where you turn it on.</li>
          <li><strong>Google Cloud (Cloud Run)</strong>: hosts our server.</li>
          <li><strong>Vercel</strong>: hosts the website.</li>
        </ul>
        <p>We don&apos;t share your data with anyone else unless the law requires it.</p>
      </section>

      <section>
        <h2>6. How long we keep data, and deleting it</h2>
        <p>
          We keep candidate records until you delete them. You can delete a candidate at any time
          with the Delete button on that candidate&apos;s page. That also deletes their resume
          file and any AI reviews of them. To delete jobs or the rest of your account data, email
          us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>7. If you are a job candidate</h2>
        <p>
          If a company you applied to, or one that found you, uploaded your resume to Talent AI,
          you aren&apos;t a user of the Service and didn&apos;t create an account with us. That
          company is the data controller and decided to upload your information, and Talent AI
          processes it on their behalf. To use any rights you have over your personal data
          (access, correction or deletion), contact that company directly. We&apos;ll help them
          handle a valid request.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We protect your data with encryption in transit (HTTPS) and with Row-Level Security,
          which makes the database itself keep each company&apos;s data separate. Only two
          automated parts of our system (billing and the weekly email) have wider database access,
          and only for their own narrow task. No system is completely secure, so we can&apos;t
          guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>
          We use the cookies our authentication provider needs to keep you signed in. We
          don&apos;t use advertising or cross-site tracking cookies.
        </p>
      </section>

      <section>
        <h2>10. Children</h2>
        <p>
          Talent AI is a business tool for adults working for an organization. It isn&apos;t
          meant for children, and we don&apos;t knowingly collect their information.
        </p>
      </section>

      <section>
        <h2>11. Data stored in other countries</h2>
        <p>
          The companies in section 5 may process and store data outside your country, including
          in the United States. By using the Service, you agree to this.
        </p>
      </section>

      <section>
        <h2>12. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy. When we do, we&apos;ll change the &quot;Last
          updated&quot; date above, and we&apos;ll tell you about important changes in a
          reasonable way.
        </p>
      </section>

      <section>
        <h2>13. Contact us</h2>
        <p>
          Questions about this policy, or a request about your data? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
