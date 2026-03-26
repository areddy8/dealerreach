"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PortalProduct {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    brand: string;
    model?: string;
    description?: string;
    ai_description?: string;
    price?: number;
    image_urls: string[];
  };
  notes?: string;
  quantity: number;
  approved: boolean;
  custom_price?: number;
}

interface PortalData {
  project_name: string;
  project_status: string;
  dealer_company: string;
  client_name: string;
  products: PortalProduct[];
}

export default function ClientPortalPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!params.token) return;
    fetch(`${API_URL}/portal/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Portal not found or link expired");
        return res.json();
      })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load portal")
      )
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleApprove() {
    if (!params.token) return;
    setApproving(true);
    try {
      const res = await fetch(`${API_URL}/portal/${params.token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve selections");
      setApproved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve selections"
      );
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
            {error || "Portal not found"}
          </h1>
          <p className="mt-2 text-sm text-[#6B6560]">
            Please check your link and try again.
          </p>
        </div>
      </div>
    );
  }

  const total = data.products.reduce((sum, pp) => {
    const price = pp.custom_price ?? pp.product?.price;
    return sum + (price ? price * pp.quantity : 0);
  }, 0);

  const canApprove =
    !approved &&
    (data.project_status === "review" || data.project_status === "active");

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#E8E4DE] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B8965A]">
            {data.dealer_company}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
            Client Portal
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
              {data.project_name}
            </span>
            <span className="rounded-full bg-[#F0EDE8] px-2.5 py-0.5 text-xs font-medium text-[#6B6560]">
              {data.project_status.charAt(0).toUpperCase() +
                data.project_status.slice(1)}
            </span>
          </div>
        </div>
      </header>

      {/* Products */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {approved && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Selections approved successfully. Thank you!
          </div>
        )}

        {data.products.length === 0 ? (
          <p className="text-center text-[#6B6560]">
            No products have been added to this project yet.
          </p>
        ) : (
          <div className="space-y-6">
            {data.products.map((pp) => (
              <div
                key={pp.id}
                className="overflow-hidden rounded-xl border border-[#E8E4DE] bg-white"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="aspect-square w-full sm:w-72 flex-shrink-0">
                    {pp.product?.image_urls &&
                    pp.product.image_urls.length > 0 ? (
                      <img
                        src={pp.product.image_urls[0]}
                        alt={pp.product?.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0EDE8] to-[#E8E4DE]">
                        <span className="text-5xl text-[#6B6560]/20">
                          {pp.product?.brand?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B8965A]">
                      {pp.product?.brand}
                    </p>
                    <h3 className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                      {pp.product?.name}
                    </h3>
                    {pp.product?.model && (
                      <p className="mt-0.5 text-sm text-[#6B6560]">
                        Model: {pp.product.model}
                      </p>
                    )}

                    {(pp.product?.description || pp.product?.ai_description) && (
                      <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">
                        {pp.product.ai_description || pp.product.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      {(pp.custom_price ?? pp.product?.price) ? (
                        <span className="font-medium text-[#1A1A1A]">
                          $
                          {(
                            pp.custom_price ?? pp.product?.price ?? 0
                          ).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#6B6560]">
                          Contact for Pricing
                        </span>
                      )}
                      {pp.quantity > 1 && (
                        <span className="text-[#6B6560]">
                          Qty: {pp.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {data.products.length > 0 && total > 0 && (
          <div className="mt-8 flex justify-end rounded-xl border border-[#E8E4DE] bg-white p-6">
            <div className="text-right">
              <p className="text-sm text-[#6B6560]">Estimated Total</p>
              <p className="mt-1 font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Approve button */}
        {canApprove && data.products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="rounded-lg bg-[#B8965A] px-10 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approving ? "Approving..." : "Approve Selections"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DE] py-8 text-center">
        <p className="text-xs text-[#6B6560]">Powered by DealerReach</p>
      </footer>
    </div>
  );
}
