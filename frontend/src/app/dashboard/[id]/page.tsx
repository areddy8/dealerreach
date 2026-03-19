"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getQuoteRequest, getDealers, getReplies } from "@/lib/api";
import type { QuoteRequestDetail, Dealer, Reply } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DealerTable from "@/components/DealerTable";
import ReplyCard from "@/components/ReplyCard";
import LiveUpdater from "@/components/LiveUpdater";

const PIPELINE_STAGES = [
  { key: "searching", label: "Searching" },
  { key: "enriching", label: "Enriching" },
  { key: "sending", label: "Sending" },
  { key: "monitoring", label: "Monitoring" },
  { key: "completed", label: "Complete" },
] as const;

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
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error || "Quote request not found."}
        </div>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const dealerCount = dealers.length || qr.dealers.length;
  const replyCount = replies.length || qr.replies.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Back + Live */}
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
        <LiveUpdater quoteRequestId={id} onEvent={handleSSEEvent} />
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
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{dealerCount}</p>
              <p className="text-xs text-slate-500">Dealers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{replyCount}</p>
              <p className="text-xs text-slate-500">Replies</p>
            </div>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="mt-6">
          <PipelineProgress status={qr.status} />
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Dealer Replies ({replies.length})
          </h2>
          <div className="space-y-4">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} dealerName={
                dealers.find((d) => d.id === reply.dealer_id)?.name || "Unknown Dealer"
              } />
            ))}
          </div>
        </section>
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
