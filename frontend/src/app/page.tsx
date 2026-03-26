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
          <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
            Serving the San Francisco Bay Area
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Compare Renovation Quotes from Bay Area Dealers.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              No Phone Tag.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Shopping for appliances, fireplaces, hot tubs, outdoor kitchens,
            grills, or countertops? These high-ticket renovation products are
            sold through dealer networks with no public pricing. DealerReach
            contacts Bay Area dealers for you and collects real quotes, so you
            can compare prices without the runaround.
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
                Choose Your Project
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Pick your renovation category and tell us what you need —
                brand, model, and specs. We will handle the rest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                We Contact Bay Area Dealers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Our system finds authorized dealers across the Bay Area and
                reaches out on your behalf.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Compare &amp; Save
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                As dealer quotes come in, compare prices, lead times, and
                availability side by side.
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
                title: "Bay Area Coverage",
                desc: "We search dealers across San Francisco, Oakland, San Jose, and the entire Bay Area.",
              },
              {
                title: "High-Ticket Expertise",
                desc: "Built for the products where pricing matters most: appliances, fireplaces, outdoor kitchens, and more.",
              },
              {
                title: "Real-Time Tracking",
                desc: "Watch your request progress through each stage with live status updates.",
              },
              {
                title: "AI-Parsed Quotes",
                desc: "Dealer responses are automatically parsed to extract price, lead time, and availability.",
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

      {/* Popular Categories */}
      <section className="border-t border-slate-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Popular Renovation Categories
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            Get competitive dealer quotes on the high-ticket items that make the biggest impact on your renovation.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Kitchen Appliances",
                desc: "Ranges, refrigerators, dishwashers, and more from top brands.",
              },
              {
                title: "Fireplaces & Inserts",
                desc: "Gas, electric, and wood-burning fireplaces and inserts for every style.",
              },
              {
                title: "Hot Tubs & Spas",
                desc: "Find the best deals on hot tubs and swim spas from authorized dealers.",
              },
              {
                title: "Outdoor Kitchens & Grills",
                desc: "Built-in grills, outdoor kitchen islands, and premium BBQ setups.",
              },
              {
                title: "Countertops & Cabinetry",
                desc: "Quartz, granite, marble countertops and custom cabinetry.",
              },
              {
                title: "Windows & Doors",
                desc: "Energy-efficient windows, patio doors, and entry door systems.",
              },
            ].map((cat) => (
              <div
                key={cat.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="font-semibold text-white">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 space-y-6">
            {[
              {
                q: "What types of renovation products does this work for?",
                a: "DealerReach is built for high-ticket home renovation items sold through dealer networks: kitchen appliances, fireplaces, hot tubs, outdoor kitchens, grills, countertops, windows, doors, and more.",
              },
              {
                q: "How long does it take to get quotes?",
                a: "Most users start receiving dealer quotes within 1-3 business days, depending on the product and how quickly dealers respond.",
              },
              {
                q: "Is my information shared with dealers?",
                a: "Only your product inquiry is shared with dealers. Your personal contact information is never disclosed -- dealers reply through our system.",
              },
              {
                q: "Is DealerReach free?",
                a: "Yes! DealerReach is completely free to use during our beta period.",
              },
              {
                q: "Do you only serve the Bay Area?",
                a: "We're currently focused on the San Francisco Bay Area for our launch. We plan to expand to other markets soon.",
              },
              {
                q: "Can I use DealerReach for my contractor's material sourcing?",
                a: "Absolutely! Many of our users are homeowners working with contractors who need competitive pricing on materials and appliances.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to save on your renovation?
          </h2>
          <p className="mt-4 text-slate-400">
            Join Bay Area homeowners who are getting the best dealer prices on
            their renovation projects.
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
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DealerReach.io. All rights reserved.
          </p>
          <nav className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="transition-colors hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-slate-300">
              Terms of Service
            </Link>
            <Link href="/contact" className="transition-colors hover:text-slate-300">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
