"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";

const categories = [
  {
    name: "Traditional Hearths",
    count: 42,
    description: "Hand-carved mantels and time-honored masonry designs.",
    gradient: "from-on-surface/80 via-primary/30 to-on-surface/60",
    span: "col-span-12 md:col-span-7 h-[520px]",
  },
  {
    name: "Modern Linear",
    count: 36,
    description: "Frameless ribbon burners and minimalist surrounds.",
    gradient: "from-primary/40 via-on-surface/60 to-on-surface/80",
    span: "col-span-12 md:col-span-5 h-[520px]",
  },
];

const materials = [
  { name: "Caststone Grey", color: "bg-[#8C8C84]" },
  { name: "Carrara Marble", color: "bg-[#E8E4DE]" },
  { name: "Welsh Slate", color: "bg-[#2F2F2F]" },
  { name: "Terracotta", color: "bg-[#C67544]" },
  { name: "Burnished Bronze", color: "bg-[#7A5C3E]" },
];

const products = [
  {
    name: "The Kensington",
    series: "Heritage Series",
    price: "$14,800",
    tag: "Hand-Carved",
  },
  {
    name: "Flamewave 72",
    series: "Modern Linear",
    price: "$9,200",
    tag: "New Arrival",
  },
  {
    name: "The Belgravia",
    series: "Traditional Hearths",
    price: "$22,500",
    tag: "Bespoke",
  },
  {
    name: "Ember Ridge Pro",
    series: "Contemporary",
    price: "$7,600",
    tag: "Best Seller",
  },
  {
    name: "The Montague",
    series: "Heritage Series",
    price: "$18,900",
    tag: "Limited Edition",
  },
  {
    name: "Horizon 48",
    series: "Modern Linear",
    price: "$6,400",
    tag: "Studio Pick",
  },
];

export default function FireplacesShowcasePage() {
  return (
    <div className="flex flex-col bg-surface text-on-surface">
      <NavBar />

      {/* ── Full-Bleed Hero ── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-on-surface via-on-surface/90 to-primary/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 pb-20 w-full">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            Heritage Collection
          </span>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-white font-light leading-[1.1] mt-4 mb-6 tracking-tighter">
            The Art of <span className="italic">Flame</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl font-light max-w-xl mb-10 leading-relaxed">
            For centuries, the fireplace has been the soul of the home. Our
            curated collection honours that legacy with masterworks of stone,
            steel, and fire.
          </p>
          <Link
            href="#collections"
            className="bg-primary text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all duration-200 shadow-sm active:scale-95 inline-block"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* ── Asymmetric Category Grid ── */}
      <section
        id="collections"
        className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 w-full"
      >
        <div className="mb-16">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            Categories
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
            Curated <span className="italic">Collections</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`${cat.span} rounded-lg overflow-hidden relative group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`}
              />
              <div className="absolute inset-x-0 bottom-0 bg-surface-container-lowest/95 backdrop-blur-md p-6">
                <h3 className="font-headline text-xl font-light text-on-surface">
                  {cat.name}
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  {cat.count} pieces &middot; {cat.description}
                </p>
                <Link
                  href="#"
                  className="mt-3 inline-block font-label text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  Explore &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Materiality Section ── */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
              Materiality
            </span>
            <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
              Crafted from the <span className="italic">Earth</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-10 md:gap-16">
            {materials.map((mat) => (
              <div key={mat.name} className="flex flex-col items-center gap-3">
                <div
                  className={`w-24 h-24 rounded-full ${mat.color} shadow-md`}
                />
                <span className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
                  {mat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Gallery ── */}
      <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-16">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            Gallery
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
            Featured <span className="italic">Pieces</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-surface-container-low rounded-lg overflow-hidden editorial-shadow group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="h-64 bg-gradient-to-br from-surface-container to-surface-container-high relative">
                <span className="absolute top-4 left-4 font-label text-[10px] uppercase tracking-widest bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant px-3 py-1 rounded-full">
                  {product.tag}
                </span>
              </div>
              <div className="p-6">
                <p className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/60">
                  {product.series}
                </p>
                <h3 className="font-headline text-lg font-light text-on-surface mt-1">
                  {product.name}
                </h3>
                <p className="text-primary font-label text-sm mt-2">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-primary py-28">
        <div className="max-w-3xl mx-auto text-center px-6 md:px-12">
          <h2 className="font-headline text-3xl md:text-4xl font-light text-on-primary tracking-tight">
            Experience the Warmth
          </h2>
          <p className="mt-4 text-on-primary/70 max-w-xl mx-auto leading-relaxed">
            Visit our showroom to see these masterpieces in person. Feel the
            radiant heat, admire the hand-finished details, and discover the
            fireplace that transforms your space.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-block border border-on-primary/40 text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-on-primary/70 transition-all duration-200"
          >
            Schedule a Showroom Visit
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-on-surface border-t border-surface/10 px-6 md:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <span className="font-headline text-xl tracking-tight text-surface">
                DealerReach
              </span>
              <p className="mt-4 text-sm leading-relaxed text-surface/40">
                Crafting digital excellence for the world&apos;s most
                distinguished appliance and kitchen dealers.
              </p>
            </div>
            <div className="flex gap-12">
              <nav className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/privacy"
                  className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="font-label text-xs uppercase tracking-wider text-surface/40 hover:text-surface transition-colors"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface/10 pt-8 sm:flex-row">
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface/30 hover:text-surface transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface/30 hover:text-surface transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-surface/30">
              &copy; {new Date().getFullYear()} DealerReach. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
