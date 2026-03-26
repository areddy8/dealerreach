"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Background gradient simulating a luxury showroom */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#1A1A1A] via-[#2C2620] to-[#1A1A1A]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(ellipse_at_60%_40%,rgba(184,150,90,0.3),transparent_70%)]" />

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-normal leading-tight tracking-tight text-[#FAF8F5] sm:text-5xl lg:text-6xl">
            The Digital Home for{" "}
            <em className="not-italic font-[family-name:var(--font-serif)] italic text-[#B8965A]">
              Exceptional
            </em>{" "}
            Crafts.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#FAF8F5]/70">
            Elevate your luxury showroom operations with an editorial-grade
            platform designed for high-end appliance and kitchen dealers.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={user ? "/inventory" : "/signup"}
              className="rounded bg-[#B8965A] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#A07D48]"
            >
              Explore Solutions
            </Link>
            <Link
              href="#features"
              className="rounded border border-[#FAF8F5]/30 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF8F5] transition-colors hover:border-[#FAF8F5]/60"
            >
              View Showcase
            </Link>
          </div>
        </div>
      </section>

      {/* ── Core Philosophy ── */}
      <section id="philosophy" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8965A]">
            Core Philosophy
          </span>
          <h2 className="mt-6 font-[family-name:var(--font-serif)] text-3xl leading-snug text-[#1A1A1A] sm:text-4xl">
            Beyond Software. A Digital Showroom Experience.
          </h2>
          <blockquote className="mt-8 border-l-2 border-[#B8965A] pl-6 text-left">
            <p className="font-[family-name:var(--font-serif)] text-lg italic leading-relaxed text-[#6B6560]">
              &ldquo;Luxury is not a feature. It is a standard of service that
              should be felt at every touchpoint.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="features" className="bg-[#F0EDE8] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Editorial Presentation */}
            <div className="overflow-hidden rounded-lg border border-[#E8E4DE] bg-[#FAF8F5]">
              <div className="h-48 bg-gradient-to-br from-[#E8E4DE] to-[#D4CFC7]" />
              <div className="p-8">
                <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                  Editorial Presentation
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">
                  Showcase your inventory with the same reverence as a high-end
                  design magazine. Our layouts adapt to the texture of your
                  materials.
                </p>
              </div>
            </div>

            {/* AI Curator */}
            <div className="overflow-hidden rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#B8965A]/10">
                <svg
                  className="h-6 w-6 text-[#B8965A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                AI Curator
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">
                Intelligent material matching that suggests finishes based on
                client mood boards. Let AI handle the curation while you focus
                on relationships.
              </p>
            </div>

            {/* Inventory Flow */}
            <div className="overflow-hidden rounded-lg border-2 border-[#B8965A]/30 bg-[#FAF8F5] p-8">
              <div className="mb-6 h-1 w-12 bg-[#B8965A]" />
              <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                Inventory Flow
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">
                Seamless real-time updates across showrooms and digital
                storefronts. Your inventory stays synchronized, always.
              </p>
            </div>

            {/* Client Portal */}
            <div className="overflow-hidden rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] p-8">
              <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                Client Portal
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">
                A private, white-labeled space for your VIP clients to review
                specifications, view renders, and approve finishes.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8965A] transition-colors hover:text-[#A07D48]"
              >
                Request Demo &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Partners ── */}
      <section id="brands" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A] sm:text-3xl">
            Trusted by the Finest Artisans
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-16 bg-[#B8965A]" />

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {[
              "LA CORNUE",
              "SUB-ZERO",
              "GAGGENAU",
              "WOLF",
              "MIELE",
              "THERMADOR",
            ].map((brand) => (
              <span
                key={brand}
                className="font-[family-name:var(--font-serif)] text-lg tracking-[0.15em] text-[#6B6560] sm:text-xl"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-[#F0EDE8] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-[family-name:var(--font-serif)] text-5xl leading-none text-[#B8965A]">
            &ldquo;
          </span>
          <blockquote className="mt-2 font-[family-name:var(--font-serif)] text-xl italic leading-relaxed text-[#1A1A1A] sm:text-2xl">
            DealerReach transformed our digital presence from a standard catalog
            to a curated gallery. Our conversion rate for walk-in consultations
            has tripled since launch.
          </blockquote>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Julian Sterling
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#6B6560]">
              Creative Director, Sterling &amp; Stone
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#1A1A1A] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#FAF8F5] sm:text-4xl">
            Ready to redefine your reach?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#FAF8F5]/60">
            Join the exclusive network of dealers who prioritize craftsmanship
            in their digital operations.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={user ? "/inventory" : "/signup"}
              className="rounded bg-[#B8965A] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#A07D48]"
            >
              Begin Your Journey
            </Link>
            <Link
              href="/contact"
              className="rounded border border-[#FAF8F5]/30 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF8F5] transition-colors hover:border-[#FAF8F5]/60"
            >
              Request a Private Walkthrough
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="about" className="bg-[#1A1A1A] border-t border-[#FAF8F5]/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            {/* Left */}
            <div className="max-w-sm">
              <span className="font-[family-name:var(--font-serif)] text-xl tracking-wide text-[#FAF8F5]">
                DealerReach
              </span>
              <p className="mt-4 text-sm leading-relaxed text-[#FAF8F5]/50">
                Crafting digital excellence for the world&apos;s most
                distinguished appliance and kitchen dealers.
              </p>
            </div>

            {/* Right */}
            <div className="flex gap-12">
              <nav className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="text-sm uppercase tracking-wider text-[#FAF8F5]/50 transition-colors hover:text-[#FAF8F5]"
                >
                  Contact
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm uppercase tracking-wider text-[#FAF8F5]/50 transition-colors hover:text-[#FAF8F5]"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm uppercase tracking-wider text-[#FAF8F5]/50 transition-colors hover:text-[#FAF8F5]"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#FAF8F5]/10 pt-8 sm:flex-row">
            {/* Social links */}
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FAF8F5]/40 transition-colors hover:text-[#FAF8F5]"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FAF8F5]/40 transition-colors hover:text-[#FAF8F5]"
                aria-label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            <p className="text-sm text-[#FAF8F5]/40">
              &copy; {new Date().getFullYear()} DealerReach. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
