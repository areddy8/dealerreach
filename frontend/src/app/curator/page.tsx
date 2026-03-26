"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { curateProducts } from "@/lib/api";
import type { CurationResult } from "@/lib/types";

export default function CuratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CurationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  async function handleCurate(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError("");
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await curateProducts(query.trim());
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get recommendations"
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
          <span className="mr-2">&#10024;</span>AI Curator
        </h1>
        <p className="mt-3 text-[#6B6560] max-w-xl mx-auto">
          Describe what your client is looking for, and our AI will recommend
          the perfect products from your collection.
        </p>
      </div>

      {/* Results area */}
      <div className="mt-8 min-h-[200px]">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
            <p className="mt-4 text-sm text-[#6B6560]">
              Curating the perfect selection...
            </p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="py-16 text-center">
            <p className="text-[#6B6560]">
              No matching products found. Try a different description or add
              more products to your collection.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.product_id}
                className="flex gap-4 rounded-xl border border-[#E8E4DE] bg-white p-4 transition-shadow hover:shadow-sm"
              >
                {/* Product Image */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  {result.product.image_urls.length > 0 ? (
                    <img
                      src={result.product.image_urls[0]}
                      alt={result.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0EDE8] to-[#E8E4DE]">
                      <span className="text-2xl text-[#6B6560]/30">
                        {result.product.brand.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B8965A]">
                    {result.product.brand}
                  </p>
                  <h3 className="font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
                    {result.product.name}
                  </h3>
                  <p className="text-sm text-[#1A1A1A]">
                    {result.product.price
                      ? `$${result.product.price.toLocaleString()}`
                      : "Contact for Pricing"}
                  </p>
                  <p className="mt-2 text-sm text-[#6B6560] italic">
                    {result.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area at bottom */}
      <form onSubmit={handleCurate} className="mt-8">
        <div className="rounded-xl border border-[#E8E4DE] bg-white p-4">
          <textarea
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-[#1A1A1A] placeholder-[#6B6560]/50 focus:outline-none"
            placeholder="Describe your client's vision..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-lg bg-[#B8965A] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Curating..." : "Curate"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
