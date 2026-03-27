"use client";

import Link from "next/link";
import { useState } from "react";
import NavBar from "@/components/NavBar";

const brands = ["All", "La Cornue", "Sub-Zero", "Wolf", "Gaggenau", "Miele", "Thermador"];

const featuredProducts = [
  {
    id: "la-cornue-chateau-150",
    brand: "La Cornue",
    name: "Ch\u00e2teau 150",
    price: "$58,900",
    gradient: "from-primary/20 via-surface-container-high to-on-surface/10",
  },
  {
    id: "sub-zero-bi-36u",
    brand: "Sub-Zero",
    name: "BI-36U Designer Column",
    price: "$12,450",
    gradient: "from-on-surface/10 via-surface-container to-primary/10",
  },
  {
    id: "wolf-dual-fuel-60",
    brand: "Wolf",
    name: 'Dual Fuel Range 60"',
    price: "$18,750",
    gradient: "from-surface-container-high via-on-surface/5 to-primary/15",
  },
];

const galleryProducts = [
  {
    id: "gaggenau-bs-485",
    brand: "Gaggenau",
    name: "BS 485 Combi-Steam Oven",
    price: "$7,899",
    gradient: "from-on-surface/10 via-surface-container-high to-primary/10",
  },
  {
    id: "miele-hr-1956",
    brand: "Miele",
    name: 'HR 1956 Range 48"',
    price: "$14,999",
    gradient: "from-primary/15 via-surface-container to-on-surface/5",
  },
  {
    id: "thermador-pro-harmony-48",
    brand: "Thermador",
    name: 'Pro Harmony 48" Range',
    price: "$11,299",
    gradient: "from-surface-container via-primary/10 to-on-surface/10",
  },
  {
    id: "sub-zero-icb-648pro",
    brand: "Sub-Zero",
    name: "ICB648PRO Refrigerator",
    price: "$16,850",
    gradient: "from-on-surface/15 via-surface-container-high to-primary/5",
  },
  {
    id: "la-cornue-cornufe-110",
    brand: "La Cornue",
    name: "CornuF\u00e9 110",
    price: "$9,450",
    gradient: "from-primary/10 via-on-surface/5 to-surface-container-high",
  },
  {
    id: "wolf-cg365ts",
    brand: "Wolf",
    name: 'CG365T/S 36" Cooktop',
    price: "$3,290",
    gradient: "from-surface-container-high via-primary/10 to-on-surface/10",
  },
];

export default function KitchenCategoryShowcasePage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="flex flex-col bg-surface text-on-surface">
      <NavBar />

      {/* ── Editorial Hero ── */}
      <section className="relative h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-on-surface via-on-surface/80 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />
        </div>
        <div className="relative z-10 w-full p-6 md:p-12 pb-16">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 block mb-4">
            The Collection
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-white font-light tracking-tighter mb-4">
            Kitchen <span className="italic">Masterpieces</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base font-light max-w-lg mb-8 leading-relaxed">
            A curated selection of the world&apos;s finest kitchen appliances,
            chosen for those who understand that cooking is an art form.
          </p>
          <a
            href="#collection"
            className="inline-block border border-white/30 text-white px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-white/60 transition-all duration-200"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* ── Brand Filter Chips ── */}
      <section id="collection" className="py-8 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveFilter(brand)}
              className={`px-5 py-2 rounded-full font-label text-xs uppercase tracking-widest whitespace-nowrap transition-colors duration-200 ${
                activeFilter === brand
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>

      {/* ── Asymmetric Category Block ── */}
      <section className="py-12 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-12 gap-6">
          {/* Left — Large Featured */}
          <div className="col-span-12 md:col-span-7">
            <Link
              href={`/showroom/kitchen/${featuredProducts[0].id}`}
              className="group block relative h-[600px] rounded-lg overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${featuredProducts[0].gradient}`}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-lg p-6">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                    {featuredProducts[0].brand}
                  </span>
                  <h3 className="font-headline text-xl font-light text-on-surface mt-1">
                    {featuredProducts[0].name}
                  </h3>
                  <p className="font-label text-sm text-primary mt-2">
                    {featuredProducts[0].price}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Right — Two Stacked */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
            {featuredProducts.slice(1).map((product) => (
              <Link
                key={product.id}
                href={`/showroom/kitchen/${product.id}`}
                className="group block relative aspect-[4/3] rounded-lg overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-lg p-5">
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                      {product.brand}
                    </span>
                    <h3 className="font-headline text-lg font-light text-on-surface mt-1">
                      {product.name}
                    </h3>
                    <p className="font-label text-sm text-primary mt-2">
                      {product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Grid ── */}
      <section className="py-12 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-12">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            The Gallery
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
            Discover <span className="italic">Excellence</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/showroom/kitchen/${product.id}`}
              className="group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`}
                />
                <div className="absolute inset-0 bg-on-surface/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="font-label text-xs uppercase tracking-widest text-white">
                    View Details
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                  {product.brand}
                </span>
                <h3 className="font-headline text-lg font-light text-on-surface mt-1">
                  {product.name}
                </h3>
                <p className="font-label text-sm text-primary mt-1">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-surface-container-low py-28">
        <div className="max-w-3xl mx-auto text-center px-6 md:px-12">
          <h2 className="font-headline text-3xl md:text-4xl font-light tracking-tight text-on-surface">
            Begin Your Kitchen Journey
          </h2>
          <p className="mt-4 text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed">
            Our specialists are ready to guide you through every detail,
            from selection to installation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="bg-primary text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all duration-200 shadow-sm"
            >
              Schedule a Private Consultation
            </Link>
            <Link
              href="/showroom"
              className="border border-on-surface/30 text-on-surface px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-on-surface/60 transition-all duration-200"
            >
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-on-surface border-t border-surface/10 px-6 md:px-12 py-16">
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
