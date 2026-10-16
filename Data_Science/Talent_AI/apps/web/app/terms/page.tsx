import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Use | Talent AI",
};

// [PLACEHOLDER] Fill in two things before relying on this: your registered
// business name (if you have one) and the jurisdiction whose law governs
// these Terms (section 13). The rest is written to match how the product
// works today, but it's a starting point, not a substitute for a lawyer's
// review before you take on paying customers.
const LEGAL_ENTITY = "Talent AI";
const CONTACT_EMAIL = "maxfelix05@gmail.com";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="October 16, 2026">
      <section>
        <h2>1. Agreeing to these Terms</h2>
        <p>
          These Terms of Use (&quot;Terms&quot;) cover your use of Talent AI (the
          &quot;Service&quot;), run by {LEGAL_ENTITY} (&quot;we&quot;, &quot;us&quot;). By creating
          an account or using the Service, you agree to these Terms and to our{" "}
          <a href="/privacy">Privacy Policy</a>. If you use the Service for a company or other
          organization, you confirm that you can accept these Terms on its behalf, and
          &quot;you&quot; means both you and that organization.
        </p>
      </section>

      <section>
        <h2>2. What the Service does</h2>
        <p>
          Talent AI helps recruiters and hiring teams compare resumes against a job. You upload
          resumes and job descriptions, and the Service ranks your candidates, shows a keyword
          comparison and a summary of missing skills, and can write an optional AI review of a
          candidate. Each company account (a &quot;tenant&quot;) has its own data, and the
          database itself keeps one tenant from seeing another&apos;s.
        </p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <p>
          Give accurate details when you sign up, and keep your password to yourself. You&apos;re
          responsible for everything done through your account. If you think someone else has
          used it, tell us right away.
        </p>
      </section>

      <section>
        <h2>4. Plans and payment</h2>
        <p>
          You can use the free Trial plan, which has usage limits, or a paid plan that Stripe
          bills as a recurring subscription. When you subscribe, you allow us to charge your
          payment method each billing period until you cancel. You can change or cancel your
          subscription at any time with the Manage billing button on the Billing page, which
          opens Stripe&apos;s billing portal. We don&apos;t store your card details. Stripe
          collects and stores them.
        </p>
        <p>
          Fees are non-refundable unless the law requires a refund. We may change prices or plan
          limits after giving you reasonable notice. If you keep using the Service after a change
          takes effect, you accept it.
        </p>
      </section>

      <section>
        <h2>5. Acceptable use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Upload resumes or candidate data you have no lawful basis to process;</li>
          <li>
            Make hiring decisions that unlawfully discriminate against anyone on a ground that
            employment law protects;
          </li>
          <li>Try to get around another tenant&apos;s data isolation or reach data that isn&apos;t yours;</li>
          <li>Upload malicious files, or try to disrupt, overload or reverse-engineer the Service; or</li>
          <li>Build a competing product.</li>
        </ul>
      </section>

      <section>
        <h2>6. Candidate data you upload</h2>
        <p>
          When you upload a resume or other candidate details, you are the data controller for
          that information, and we process it on your behalf (our{" "}
          <a href="/privacy">Privacy Policy</a> explains how). It&apos;s your job to make sure you
          have the rights, consent or other lawful basis you need to upload and process a
          candidate&apos;s personal data, and to answer any request a candidate makes about their
          own data.
        </p>
      </section>

      <section>
        <h2>7. AI reviews</h2>
        <p>
          AI reviews of candidates (summaries, strengths and gaps, interview questions and hiring
          recommendations) come from a third-party AI model and are for information only. They
          can be wrong or incomplete, and they{" "}
          <strong>don&apos;t replace your own judgment</strong> in any hiring decision. You alone
          are responsible for the decisions you make with the Service.
        </p>
      </section>

      <section>
        <h2>8. Who owns what</h2>
        <p>
          We own the Service: its software, design and branding. You own the data you upload
          (job descriptions, resumes and candidate details). You give us a license to process
          that data only so we can provide the Service to you.
        </p>
      </section>

      <section>
        <h2>9. Ending your use</h2>
        <p>
          You can stop using the Service at any time. You can delete a candidate, along with their
          resume file, from that candidate&apos;s page. To delete jobs or close your account, email
          us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may suspend or close
          an account that breaks these Terms, and we&apos;ll warn you first where we reasonably
          can. Once your account ends, so does your right to use the Service, and we handle any
          remaining data as our <a href="/privacy">Privacy Policy</a> describes.
        </p>
      </section>

      <section>
        <h2>10. No warranties</h2>
        <p>
          We provide the Service &quot;as is&quot;, without warranties of any kind, express or
          implied, including fitness for a particular purpose or non-infringement. We don&apos;t
          promise that the Service will run without interruption or errors, or that rankings and
          AI reviews will be accurate.
        </p>
      </section>

      <section>
        <h2>11. Limits on our liability</h2>
        <p>
          As far as the law allows, {LEGAL_ENTITY} isn&apos;t liable for indirect, incidental,
          special or consequential damages, or for any hiring decision made with the Service. Our
          total liability for any claim about the Service is capped at what you paid us in the 12
          months before the claim.
        </p>
      </section>

      <section>
        <h2>12. Changes to these Terms</h2>
        <p>
          We may update these Terms. When we do, we&apos;ll change the &quot;Last updated&quot;
          date above, and we&apos;ll tell you about important changes in a reasonable way, such as
          by email or a notice in the app. If you keep using the Service after a change takes
          effect, you accept the new Terms.
        </p>
      </section>

      <section>
        <h2>13. Governing law</h2>
        <p>
          The laws of <strong>[PLACEHOLDER: your jurisdiction, e.g. Taiwan]</strong> govern these
          Terms, without regard to conflict-of-law rules.
        </p>
      </section>

      <section>
        <h2>14. Contact us</h2>
        <p>
          Questions about these Terms? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
