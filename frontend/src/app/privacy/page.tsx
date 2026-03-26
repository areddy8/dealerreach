import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - DealerReach.io",
  description:
    "Learn how DealerReach.io collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: March 2026
        </p>

        <div className="mt-10 space-y-10 text-slate-400 leading-relaxed">
          <p>
            DealerReach.io (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and share information when you use our
            website and services.
          </p>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Information We Collect
            </h2>
            <p className="mt-3">
              We collect information you provide directly to us, including:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <span className="text-slate-300">Account information:</span>{" "}
                your email address and name when you create an account.
              </li>
              <li>
                <span className="text-slate-300">Request details:</span> your
                ZIP code and product interests when you submit a quote request.
              </li>
              <li>
                <span className="text-slate-300">Usage data:</span> information
                about how you interact with our service, including pages visited,
                features used, and timestamps.
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              How We Use Your Information
            </h2>
            <p className="mt-3">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Find authorized dealers near you based on your ZIP code and
                product interests.
              </li>
              <li>
                Send outreach communications to dealers on your behalf to
                request pricing information.
              </li>
              <li>
                Improve our service, develop new features, and enhance the user
                experience.
              </li>
              <li>
                Communicate with you about your account and quote requests.
              </li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Information Sharing
            </h2>
            <p className="mt-3">
              When we contact dealers on your behalf, we share your{" "}
              <span className="text-slate-300">product inquiry</span> (product
              name, brand, model, and general location) so dealers can provide
              accurate pricing.
            </p>
            <p className="mt-3">
              We do{" "}
              <span className="font-medium text-slate-300">not</span> share your
              personal contact information (email address, full name, or exact
              address) with dealers. All dealer replies are routed through our
              system.
            </p>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third
              parties.
            </p>
          </section>

          {/* CCPA Rights */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Your California Privacy Rights (CCPA)
            </h2>
            <p className="mt-3">
              If you are a California resident, you have the following rights
              under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <span className="text-slate-300">Right to Know:</span> You may
                request details about the personal information we have collected
                about you and how it is used.
              </li>
              <li>
                <span className="text-slate-300">Right to Delete:</span> You may
                request deletion of your personal information, subject to certain
                exceptions.
              </li>
              <li>
                <span className="text-slate-300">Right to Opt-Out:</span> You
                may opt out of the sale of your personal information. We do not
                sell personal information.
              </li>
              <li>
                <span className="text-slate-300">Non-Discrimination:</span> We
                will not discriminate against you for exercising any of your CCPA
                rights.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@dealerreach.io"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@dealerreach.io
              </a>
              .
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Data Retention
            </h2>
            <p className="mt-3">
              We retain your account data for as long as your account is active.
              If you choose to delete your account, all associated personal data
              will be permanently deleted within 30 days of your request.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-xl font-semibold text-white">Security</h2>
            <p className="mt-3">
              We take reasonable measures to protect your personal information,
              including the use of encryption and secure communication protocols.
              However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white">Contact Us</h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, please contact
              us at{" "}
              <a
                href="mailto:privacy@dealerreach.io"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@dealerreach.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
