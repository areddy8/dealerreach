"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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

const AVAILABILITY = ["All", "in_stock", "special_order", "out_of_stock"];

function availabilityLabel(val: string) {
  if (val === "in_stock") return "In Stock";
  if (val === "special_order") return "Special Order";
  if (val === "out_of_stock") return "Out of Stock";
  return val;
}

function availabilityColor(product: Product) {
  if (product.in_stock) return "bg-green-100 text-green-800";
  return "bg-red-100 text-red-800";
}

function availabilityText(product: Product) {
  return product.in_stock ? "In Stock" : "Out of Stock";
}

export default function InventoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [availability, setAvailability] = useState("All");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    listProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All Categories" && p.category !== category) return false;
      if (availability === "in_stock" && !p.in_stock) return false;
      if (availability === "out_of_stock" && p.in_stock) return false;
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, category, availability, search]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] transition-colors text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
          Your Collection
        </h1>
        <Link
          href="/inventory/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#B8965A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48]"
        >
          Add Product
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "All Categories" ? c : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className={inputClass}
        >
          {AVAILABILITY.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "All Availability" : availabilityLabel(a)}
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
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && products.length === 0 && (
        <div className="mt-16 text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
            Your showroom awaits
          </h2>
          <p className="mt-2 text-[#6B6560]">
            Add your first product to start building your collection.
          </p>
          <Link
            href="/inventory/new"
            className="mt-6 inline-flex items-center rounded-lg bg-[#B8965A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48]"
          >
            Add Your First Product
          </Link>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && filtered.length === 0 && products.length > 0 && (
        <div className="mt-16 text-center">
          <p className="text-[#6B6560]">No products match your filters.</p>
        </div>
      )}

      {/* Product grid */}
      {!loading && filtered.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/inventory/${product.id}`}
              className="group overflow-hidden rounded-xl border border-[#E8E4DE] bg-white transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0EDE8] to-[#E8E4DE]">
                    <span className="text-4xl text-[#6B6560]/30">
                      {product.brand.charAt(0)}
                    </span>
                  </div>
                )}
                {product.tags.includes("featured") && (
                  <span className="absolute top-3 right-3 text-lg text-[#B8965A]">
                    &#9733;
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B8965A]">
                  {product.brand}
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-[#1A1A1A]">
                    {product.price
                      ? `$${product.price.toLocaleString()}`
                      : "Contact for Pricing"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${availabilityColor(product)}`}
                  >
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
