"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getQuoteRequest, getDealers, getReplies, getExportPdfUrl } from "@/lib/api";
import type { QuoteRequestDetail, Dealer, Reply } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DealerTable from "@/components/DealerTable";
import ReplyCard from "@/components/ReplyCard";
import ComparisonTable from "@/components/ComparisonTable";
import LiveUpdater from "@/components/LiveUpdater";
import dynamic from "next/dynamic";

type ViewMode = "cards" | "compare";
type SortBy = "price_asc" | "price_desc" | "newest" | "lead_time";
type FilterBy = "all" | "has_price" | "has_availability";

const DealerMap = dynamic(() => import("@/components/DealerMap"), { ssr: false });

const PIPELINE_STAGES = [
  { key: "searching", label: "Searching" },
  { key: "enriching", label: "Enriching" },
  { key: "sending", label: "Sending" },
  { key: "monitoring", label: "Monitoring" },
  { key: "completed", label: "Complete" },
] as const;

function getStageDescription(
  status: string,
  zipCode?: string,
  dealerCount?: number,
): string {
  switch (status) {
    case "pending":
      return "Queued — starting pipeline...";
    case "searching":
      return `Searching for dealers${zipCode ? ` near ${zipCode}` : ""}...`;
    case "enriching":
      return `Gathering contact info for${dealerCount ? ` ${dealerCount}` : ""} dealers...`;
    case "sending":
      return `Sending outreach emails to${dealerCount ? ` ${dealerCount}` : ""} dealers...`;
    case "monitoring":
      return "Monitoring for dealer replies...";
    case "completed":
      return "All done! Check your quotes below.";
    case "failed":
      return "Something went wrong during processing.";
    default:
      return "";
  }
}

const ACTIVE_STATUSES = new Set(["pending", "searching", "enriching", "sending"]);

function PipelineProgress({ status }: { status: string }) {
  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage, i) => {
        const isActive = i === stageIndex;
        const isComplete = i < stageIndex || status === "completed";
        const isFailed = status === "failed";

        let bgColor = "bg-slate-700";
        if (isFailed && i <= stageIndex) bgColor = "bg-red-500";
        else if (isComplete) bgColor = "bg-emerald-500";
        else if (isActive) bgColor = "bg-blue-500";

        return (
          <div key={stage.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`h-2 w-full rounded-full transition-colors ${bgColor} ${
                isActive && !isFailed ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`text-[10px] font-medium sm:text-xs ${
                isActive || isComplete
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function QuoteRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [qr, setQr] = useState<QuoteRequestDetail | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");

  const fetchAll = useCallback(async () => {
    try {
      const [qrData, dealerData, replyData] = await Promise.all([
        getQuoteRequest(id),
        getDealers(id),
        getReplies(id),
      ]);
      setQr(qrData);
      setDealers(dealerData);
      setReplies(replyData);
    } catch (err) {
      // Don't overwrite data with error on polling failures
      if (!qr) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, qr]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchAll();
  }, [user, authLoading, router, fetchAll]);

  const handleSSEEvent = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  const isActive = qr ? ACTIVE_STATUSES.has(qr.status) : false;

  const filteredAndSortedReplies = useMemo(() => {
    let result = [...replies];

    // Filter
    if (filterBy === "has_price") {
      result = result.filter((r) => r.parsed_price != null);
    } else if (filterBy === "has_availability") {
      result = result.filter((r) => r.parsed_availability != null);
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          if (a.parsed_price == null && b.parsed_price == null) return 0;
          if (a.parsed_price == null) return 1;
          if (b.parsed_price == null) return -1;
          return a.parsed_price - b.parsed_price;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          if (a.parsed_price == null && b.parsed_price == null) return 0;
          if (a.parsed_price == null) return 1;
          if (b.parsed_price == null) return -1;
          return b.parsed_price - a.parsed_price;
        });
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
        );
        break;
      case "lead_time":
        result.sort((a, b) => {
          const al = a.parsed_lead_time || "";
          const bl = b.parsed_lead_time || "";
          return al.localeCompare(bl);
        });
        break;
    }

    return result;
  }, [replies, sortBy, filterBy]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          <span>{error || "Quote request not found."}</span>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              fetchAll();
            }}
            className="ml-4 flex-shrink-0 rounded-md bg-red-900/50 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/80 hover:text-red-200"
          >
            Retry
          </button>
        </div>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const dealerCount = dealers.length;
  const replyCount = replies.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Back */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{qr.product_name}</h1>
              <StatusBadge status={qr.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              {qr.brand && <span>Brand: {qr.brand}</span>}
              <span>ZIP: {qr.zip_code}</span>
              <span>Radius: {qr.radius_miles} mi</span>
              <span className="font-mono text-xs text-slate-500">
                #{qr.reference_code}
              </span>
            </div>
            {qr.specs && (
              <p className="mt-2 text-sm text-slate-400">{qr.specs}</p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{dealerCount}</p>
              <p className="text-xs text-slate-500">Dealers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{replyCount}</p>
              <p className="text-xs text-slate-500">Replies</p>
            </div>
            <button
              onClick={() => window.open(getExportPdfUrl(id), '_blank')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="mt-6">
          <PipelineProgress status={qr.status} />
          <p className="mt-2 text-center text-xs text-slate-500">
            {getStageDescription(qr.status, qr.zip_code, dealerCount)}
          </p>
        </div>

        {/* Live updater with activity log */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <LiveUpdater
            quoteRequestId={id}
            onEvent={handleSSEEvent}
            isActive={isActive}
          />
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <section className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Dealer Replies ({replies.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* View toggle */}
              <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("compare")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === "compare"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Compare
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="lead_time">Lead Time</option>
              </select>

              {/* Filter dropdown */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="has_price">Has Price</option>
                <option value="has_availability">Has Availability</option>
              </select>
            </div>
          </div>

          {viewMode === "compare" ? (
            <ComparisonTable replies={filteredAndSortedReplies} dealers={dealers} />
          ) : (
            <div className="space-y-4">
              {filteredAndSortedReplies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  dealerName={
                    dealers.find((d) => d.id === reply.dealer_id)?.name ||
                    "Unknown Dealer"
                  }
                />
              ))}
              {filteredAndSortedReplies.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
                  <p className="text-slate-400">
                    No replies match the current filter.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Dealer map */}
      {dealers.length > 0 && (
        <DealerMap dealers={dealers} zipCode={qr.zip_code} />
      )}

      {/* Dealers table */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Dealers ({dealers.length})
        </h2>
        <DealerTable dealers={dealers} />
      </section>
    </div>
  );
}
