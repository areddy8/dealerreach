"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuoteRequest } from "@/lib/api";

export default function QuoteRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [specs, setSpecs] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [dealerLocatorUrl, setDealerLocatorUrl] = useState("");

  const zipValid = /^\d{5}$/.test(zipCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!zipValid) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    setLoading(true);
    try {
      const qr = await createQuoteRequest({
        product_name: productName.trim(),
        brand: brand.trim() || undefined,
        specs: specs.trim() || undefined,
        zip_code: zipCode.trim(),
        radius_miles: radiusMiles,
        dealer_locator_url: dealerLocatorUrl.trim() || undefined,
      });
      router.push(`/dashboard/${qr.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="productName" className={labelClass}>
          Product Name <span className="text-red-400">*</span>
        </label>
        <input
          id="productName"
          type="text"
          placeholder="e.g. Napoleon Prestige 500 Gas Grill"
          className={inputClass}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="brand" className={labelClass}>
          Brand
        </label>
        <input
          id="brand"
          type="text"
          placeholder="e.g. Napoleon"
          className={inputClass}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="specs" className={labelClass}>
          Specifications / Notes
        </label>
        <textarea
          id="specs"
          rows={3}
          placeholder="Color, model number, any specific options..."
          className={inputClass}
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="zipCode" className={labelClass}>
            ZIP Code <span className="text-red-400">*</span>
          </label>
          <input
            id="zipCode"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="90210"
            className={`${inputClass} ${
              zipCode && !zipValid ? "border-red-500" : ""
            }`}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          {zipCode && !zipValid && (
            <p className="mt-1 text-xs text-red-400">
              Must be a 5-digit ZIP code
            </p>
          )}
        </div>

        <div>
          <label htmlFor="radius" className={labelClass}>
            Search Radius
          </label>
          <select
            id="radius"
            className={inputClass}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
          >
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dealerLocatorUrl" className={labelClass}>
          Dealer Locator URL
        </label>
        <input
          id="dealerLocatorUrl"
          type="url"
          placeholder="https://brand.com/find-a-dealer"
          className={inputClass}
          value={dealerLocatorUrl}
          onChange={(e) => setDealerLocatorUrl(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          Optional. If the brand has a dealer locator page, paste the URL here
          to improve search results.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          "Find Dealer Prices"
        )}
      </button>
    </form>
  );
}
