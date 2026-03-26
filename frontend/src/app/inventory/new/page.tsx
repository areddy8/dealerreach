"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createProduct, generateAIDescription } from "@/lib/api";

const CATEGORIES = [
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

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("appliances");
  const [price, setPrice] = useState("");
  const [msrp, setMsrp] = useState("");
  const [description, setDescription] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [inStock, setInStock] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const specifications: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
      });

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (featured && !tags.includes("featured")) tags.push("featured");

      const imageUrls = heroImageUrl.trim() ? [heroImageUrl.trim()] : [];

      await createProduct({
        brand,
        name,
        model: model || undefined,
        category,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        msrp: msrp ? parseFloat(msrp) : undefined,
        in_stock: inStock,
        image_urls: imageUrls,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        tags,
      });

      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateAI() {
    setError("");
    setAiLoading(true);
    try {
      const specifications: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
      });

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (featured && !tags.includes("featured")) tags.push("featured");

      const imageUrls = heroImageUrl.trim() ? [heroImageUrl.trim()] : [];

      const product = await createProduct({
        brand,
        name,
        model: model || undefined,
        category,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        msrp: msrp ? parseFloat(msrp) : undefined,
        in_stock: inStock,
        image_urls: imageUrls,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        tags,
      });

      const result = await generateAIDescription(product.id);
      setAiDescription(result.description);

      router.push(`/inventory/${product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] transition-colors";
  const labelClass = "block text-sm font-medium text-[#1A1A1A] mb-1.5";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/inventory"
        className="text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
      >
        &larr; Back to Collection
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
        Add to Your Collection
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="rounded-xl border border-[#E8E4DE] bg-white p-6 space-y-5">
          {/* Brand */}
          <div>
            <label htmlFor="brand" className={labelClass}>Brand</label>
            <input
              id="brand"
              type="text"
              required
              className={inputClass}
              placeholder="e.g. Sub-Zero"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          {/* Model Name */}
          <div>
            <label htmlFor="name" className={labelClass}>Model Name</label>
            <input
              id="name"
              type="text"
              required
              className={inputClass}
              placeholder="e.g. 48&quot; Built-In Refrigerator"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Model Number */}
          <div>
            <label htmlFor="model" className={labelClass}>
              Model Number <span className="text-[#6B6560] font-normal">(optional)</span>
            </label>
            <input
              id="model"
              type="text"
              className={inputClass}
              placeholder="e.g. BI-48S/S"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClass}>Category</label>
            <select
              id="category"
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price <span className="text-[#6B6560] font-normal">(optional)</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="Leave blank for 'Contact for Pricing'"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="msrp" className={labelClass}>
                MSRP <span className="text-[#6B6560] font-normal">(optional)</span>
              </label>
              <input
                id="msrp"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="Manufacturer suggested price"
                value={msrp}
                onChange={(e) => setMsrp(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              rows={4}
              className={inputClass}
              placeholder="Describe the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Description button */}
          <div>
            <p className="text-xs text-[#6B6560] mb-2">
              Save the product first, then generate an AI description from the edit page, or click
              below to create and generate in one step.
            </p>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading || !brand || !name}
              className="inline-flex items-center gap-2 rounded-lg border border-[#B8965A] px-4 py-2 text-sm font-medium text-[#B8965A] transition-colors hover:bg-[#B8965A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
                  Generating...
                </>
              ) : (
                "✨ Generate AI Description"
              )}
            </button>
            {aiDescription && (
              <div className="mt-3 rounded-lg border border-[#E8E4DE] bg-[#F0EDE8] p-4 text-sm text-[#1A1A1A]">
                <p className="text-xs font-medium text-[#6B6560] mb-1">AI Description:</p>
                {aiDescription}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availability" className={labelClass}>Availability Status</label>
            <select
              id="availability"
              className={inputClass}
              value={inStock ? "in_stock" : "out_of_stock"}
              onChange={(e) => setInStock(e.target.value === "in_stock")}
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Hero Image URL */}
          <div>
            <label htmlFor="heroImage" className={labelClass}>
              Hero Image URL <span className="text-[#6B6560] font-normal">(optional)</span>
            </label>
            <input
              id="heroImage"
              type="url"
              className={inputClass}
              placeholder="https://example.com/image.jpg"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
            />
          </div>

          {/* Featured toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-[#B8965A]" : "bg-[#E8E4DE]"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${featured ? "translate-x-5" : ""}`}
              />
            </button>
            <span className="text-sm text-[#1A1A1A]">Featured Product</span>
          </div>

          {/* Specifications */}
          <div>
            <label className={labelClass}>Specifications</label>
            {specs.map((spec, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  placeholder="Key"
                  value={spec.key}
                  onChange={(e) => {
                    const next = [...specs];
                    next[i] = { ...next[i], key: e.target.value };
                    setSpecs(next);
                  }}
                />
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...specs];
                    next[i] = { ...next[i], value: e.target.value };
                    setSpecs(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                  className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSpecs([...specs, { key: "", value: "" }])}
              className="text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
            >
              + Add Specification
            </button>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags <span className="text-[#6B6560] font-normal">(comma-separated)</span>
            </label>
            <input
              id="tags"
              type="text"
              className={inputClass}
              placeholder="luxury, modern, stainless"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#B8965A] px-8 py-2.5 font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
