"use client";

import { useState } from "react";
import type { Reply } from "@/lib/types";

interface ReplyCardProps {
  reply: Reply;
  dealerName?: string;
}

export default function ReplyCard({ reply, dealerName }: ReplyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const receivedDate = new Date(reply.received_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  const now = new Date();
  const expiresAt = reply.expires_at ? new Date(reply.expires_at) : null;
  const isExpired = expiresAt ? expiresAt < now : false;
  const expiresDateStr = expiresAt
    ? expiresAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">{dealerName || "Dealer"}</h4>
          <p className="text-xs text-slate-500">{receivedDate}</p>
          {expiresAt && (
            isExpired ? (
              <span className="inline-block mt-1 rounded bg-red-900/50 border border-red-800 px-2 py-0.5 text-xs font-medium text-red-400">
                Expired
              </span>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Expires: {expiresDateStr}
              </p>
            )
          )}
        </div>
        {reply.parsed_price != null && (
          <div className="rounded-lg bg-emerald-900/40 border border-emerald-800 px-3 py-1.5">
            <p className="text-lg font-bold text-emerald-400">
              ${Number(reply.parsed_price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {reply.parsed_lead_time && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Lead Time
            </p>
            <p className="text-sm text-slate-300">{reply.parsed_lead_time}</p>
          </div>
        )}
        {reply.parsed_availability && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Availability
            </p>
            <p className="text-sm text-slate-300">
              {reply.parsed_availability}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {reply.parsed_summary && (
        <p className="text-sm text-slate-300 leading-relaxed">
          {reply.parsed_summary}
        </p>
      )}

      {/* Raw body toggle */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expanded ? "Hide raw message" : "Show raw message"}
        </button>
        {expanded && (
          <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-400 whitespace-pre-wrap border border-slate-800">
            {reply.raw_body}
          </pre>
        )}
      </div>
    </div>
  );
}
