"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:pt-32">
        {/* Gradient blob background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Get Real Dealer Prices.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              No Phone Tag.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Many premium products — fireplaces, hot tubs, grills, appliances —
            are only sold through dealer networks with no public pricing.
            DealerReach contacts local dealers for you and collects real quotes,
            so you can compare prices without the runaround.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={user ? "/new-request" : "/signup"}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40"
            >
              Get Started Free
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            Three simple steps to get competitive dealer pricing delivered to your inbox.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Enter Your Product
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Tell us what you are looking for — product name, brand, model,
                and your ZIP code. We will handle the rest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                We Contact Dealers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Our system finds authorized dealers near you and reaches out
                via email and contact forms requesting pricing on your behalf.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Compare Prices
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                As dealer replies come in, we parse and display them in a
                clean dashboard so you can compare pricing side by side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Value Props */}
      <section className="border-t border-slate-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Automated Outreach",
                desc: "We find and contact dealers so you do not have to make dozens of phone calls.",
              },
              {
                title: "Real-Time Tracking",
                desc: "Watch your request progress through each stage with live status updates.",
              },
              {
                title: "Parsed Replies",
                desc: "Dealer responses are automatically parsed to extract price, lead time, and availability.",
              },
              {
                title: "Multiple Sources",
                desc: "We scrape dealer locators, Google Maps, and brand directories to find every dealer near you.",
              },
              {
                title: "Side-by-Side Comparison",
                desc: "All quotes are organized in one place for easy comparison.",
              },
              {
                title: "Privacy First",
                desc: "Your contact info is never shared. Dealers reply through our system.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <div>
                  <h4 className="font-medium text-white">{f.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to get real prices?
          </h2>
          <p className="mt-4 text-slate-400">
            Stop guessing. Start comparing dealer quotes today.
          </p>
          <Link
            href={user ? "/new-request" : "/signup"}
            className="mt-8 inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500"
          >
            Create Your First Request
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} DealerReach.io. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
