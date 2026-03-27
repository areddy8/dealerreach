"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col bg-surface text-on-surface">
      <NavBar />

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-on-surface via-on-surface/90 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-background/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-white font-light leading-[1.1] mb-8 tracking-tighter">
              The Digital Home for <span className="italic">Exceptional</span> Crafts.
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light max-w-xl mb-12 leading-relaxed">
              Elevate your luxury showroom operations with an editorial-grade platform
              designed for high-end appliance and kitchen dealers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="bg-primary text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all duration-200 shadow-sm active:scale-95 text-center"
              >
                Explore Solutions
              </Link>
              <Link
                href="#features"
                className="border border-white/30 text-white px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-white/60 transition-all duration-200 text-center"
              >
                View Showcase
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition Bento Grid ── */}
      <section id="features" className="py-28 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-20">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            Why DealerReach
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
            Beyond Software.<br />
            A Digital <span className="italic">Showroom Experience.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {/* Editorial Presentation - Large card */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-low rounded-lg p-8 md:p-12 editorial-shadow group hover:-translate-y-1 transition-transform duration-300">
            <div className="h-48 md:h-64 bg-gradient-to-br from-surface-container to-surface-container-high rounded mb-8" />
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">photo_library</span>
            </div>
            <h3 className="font-headline text-2xl font-light text-on-surface">
              Editorial Presentation
            </h3>
            <p className="mt-3 text-on-surface-variant text-sm leading-relaxed max-w-md">
              Showcase your inventory with the same reverence as a high-end design magazine.
              Our layouts adapt to the texture of your materials.
            </p>
          </div>

          {/* AI Curator */}
          <div className="col-span-12 md:col-span-5 bg-surface-container rounded-lg p-8 md:p-12 editorial-shadow group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
            </div>
            <h3 className="font-headline text-2xl font-light text-on-surface">
              AI Curator
            </h3>
            <p className="mt-3 text-on-surface-variant text-sm leading-relaxed">
              Intelligent material matching and AI-generated product descriptions that speak
              the language of luxury. Let AI handle the curation while you focus on relationships.
            </p>
          </div>

          {/* Inventory Flow */}
          <div className="col-span-12 md:col-span-5 bg-surface-container-high rounded-lg p-8 md:p-12 editorial-shadow group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
            </div>
            <h3 className="font-headline text-2xl font-light text-on-surface">
              Inventory Flow
            </h3>
            <p className="mt-3 text-on-surface-variant text-sm leading-relaxed">
              Seamless real-time updates across showrooms and digital storefronts.
              Your inventory stays synchronized, always.
            </p>
          </div>

          {/* Client Portal */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-low rounded-lg p-8 md:p-12 editorial-shadow group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">hub</span>
            </div>
            <h3 className="font-headline text-2xl font-light text-on-surface">
              Client Portal
            </h3>
            <p className="mt-3 text-on-surface-variant text-sm leading-relaxed max-w-md">
              A private, white-labeled space for your VIP clients to review specifications,
              view renders, and approve finishes — all branded to your showroom.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 font-label text-xs uppercase tracking-widest text-primary hover:text-primary-container transition-colors"
            >
              Request Demo
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Partners ── */}
      <section id="brands" className="py-20 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
            Trusted by the Finest Artisans
          </span>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {["LA CORNUE", "SUB-ZERO", "GAGGENAU", "WOLF", "MIELE", "THERMADOR"].map((brand) => (
              <span
                key={brand}
                className="font-headline text-lg md:text-xl tracking-[0.15em] text-on-surface-variant/40"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-28 max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-headline text-6xl leading-none text-primary/30">&ldquo;</span>
          <blockquote className="font-headline text-xl md:text-2xl italic leading-relaxed text-on-surface mt-2">
            DealerReach transformed our digital presence from a standard catalog to a curated gallery.
            Our conversion rate for walk-in consultations has tripled since launch.
          </blockquote>
          <div className="mt-8">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-medium">
              Julian Sterling
            </p>
            <p className="mt-1 font-label text-xs uppercase tracking-[0.15em] text-on-surface-variant">
              Creative Director, Sterling &amp; Stone
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-on-surface px-6 md:px-12 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-light text-surface tracking-tight">
            Ready to redefine your reach?
          </h2>
          <p className="mt-4 text-surface/50 max-w-xl mx-auto">
            Join the exclusive network of dealers who prioritize craftsmanship in their digital operations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="bg-primary text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all duration-200 shadow-sm"
            >
              Begin Your Journey
            </Link>
            <Link
              href="/contact"
              className="border border-surface/30 text-surface px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-surface/60 transition-all duration-200"
            >
              Request a Private Walkthrough
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="about" className="bg-on-surface border-t border-surface/10 px-6 md:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <span className="font-headline text-xl tracking-tight text-surface">DealerReach</span>
              <p className="mt-4 text-sm leading-relaxed text-surface/40">
                Crafting digital excellence for the world&apos;s most distinguished appliance and kitchen dealers.
              </p>
            </div>
            <div className="flex gap-12">
              <nav className="flex flex-col gap-3">
                <Link href="/contact" className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors">
                  Contact
                </Link>
                <Link href="/privacy" className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors">
                  Terms
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface/10 pt-8 sm:flex-row">
            <div className="flex gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-surface/30 hover:text-surface transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-surface/30 hover:text-surface transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-surface/30">
              &copy; {new Date().getFullYear()} DealerReach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
