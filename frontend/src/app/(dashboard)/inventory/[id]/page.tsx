"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProduct, updateProduct, deleteProduct, generateAIDescription } from "@/lib/api";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  "appliances", "cabinetry", "countertops", "fixtures",
  "flooring", "furniture", "lighting", "plumbing", "tile", "other",
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

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
    if (!params.id) return;
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
        setSpecs(p.specifications ? Object.entries(p.specifications).map(([key, value]) => ({ key, value })) : []);
        setTagsInput(p.tags.filter((t) => t !== "featured").join(", "));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load product"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setError("");
    setSubmitting(true);
    try {
      const specifications: Record<string, string> = {};
      specs.forEach((s) => { if (s.key.trim()) specifications[s.key.trim()] = s.value.trim(); });
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      if (featured && !tags.includes("featured")) tags.push("featured");
      const imageUrls = heroImageUrl.trim() ? [heroImageUrl.trim()] : [];

      await updateProduct(product.id, {
        brand, name, model: model || undefined, category,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        msrp: msrp ? parseFloat(msrp) : undefined,
        in_stock: inStock, image_urls: imageUrls,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        tags,
      });
      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
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
      setError(err instanceof Error ? err.message : "Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <h2 className="font-headline text-2xl text-surface">Product not found</h2>
        <Link href="/inventory" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-fixed transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Collection
        </Link>
      </div>
    );
  }

  const inputClass = "w-full bg-transparent border-0 border-b border-surface/20 py-3 text-sm text-surface placeholder-surface/30 focus:border-primary focus:outline-none transition-colors";
  const labelClass = "block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2";
  const selectClass = "w-full bg-surface/5 border-0 border-b border-surface/20 py-3 text-sm text-surface focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/inventory" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-fixed transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Collection
      </Link>

      <h1 className="mt-4 font-headline text-3xl font-light text-surface">Edit Product</h1>

      {error && (
        <div className="mt-4 rounded bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="bg-surface/5 rounded-lg p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="brand" className={labelClass}>Brand</label>
            <input id="brand" type="text" required className={inputClass} placeholder="e.g. Sub-Zero" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>Model Name</label>
            <input id="name" type="text" required className={inputClass} placeholder='e.g. 48" Built-In Refrigerator' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="model" className={labelClass}>Model Number <span className="text-surface/30">(optional)</span></label>
            <input id="model" type="text" className={inputClass} placeholder="e.g. BI-48S/S" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>Category</label>
            <select id="category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-on-surface text-surface">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>Price <span className="text-surface/30">(optional)</span></label>
              <input id="price" type="number" step="0.01" min="0" className={inputClass} placeholder="Leave blank for 'Contact'" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label htmlFor="msrp" className={labelClass}>MSRP <span className="text-surface/30">(optional)</span></label>
              <input id="msrp" type="number" step="0.01" min="0" className={inputClass} placeholder="Manufacturer price" value={msrp} onChange={(e) => setMsrp(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" rows={4} className={inputClass} placeholder="Describe the product..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <button type="button" onClick={handleGenerateAI} disabled={aiLoading} className="inline-flex items-center gap-2 border border-primary/30 text-primary px-4 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {aiLoading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Generating...</>
              ) : (
                <><span className="material-symbols-outlined text-base">auto_awesome</span>Generate AI Description</>
              )}
            </button>
            {aiDescription && (
              <div className="mt-3 rounded bg-surface/5 p-4 text-sm text-surface/70">
                <p className="text-[10px] font-label uppercase tracking-widest text-surface/40 mb-1">AI Description:</p>
                {aiDescription}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="availability" className={labelClass}>Availability</label>
            <select id="availability" className={selectClass} value={inStock ? "in_stock" : "out_of_stock"} onChange={(e) => setInStock(e.target.value === "in_stock")}>
              <option value="in_stock" className="bg-on-surface text-surface">In Stock</option>
              <option value="out_of_stock" className="bg-on-surface text-surface">Out of Stock</option>
            </select>
          </div>
          <div>
            <label htmlFor="heroImage" className={labelClass}>Hero Image URL <span className="text-surface/30">(optional)</span></label>
            <input id="heroImage" type="url" className={inputClass} placeholder="https://example.com/image.jpg" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFeatured(!featured)} className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-primary" : "bg-surface/20"}`}>
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface transition-transform shadow ${featured ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-surface/70">Featured Product</span>
          </div>
          <div>
            <label className={labelClass}>Specifications</label>
            {specs.map((spec, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input type="text" className={`${inputClass} flex-1`} placeholder="Key" value={spec.key} onChange={(e) => { const next = [...specs]; next[i] = { ...next[i], key: e.target.value }; setSpecs(next); }} />
                <input type="text" className={`${inputClass} flex-1`} placeholder="Value" value={spec.value} onChange={(e) => { const next = [...specs]; next[i] = { ...next[i], value: e.target.value }; setSpecs(next); }} />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="text-sm text-error/70 hover:text-error transition-colors px-2">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setSpecs([...specs, { key: "", value: "" }])} className="text-sm text-primary hover:text-primary-fixed transition-colors">
              + Add Specification
            </button>
          </div>
          <div>
            <label htmlFor="tags" className={labelClass}>Tags <span className="text-surface/30">(comma-separated)</span></label>
            <input id="tags" type="text" className={inputClass} placeholder="luxury, modern, stainless" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={handleDelete} disabled={deleting} className={`rounded px-6 py-2.5 text-sm font-label uppercase tracking-widest transition-all disabled:opacity-50 ${confirmDelete ? "bg-error text-on-error" : "border border-error/30 text-error hover:bg-error/10"}`}>
            {deleting ? "Deleting..." : confirmDelete ? "Confirm Delete" : "Delete Product"}
          </button>
          <button type="submit" disabled={submitting} className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded font-label text-xs uppercase tracking-widest shadow-[0_4px_20px_-4px_rgba(119,90,25,0.4)] hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
