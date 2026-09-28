import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Use — Talent AI",
};

// [PLACEHOLDER] — fill in before relying on this: your registered business
// name/entity (if any) and the jurisdiction whose law should govern these
// Terms. Everything else here is written to match how the product actually
// works, but this file is a starting point, not a substitute for a lawyer's
// review before onboarding paying customers.
const LEGAL_ENTITY = "Talent AI";
const CONTACT_EMAIL = "maxfelix05@gmail.com";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="September 28, 2026">
      <section>
        <h2>1. Agreement to these Terms</h2>
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of Talent AI
          (the &quot;Service&quot;), operated by {LEGAL_ENTITY} (&quot;we&quot;, &quot;us&quot;). By
          creating an account or otherwise using the Service, you agree to be bound by these
          Terms and our{" "}
          <a href="/privacy">Privacy Policy</a>. If you are using the Service on behalf of a
          company or other organization, you represent that you have authority to bind that
          organization, and &quot;you&quot; refers to both you and that organization.
        </p>
      </section>

      <section>
        <h2>2. The Service</h2>
        <p>
          Talent AI is a resume-ranking and candidate-matching tool for recruiters and hiring
          teams. It lets you upload resumes, submit job descriptions, and receive semantic
          rankings, keyword-based comparisons, skill-gap summaries, and optional AI-generated
          candidate insights. The Service is provided on a multi-tenant basis: each company
          account (&quot;tenant&quot;) has its own isolated data, enforced at the database level.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          You must provide accurate information when creating an account and keep your login
          credentials confidential. You are responsible for all activity that occurs under your
          account. Notify us promptly if you suspect unauthorized use.
        </p>
      </section>

      <section>
        <h2>4. Subscriptions and Payment</h2>
        <p>
          The Service is offered on a free trial plan with usage limits, and a paid plan billed
          through Stripe on a recurring subscription basis. By subscribing, you authorize
          recurring charges to your payment method until you cancel. You can manage or cancel
          your subscription at any time from the Billing page, which opens Stripe&apos;s billing
          portal. We do not store your card details — Stripe processes and stores payment
          information directly.
        </p>
        <p>
          Fees are non-refundable except where required by law. We may change pricing or plan
          limits with reasonable notice; continued use after a change takes effect constitutes
          acceptance.
        </p>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Upload resumes or candidate data you do not have a lawful basis to process;</li>
          <li>
            Make hiring decisions that unlawfully discriminate on the basis of a protected
            characteristic under applicable employment law;
          </li>
          <li>Attempt to bypass another tenant&apos;s data isolation or access data that isn&apos;t yours;</li>
          <li>Upload malicious files, or attempt to disrupt, overload, or reverse-engineer the Service; or</li>
          <li>Use the Service to build a competing product.</li>
        </ul>
      </section>

      <section>
        <h2>6. Candidate Data You Upload</h2>
        <p>
          When you upload a resume or candidate information, you are the data controller for
          that information and we process it on your behalf (see our{" "}
          <a href="/privacy">Privacy Policy</a> for how). You are responsible for ensuring you
          have the necessary rights, consents, or other lawful basis to upload and process that
          candidate&apos;s personal data, and for responding to any request from a candidate about
          their own data.
        </p>
      </section>

      <section>
        <h2>7. AI-Generated Content</h2>
        <p>
          AI-generated candidate insights (summaries, strengths/weaknesses, interview questions,
          hiring recommendations) are produced by a third-party AI model and are provided for
          informational purposes only. They may be inaccurate or incomplete, and are{" "}
          <strong>not a substitute for your own judgment</strong> in any hiring decision. You are
          solely responsible for decisions made using the Service.
        </p>
      </section>

      <section>
        <h2>8. Intellectual Property</h2>
        <p>
          We own the Service itself — its software, design, and branding. You retain ownership
          of the data you upload (job descriptions, resumes, candidate data). You grant us a
          license to process that data solely to provide the Service to you.
        </p>
      </section>

      <section>
        <h2>9. Termination</h2>
        <p>
          You may stop using the Service and delete your data at any time. We may suspend or
          terminate accounts that violate these Terms, with notice where reasonably possible.
          Upon termination, your right to use the Service ends; we handle remaining data per our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>10. Disclaimers</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind, express or
          implied, including fitness for a particular purpose or non-infringement. We do not
          warrant that the Service will be uninterrupted, error-free, or that rankings or
          AI-generated content will be accurate.
        </p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {LEGAL_ENTITY} will not be liable for any
          indirect, incidental, special, or consequential damages, or for any hiring decision
          made using the Service. Our total liability for any claim relating to the Service will
          not exceed the amount you paid us in the twelve months preceding the claim.
        </p>
      </section>

      <section>
        <h2>12. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We&apos;ll update the &quot;Last
          updated&quot; date above; material changes will be communicated by reasonable means
          (e.g. email or an in-app notice). Continued use of the Service after changes take
          effect constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>13. Governing Law</h2>
        <p>
          These Terms are governed by the laws of{" "}
          <strong>[PLACEHOLDER — your jurisdiction, e.g. Taiwan]</strong>, without regard to
          conflict-of-law principles.
        </p>
      </section>

      <section>
        <h2>14. Contact Us</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
