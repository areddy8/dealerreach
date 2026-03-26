import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - DealerReach.io",
  description:
    "Terms of Service for DealerReach.io, the automated dealer quote collection platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: March 2026
        </p>

        <div className="mt-10 space-y-10 text-slate-400 leading-relaxed">
          <p>
            Welcome to DealerReach.io. By accessing or using our service, you
            agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use our service.
          </p>

          {/* Service Description */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Service Description
            </h2>
            <p className="mt-3">
              DealerReach.io provides automated dealer quote collection for home
              renovation and improvement products. Our platform identifies
              authorized dealers near you and contacts them on your behalf to
              request pricing information for products such as fireplaces, hot
              tubs, grills, appliances, and similar items sold through dealer
              networks.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-white">Eligibility</h2>
            <p className="mt-3">
              You must be at least 18 years of age and a resident of the United
              States to use DealerReach.io. Our service currently serves the San
              Francisco Bay Area. We may expand to additional regions in the
              future.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl font-semibold text-white">User Accounts</h2>
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
            <h2 className="text-xl font-semibold text-white">
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
                Misrepresent your identity or the purpose of your quote
                requests.
              </li>
              <li>
                Use the service for any unlawful purpose or in violation of any
                applicable laws.
              </li>
            </ul>
          </section>

          {/* Beta Service */}
          <section>
            <h2 className="text-xl font-semibold text-white">Beta Service</h2>
            <p className="mt-3">
              DealerReach.io is currently offered as a free beta service. During
              the beta period, the service is provided as-is and may be subject
              to changes, interruptions, or discontinuation without notice. We
              reserve the right to introduce pricing or modify features as the
              service evolves.
            </p>
          </section>

          {/* Quotes & Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Quotes &amp; Pricing
            </h2>
            <p className="mt-3">
              All dealer quotes collected through DealerReach.io are
              informational in nature and do not constitute binding offers.
              Pricing, availability, and lead times are subject to change at the
              dealer&apos;s discretion. DealerReach.io is not a party to any
              transaction between you and a dealer, and we do not guarantee the
              accuracy of any quoted prices.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Intellectual Property
            </h2>
            <p className="mt-3">
              DealerReach.io and its licensors own all rights, title, and
              interest in the platform, including all software, design, text, and
              graphics. You retain all rights to the content you submit through
              our service, such as your product inquiries and account
              information.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              Limitation of Liability
            </h2>
            <p className="mt-3">
              The service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, express or implied.
              We do not guarantee that dealers will respond to your inquiries, or
              that any quotes received will be accurate or honored. To the
              fullest extent permitted by law, DealerReach.io shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-white">Termination</h2>
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
            <h2 className="text-xl font-semibold text-white">Governing Law</h2>
            <p className="mt-3">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the State of California, without regard
              to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white">Contact Us</h2>
            <p className="mt-3">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:legal@dealerreach.io"
                className="text-blue-400 hover:text-blue-300 transition-colors"
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
