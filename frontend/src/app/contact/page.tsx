import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - DealerReach",
  description:
    "Get in touch with DealerReach for questions, demos, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-16 sm:px-6 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A] sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-[#6B6560] leading-relaxed">
          Have questions, need a demo, or interested in a partnership?
          We&apos;d love to hear from you.
        </p>

        <div className="mt-10 space-y-6">
          {/* Contact Methods */}
          <div className="rounded-xl border border-[#E8E4DE] bg-white p-6 space-y-5">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B6560]">
                General Inquiries
              </h2>
              <a
                href="mailto:hello@dealerreach.io"
                className="mt-1 block text-lg text-[#B8965A] hover:text-[#A07D48] transition-colors"
              >
                hello@dealerreach.io
              </a>
            </div>

            <div className="border-t border-[#E8E4DE]" />

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B6560]">
                Support
              </h2>
              <a
                href="mailto:support@dealerreach.io"
                className="mt-1 block text-lg text-[#B8965A] hover:text-[#A07D48] transition-colors"
              >
                support@dealerreach.io
              </a>
            </div>

            <div className="border-t border-[#E8E4DE]" />

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B6560]">
                Privacy
              </h2>
              <a
                href="mailto:privacy@dealerreach.io"
                className="mt-1 block text-lg text-[#B8965A] hover:text-[#A07D48] transition-colors"
              >
                privacy@dealerreach.io
              </a>
            </div>
          </div>

          {/* Demo */}
          <div className="rounded-xl border border-[#E8E4DE] bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B6560]">
              Request a Private Walkthrough
            </h2>
            <p className="mt-2 text-[#1A1A1A]">
              Schedule a personalized demo to see how DealerReach can elevate
              your showroom&apos;s digital presence.
            </p>
          </div>

          {/* Response Time */}
          <div className="rounded-xl border border-[#E8E4DE] bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B6560]">
              Response Time
            </h2>
            <p className="mt-2 text-[#1A1A1A]">
              We typically respond within 1 business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
