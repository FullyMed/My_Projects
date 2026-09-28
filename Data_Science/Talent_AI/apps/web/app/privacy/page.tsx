import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Talent AI",
};

// [PLACEHOLDER] — same note as terms/page.tsx: fill in your legal entity
// name/jurisdiction, and have this reviewed before relying on it,
// especially if candidate data from the EU/UK (GDPR) or California (CCPA)
// ever passes through the Service. The sub-processor list and data flows
// below are accurate to the current codebase (2026-09-28) -- keep this in
// sync if a new third-party service is ever added (e.g. a different email
// provider, a new AI vendor).
const LEGAL_ENTITY = "Talent AI";
const CONTACT_EMAIL = "maxfelix05@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="September 28, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains how {LEGAL_ENTITY} (&quot;we&quot;, &quot;us&quot;)
          collects, uses, and shares information through Talent AI (the &quot;Service&quot;). It
          covers both <strong>account holders</strong> (the recruiters/companies who sign up)
          and, separately, <strong>job candidates</strong> whose resumes account holders upload —
          see Section 7, since these two groups are treated differently.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>From account holders, directly:</p>
        <ul>
          <li>Account info: work email, company name, password (handled by our auth provider, never stored by us in plain text);</li>
          <li>Billing info: Stripe collects and stores your payment details directly — we never see or store full card numbers;</li>
          <li>Content you upload: resume PDFs, job descriptions, category labels you assign;</li>
          <li>Usage data: candidates ranked, insights generated, AI token usage (for plan-limit enforcement).</li>
        </ul>
        <p>From resumes you upload, we extract structured data: candidate name, contact details, skills, education, and experience — see Section 7 for how this is handled.</p>
      </section>

      <section>
        <h2>3. How We Use Information</h2>
        <ul>
          <li>To provide the Service — parsing resumes, ranking candidates, generating skill-gap and AI insights;</li>
          <li>To operate your account — authentication, billing, plan-limit enforcement;</li>
          <li>To send service emails — e.g. an opt-in weekly shortlist digest for jobs you&apos;ve enabled it on;</li>
          <li>To maintain security and prevent abuse of the Service.</li>
        </ul>
        <p>We do not sell your data, or the data of candidates you upload, to third parties.</p>
      </section>

      <section>
        <h2>4. AI Processing</h2>
        <p>
          When you request AI-generated candidate insights, we send an <strong>anonymized</strong>{" "}
          version of the resume text to our AI provider (OpenAI) — names, emails, and phone
          numbers are stripped beforehand wherever our redaction is able to detect them. This
          redaction is automated and best-effort, not a guarantee, particularly for uncommon
          name formats or unusual resume layouts. AI insights are only generated when you
          explicitly request them for a specific candidate and job — never automatically or in
          bulk.
        </p>
      </section>

      <section>
        <h2>5. Sub-processors — Who We Share Data With</h2>
        <p>We use the following third-party services to operate Talent AI. Each processes data only as needed to provide their part of the Service:</p>
        <ul>
          <li><strong>Supabase</strong> — database, authentication, and file storage. Tenant data isolation is enforced at the database level (Row-Level Security).</li>
          <li><strong>OpenAI</strong> — generates AI candidate insights from anonymized resume text (Section 4).</li>
          <li><strong>Stripe</strong> — payment processing and subscription billing.</li>
          <li><strong>Google (Gmail SMTP)</strong> — delivery of the opt-in weekly shortlist email, where enabled.</li>
          <li><strong>Google Cloud (Cloud Run)</strong> — hosts our backend application.</li>
          <li><strong>Vercel</strong> — hosts our frontend application.</li>
        </ul>
        <p>We do not share your data with any other third party except where required by law.</p>
      </section>

      <section>
        <h2>6. Data Retention and Deletion</h2>
        <p>
          Candidate records and their associated data are retained until you delete them, which
          you can do at any time from the Candidates page — this also removes the underlying
          resume file from storage. If you close your account, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to request deletion of your
          remaining account data.
        </p>
      </section>

      <section>
        <h2>7. If You Are a Job Candidate</h2>
        <p>
          If your resume was uploaded to Talent AI by a company you applied to or were sourced
          by, you are not a user of the Service and did not create an account with us — the
          company that uploaded your information is the data controller responsible for that
          decision, and Talent AI acts as a processor on their behalf. To exercise any rights
          you have over your personal data (access, correction, deletion), please contact the
          company you applied to directly. We will assist that company in fulfilling a valid
          request.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use industry-standard measures to protect your data, including encryption in
          transit (HTTPS), database-level tenant isolation (Row-Level Security), and restricting
          administrative database access to a small number of automated, narrowly-scoped
          service paths (billing and scheduled-report processing) rather than broad standing
          access. No method of transmission or storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>
          We use essential cookies to keep you signed in (via our authentication provider). We
          do not use advertising or cross-site tracking cookies.
        </p>
      </section>

      <section>
        <h2>10. Children&apos;s Privacy</h2>
        <p>
          The Service is intended for business use by adults acting on behalf of an
          organization. It is not directed at, and we do not knowingly collect information from,
          children.
        </p>
      </section>

      <section>
        <h2>11. International Data Transfers</h2>
        <p>
          Our sub-processors (Section 5) may process and store data in countries other than your
          own, including the United States. By using the Service, you consent to this transfer.
        </p>
      </section>

      <section>
        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We&apos;ll update the &quot;Last
          updated&quot; date above; material changes will be communicated by reasonable means.
        </p>
      </section>

      <section>
        <h2>13. Contact Us</h2>
        <p>
          Questions about this Privacy Policy, or a data request? Contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
