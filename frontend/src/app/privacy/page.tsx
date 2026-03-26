import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - DealerReach",
  description:
    "Learn how DealerReach collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="px-4 py-16 sm:px-6 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#6B6560]">
          Last updated: March 2026
        </p>

        <div className="mt-10 space-y-10 text-[#6B6560] leading-relaxed">
          <p>
            DealerReach (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and share information when you use our
            dealer platform and services.
          </p>

          {/* Information We Collect */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Information We Collect
            </h2>
            <p className="mt-3">
              We collect information you provide directly to us, including:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <span className="text-[#1A1A1A]">Account information:</span>{" "}
                your email address, name, and company details when you create an account.
              </li>
              <li>
                <span className="text-[#1A1A1A]">Product data:</span> inventory
                listings, product descriptions, images, and pricing you upload to the platform.
              </li>
              <li>
                <span className="text-[#1A1A1A]">Usage data:</span> information
                about how you interact with our service, including pages visited,
                features used, and timestamps.
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              How We Use Your Information
            </h2>
            <p className="mt-3">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Provide and maintain the dealer platform, including inventory management
                and client portal features.
              </li>
              <li>
                Power AI-driven product curation and material matching recommendations.
              </li>
              <li>
                Improve our service, develop new features, and enhance the user
                experience.
              </li>
              <li>
                Communicate with you about your account and platform updates.
              </li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Information Sharing
            </h2>
            <p className="mt-3">
              Your product listings and showroom information may be visible to
              clients you invite to your{" "}
              <span className="text-[#1A1A1A]">client portal</span>. You control
              which clients have access to your materials.
            </p>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third
              parties.
            </p>
          </section>

          {/* CCPA Rights */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Your California Privacy Rights (CCPA)
            </h2>
            <p className="mt-3">
              If you are a California resident, you have the following rights
              under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <span className="text-[#1A1A1A]">Right to Know:</span> You may
                request details about the personal information we have collected
                about you and how it is used.
              </li>
              <li>
                <span className="text-[#1A1A1A]">Right to Delete:</span> You may
                request deletion of your personal information, subject to certain
                exceptions.
              </li>
              <li>
                <span className="text-[#1A1A1A]">Right to Opt-Out:</span> You
                may opt out of the sale of your personal information. We do not
                sell personal information.
              </li>
              <li>
                <span className="text-[#1A1A1A]">Non-Discrimination:</span> We
                will not discriminate against you for exercising any of your CCPA
                rights.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@dealerreach.io"
                className="text-[#B8965A] hover:text-[#A07D48] transition-colors"
              >
                privacy@dealerreach.io
              </a>
              .
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
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
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Security
            </h2>
            <p className="mt-3">
              We take reasonable measures to protect your personal information,
              including the use of encryption and secure communication protocols.
              However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, please contact
              us at{" "}
              <a
                href="mailto:privacy@dealerreach.io"
                className="text-[#B8965A] hover:text-[#A07D48] transition-colors"
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
