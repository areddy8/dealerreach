"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { listProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  "All Categories",
  "appliances",
  "cabinetry",
  "countertops",
  "fixtures",
  "flooring",
  "furniture",
  "lighting",
  "plumbing",
  "tile",
  "other",
];

function availabilityColor(product: Product) {
  return product.in_stock
    ? "bg-green-900/30 text-green-300"
    : "bg-red-900/30 text-red-300";
}

function availabilityText(product: Product) {
  return product.in_stock ? "In Stock" : "Out of Stock";
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All Categories" && p.category !== category) return false;
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, category, search]);

  const selectClass =
    "bg-surface/5 border-0 border-b border-surface/20 py-3 px-4 text-sm text-surface focus:border-primary focus:outline-none transition-colors";
  const inputClass =
    "bg-transparent border-0 border-b border-surface/20 py-3 px-4 text-sm text-surface placeholder-surface/30 focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
            Showroom Flow
          </span>
          <h1 className="font-headline text-3xl font-light text-surface mt-1">
            Your Collection
          </h1>
        </div>
        <Link
          href="/inventory/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row mb-8">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-on-surface text-surface">
              {c === "All Categories" ? c : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} flex-1`}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded bg-error-container/20 px-4 py-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && products.length === 0 && (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-surface/20 mb-4 block">inventory_2</span>
          <h2 className="font-headline text-2xl text-surface">Your showroom awaits</h2>
          <p className="mt-2 text-surface/50">
            Add your first product to start building your collection.
          </p>
          <Link
            href="/inventory/new"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-label text-xs uppercase tracking-widest"
          >
            Add Your First Product
          </Link>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && filtered.length === 0 && products.length > 0 && (
        <div className="py-16 text-center">
          <p className="text-surface/50">No products match your filters.</p>
        </div>
      )}

      {/* Product grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/inventory/${product.id}`}
              className="group relative overflow-hidden rounded-lg bg-surface/5 transition-all hover:bg-surface/8"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface/5">
                    <span className="font-headline text-4xl text-surface/10">
                      {product.brand.charAt(0)}
                    </span>
                  </div>
                )}
                {product.tags.includes("featured") && (
                  <span className="absolute top-3 right-3 material-symbols-outlined text-primary text-xl">
                    star
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
                  {product.brand}
                </p>
                <h3 className="mt-1 font-headline text-lg text-surface">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-surface/70">
                    {product.price
                      ? `$${product.price.toLocaleString()}`
                      : "Contact for Pricing"}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${availabilityColor(product)}`}>
                    {availabilityText(product)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
