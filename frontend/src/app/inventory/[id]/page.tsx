"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getProduct,
  updateProduct,
  deleteProduct,
  generateAIDescription,
} from "@/lib/api";
import type { Product } from "@/lib/types";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  useEffect(() => {
    if (!user || !params.id) return;
    getProduct(params.id)
      .then((p) => {
        setProduct(p);
        setBrand(p.brand);
        setName(p.name);
        setModel(p.model || "");
        setCategory(p.category || "appliances");
        setPrice(p.price != null ? String(p.price) : "");
        setMsrp(p.msrp != null ? String(p.msrp) : "");
        setDescription(p.description || "");
        setAiDescription(p.ai_description || "");
        setInStock(p.in_stock);
        setHeroImageUrl(p.image_urls.length > 0 ? p.image_urls[0] : "");
        setFeatured(p.tags.includes("featured"));
        setSpecs(
          p.specifications
            ? Object.entries(p.specifications).map(([key, value]) => ({
                key,
                value,
              }))
            : []
        );
        setTagsInput(
          p.tags.filter((t) => t !== "featured").join(", ")
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load product")
      )
      .finally(() => setLoading(false));
  }, [user, params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
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

      await updateProduct(product.id, {
        brand,
        name,
        model: model || undefined,
        category,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        msrp: msrp ? parseFloat(msrp) : undefined,
        in_stock: inStock,
        image_urls: imageUrls,
        specifications:
          Object.keys(specifications).length > 0 ? specifications : undefined,
        tags,
      });

      router.push("/inventory");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateAI() {
    if (!product) return;
    setError("");
    setAiLoading(true);
    try {
      const result = await generateAIDescription(product.id);
      setAiDescription(result.description);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate AI description"
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push("/inventory");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete product"
      );
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 text-center">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
          Product not found
        </h2>
        <Link
          href="/inventory"
          className="mt-4 inline-block text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
        >
          &larr; Back to Collection
        </Link>
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
        Edit Product
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
            <label htmlFor="brand" className={labelClass}>
              Brand
            </label>
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
            <label htmlFor="name" className={labelClass}>
              Model Name
            </label>
            <input
              id="name"
              type="text"
              required
              className={inputClass}
              placeholder='e.g. 48" Built-In Refrigerator'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Model Number */}
          <div>
            <label htmlFor="model" className={labelClass}>
              Model Number{" "}
              <span className="text-[#6B6560] font-normal">(optional)</span>
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
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
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
                Price{" "}
                <span className="text-[#6B6560] font-normal">(optional)</span>
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
                MSRP{" "}
                <span className="text-[#6B6560] font-normal">(optional)</span>
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
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className={inputClass}
              placeholder="Describe the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Description */}
          <div>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#B8965A] px-4 py-2 text-sm font-medium text-[#B8965A] transition-colors hover:bg-[#B8965A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
                  Generating...
                </>
              ) : (
                "Generate AI Description"
              )}
            </button>
            {aiDescription && (
              <div className="mt-3 rounded-lg border border-[#E8E4DE] bg-[#F0EDE8] p-4 text-sm text-[#1A1A1A]">
                <p className="text-xs font-medium text-[#6B6560] mb-1">
                  AI Description:
                </p>
                {aiDescription}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availability" className={labelClass}>
              Availability Status
            </label>
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
              Hero Image URL{" "}
              <span className="text-[#6B6560] font-normal">(optional)</span>
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
              className={`relative h-6 w-11 rounded-full transition-colors ${
                featured ? "bg-[#B8965A]" : "bg-[#E8E4DE]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${
                  featured ? "translate-x-5" : ""
                }`}
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
              Tags{" "}
              <span className="text-[#6B6560] font-normal">
                (comma-separated)
              </span>
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

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              confirmDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-red-300 text-red-600 hover:bg-red-50"
            }`}
          >
            {deleting
              ? "Deleting..."
              : confirmDelete
                ? "Confirm Delete"
                : "Delete Product"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#B8965A] px-8 py-2.5 font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
