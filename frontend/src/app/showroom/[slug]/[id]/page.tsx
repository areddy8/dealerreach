"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useParams } from "next/navigation";

const mockProduct = {
  brand: "La Cornue",
  name: "Chateau 150 Grand Palais",
  description:
    "A masterwork of French culinary engineering, the Chateau 150 embodies over a century of artisanal tradition. Each range is hand-assembled in the ateliers of Fauville-en-Caux, Normandy, using time-honored techniques passed down through generations of master craftsmen.",
  price: "$68,500",
  specs: [
    { label: "Dimensions (W x D x H)", value: '59" x 27.5" x 36"' },
    { label: "Weight", value: "1,045 lbs" },
    { label: "Power Supply", value: "240V / 60Hz / 50A" },
    { label: "Oven Capacity", value: "4.5 cu. ft. (each)" },
    { label: "Burner Output", value: "Up to 23,000 BTU" },
    { label: "Number of Burners", value: "6 Sealed Brass" },
    { label: "Oven Type", value: "Dual Convection + Vaulted Gas" },
    { label: "Finish Options", value: "250+ Custom Colors" },
    { label: "Certification", value: "CSA, NSF" },
  ],
};

const finishes = [
  { name: "Brushed Nickel", color: "bg-[#c5c2b8]" },
  { name: "Matte Black", color: "bg-[#2a2a2a]" },
  { name: "Polished Chrome", color: "bg-[#d4d7dc]" },
  { name: "Antique Brass", color: "bg-[#a38542]" },
  { name: "Satin Gold", color: "bg-[#c9a84c]" },
];

const relatedProducts = [
  {
    slug: "la-cornue",
    id: "chateau-120",
    brand: "La Cornue",
    name: "Chateau 120",
    price: "$52,000",
    gradient: "from-[#3a3b37] to-[#252622]",
  },
  {
    slug: "gaggenau",
    id: "vario-400",
    brand: "Gaggenau",
    name: "Vario 400 Series Cooktop",
    price: "$8,900",
    gradient: "from-[#2c2f33] to-[#1a1c1e]",
  },
  {
    slug: "sub-zero",
    id: "pro-48",
    brand: "Sub-Zero",
    name: 'Pro 48" Refrigerator',
    price: "$22,750",
    gradient: "from-[#3b3d40] to-[#222426]",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;

  return (
    <div className="flex flex-col bg-surface text-on-surface">
      <NavBar />

      {/* ── Asymmetric Hero ── */}
      <section className="relative min-h-[70vh] flex items-end pt-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-end pb-16">
          {/* Left image area */}
          <div className="md:w-3/5 w-full">
            <div className="aspect-[4/3] bg-gradient-to-br from-[#363733] to-[#252622] rounded-lg flex items-center justify-center">
              <span className="font-headline text-surface/10 text-6xl tracking-tighter select-none">
                {mockProduct.brand}
              </span>
            </div>
          </div>

          {/* Right content card - overlapping */}
          <div className="md:w-2/5 w-full md:-ml-32 relative z-10 mt-[-2rem] md:mt-0">
            <div className="bg-surface-container-lowest p-8 md:p-12 shadow-2xl rounded-lg">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
                {mockProduct.brand}
              </span>
              <h1 className="font-headline text-3xl md:text-4xl font-light text-on-surface tracking-tight mt-3">
                {mockProduct.name}
              </h1>
              <p className="text-on-surface-variant text-sm leading-relaxed mt-4">
                {mockProduct.description}
              </p>
              <p className="font-headline text-2xl text-on-surface mt-6">
                {mockProduct.price}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-primary text-on-primary px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all duration-200 shadow-sm text-center"
                >
                  Schedule Consultation
                </Link>
                <button className="border border-on-surface/20 text-on-surface px-8 py-4 rounded font-label text-xs uppercase tracking-widest hover:border-on-surface/40 transition-all duration-200 text-center">
                  Add to Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Finishes ── */}
      <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
          Curated Finishes
        </span>
        <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
          Material <span className="italic">Harmony</span>
        </h2>
        <div className="mt-12 flex flex-wrap gap-10">
          {finishes.map((finish) => (
            <div key={finish.name} className="flex flex-col items-center gap-3">
              <div
                className={`w-20 h-20 rounded-full ${finish.color} shadow-md ring-2 ring-surface-container-high hover:scale-110 transition-transform duration-300 cursor-pointer`}
              />
              <span className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/70">
                {finish.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Specifications Grid ── */}
      <section className="bg-surface-container-highest py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            Technical Details
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
            Specifications
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProduct.specs.map((spec) => (
              <div key={spec.label} className="py-4 border-b border-on-surface/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1">
                  {spec.label}
                </span>
                <span className="text-sm text-on-surface">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="bg-[#1b1c19] py-28">
        <div className="max-w-3xl mx-auto text-center px-6">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#775a19]">
            The Artisan&apos;s Vision
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight text-[#fbf9f4]">
            A Legacy of <span className="italic">Craftsmanship</span>
          </h2>
          <p className="mt-6 text-[#fbf9f4]/60 leading-relaxed">
            For over 100 years, La Cornue has remained faithful to its founding vision:
            to create cooking instruments of unparalleled beauty and performance. Each piece
            is a testament to the marriage of tradition and innovation, hand-crafted by artisans
            who understand that true luxury lies in the details that cannot be rushed.
          </p>
          <Link
            href={`/showroom/${slug}`}
            className="inline-block mt-10 text-[#775a19] font-label text-xs uppercase tracking-widest hover:text-[#a07a24] transition-colors duration-300"
          >
            Explore the Collection &rarr;
          </Link>
        </div>
      </section>

      {/* ── Related Masterpieces ── */}
      <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
          Related Masterpieces
        </span>
        <h2 className="font-headline text-4xl md:text-5xl font-light mt-4 tracking-tight">
          You May Also <span className="italic">Appreciate</span>
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/showroom/${product.slug}/${product.id}`}
              className="group hover:-translate-y-1 transition-transform duration-300"
            >
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${product.gradient} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="font-headline text-white/10 text-3xl tracking-tighter select-none">
                  {product.brand}
                </span>
              </div>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
                {product.brand}
              </span>
              <h3 className="font-headline text-lg font-light text-on-surface mt-1">
                {product.name}
              </h3>
              <p className="font-headline text-sm text-on-surface-variant mt-1">
                {product.price}
              </p>
            </Link>
          ))}
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
                Crafting digital excellence for the world&apos;s most distinguished
                appliance and kitchen dealers.
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
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
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
