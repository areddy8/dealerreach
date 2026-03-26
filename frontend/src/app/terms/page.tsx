import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - DealerReach",
  description:
    "Terms of Service for DealerReach, the editorial-grade platform for luxury appliance and kitchen dealers.",
};

export default function TermsOfServicePage() {
  return (
    <div className="px-4 py-16 sm:px-6 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[#6B6560]">
          Last updated: March 2026
        </p>

        <div className="mt-10 space-y-10 text-[#6B6560] leading-relaxed">
          <p>
            Welcome to DealerReach. By accessing or using our service, you
            agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use our service.
          </p>

          {/* Service Description */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Service Description
            </h2>
            <p className="mt-3">
              DealerReach provides an editorial-grade dealer platform for luxury
              appliance and kitchen showrooms. Our platform offers inventory
              management, AI-powered product curation, client portals, and
              digital showroom experiences designed for high-end dealers.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 18 years of age and authorized to represent
              your dealership or showroom to use DealerReach. Our platform is
              designed for professional dealers and showroom operators.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              User Accounts
            </h2>
            <p className="mt-3">
              When you create an account, you must provide accurate and complete
              information. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account. Please notify us immediately if you
              suspect unauthorized use of your account.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Abuse, harass, or send harmful content through our service.
              </li>
              <li>
                Use automated tools, bots, or scripts to access or interact with
                our platform without our written consent.
              </li>
              <li>
                Misrepresent your identity or the nature of your business.
              </li>
              <li>
                Use the service for any unlawful purpose or in violation of any
                applicable laws.
              </li>
            </ul>
          </section>

          {/* Beta Service */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Beta Service
            </h2>
            <p className="mt-3">
              DealerReach is currently offered as a free beta service. During
              the beta period, the service is provided as-is and may be subject
              to changes, interruptions, or discontinuation without notice. We
              reserve the right to introduce pricing or modify features as the
              service evolves.
            </p>
          </section>

          {/* Content & Data */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Content &amp; Data
            </h2>
            <p className="mt-3">
              You retain all rights to the content you upload to the platform,
              including product images, descriptions, and inventory data. By
              using the platform, you grant DealerReach a license to display
              your content as necessary to provide the service, including in
              client portals and digital showroom presentations.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Intellectual Property
            </h2>
            <p className="mt-3">
              DealerReach and its licensors own all rights, title, and
              interest in the platform, including all software, design, text, and
              graphics.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Limitation of Liability
            </h2>
            <p className="mt-3">
              The service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, express or implied.
              To the fullest extent permitted by law, DealerReach shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of the service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Termination
            </h2>
            <p className="mt-3">
              Either party may terminate this agreement at any time. You may
              delete your account at any time through your account settings. We
              reserve the right to suspend or terminate your account if you
              violate these terms. Upon termination, your data will be deleted in
              accordance with our Privacy Policy.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Governing Law
            </h2>
            <p className="mt-3">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the State of California, without regard
              to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
              Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:legal@dealerreach.io"
                className="text-[#B8965A] hover:text-[#A07D48] transition-colors"
              >
                legal@dealerreach.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
