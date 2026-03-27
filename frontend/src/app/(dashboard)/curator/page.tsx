"use client";

import { useState } from "react";
import { curateProducts } from "@/lib/api";
import type { CurationResult } from "@/lib/types";

export default function CuratorPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CurationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

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
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="material-symbols-outlined text-primary text-4xl mb-4 block">auto_awesome</span>
        <h1 className="font-headline text-3xl font-light text-surface">
          AI Curator
        </h1>
        <p className="mt-3 text-surface/50 max-w-xl mx-auto">
          Describe what your client is looking for, and our AI will recommend
          the perfect products from your collection.
        </p>
      </div>

      {/* Results area */}
      <div className="min-h-[200px] mb-8">
        {error && (
          <div className="rounded bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 font-label text-xs uppercase tracking-widest text-surface/40">
              Curating the perfect selection...
            </p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="py-16 text-center">
            <p className="text-surface/50">
              No matching products found. Try a different description or add more products to your collection.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.product_id}
                className="flex gap-4 bg-surface/5 rounded-lg p-5 hover:bg-surface/8 transition-colors"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  {result.product.image_urls.length > 0 ? (
                    <img
                      src={result.product.image_urls[0]}
                      alt={result.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface/5">
                      <span className="font-headline text-2xl text-surface/10">
                        {result.product.brand.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
                    {result.product.brand}
                  </p>
                  <h3 className="font-headline text-lg text-surface">
                    {result.product.name}
                  </h3>
                  <p className="text-sm text-surface/70">
                    {result.product.price
                      ? `$${result.product.price.toLocaleString()}`
                      : "Contact for Pricing"}
                  </p>
                  <p className="mt-2 text-sm text-surface/40 italic">
                    {result.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleCurate}>
        <div className="bg-surface/5 rounded-lg p-5">
          <textarea
            rows={3}
            className="w-full resize-none bg-transparent text-surface placeholder-surface/30 focus:outline-none text-sm"
            placeholder="Describe your client's vision..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded font-label text-xs uppercase tracking-widest shadow-[0_4px_20px_-4px_rgba(119,90,25,0.4)] hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Curating..." : "Curate"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
