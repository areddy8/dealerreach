import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - DealerReach.io",
  description:
    "Get in touch with DealerReach.io for questions, feedback, or support.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-slate-400 leading-relaxed">
          Have questions, feedback, or need help? We&apos;d love to hear from
          you.
        </p>

        <div className="mt-10 space-y-6">
          {/* Contact Methods */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-5">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                General Inquiries
              </h2>
              <a
                href="mailto:hello@dealerreach.io"
                className="mt-1 block text-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                hello@dealerreach.io
              </a>
            </div>

            <div className="border-t border-slate-800" />

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Support
              </h2>
              <a
                href="mailto:support@dealerreach.io"
                className="mt-1 block text-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                support@dealerreach.io
              </a>
            </div>

            <div className="border-t border-slate-800" />

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Privacy
              </h2>
              <a
                href="mailto:privacy@dealerreach.io"
                className="mt-1 block text-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@dealerreach.io
              </a>
            </div>
          </div>

          {/* Service Area */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Service Area
            </h2>
            <p className="mt-2 text-slate-300">
              Currently serving the San Francisco Bay Area.
            </p>
          </div>

          {/* Response Time */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Response Time
            </h2>
            <p className="mt-2 text-slate-300">
              We typically respond within 1 business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
