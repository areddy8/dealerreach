"use client";

import { useMemo } from "react";
import type { Reply, Dealer } from "@/lib/types";

interface ComparisonTableProps {
  replies: Reply[];
  dealers: Dealer[];
}

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

const ROW_LABELS = ["Price", "Lead Time", "Availability", "Summary"] as const;

export default function ComparisonTable({ replies, dealers }: ComparisonTableProps) {
  const columns = useMemo(() => {
    const dealerMap = new Map(dealers.map((d) => [d.id, d]));

    const matched = replies
      .map((reply) => ({
        reply,
        dealer: dealerMap.get(reply.dealer_id),
      }))
      .filter((c) => c.dealer != null) as { reply: Reply; dealer: Dealer }[];

    // Sort by price ascending (nulls last)
    const hasPrices = matched.some((c) => c.reply.parsed_price != null);
    if (hasPrices) {
      matched.sort((a, b) => {
        const ap = a.reply.parsed_price;
        const bp = b.reply.parsed_price;
        if (ap == null && bp == null) return 0;
        if (ap == null) return 1;
        if (bp == null) return -1;
        return ap - bp;
      });
    }

    return matched;
  }, [replies, dealers]);

  const lowestPrice = useMemo(() => {
    const prices = columns
      .map((c) => c.reply.parsed_price)
      .filter((p): p is number => p != null);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [columns]);

  if (columns.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
        <p className="text-slate-400">
          No quotes to compare yet. Quotes will appear here as dealers respond.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            {/* Sticky row-label column header */}
            <th className="sticky left-0 z-10 border-b border-r border-slate-700 bg-slate-900 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              &nbsp;
            </th>
            {columns.map(({ dealer }) => (
              <th
                key={dealer.id}
                className="border-b border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white"
              >
                <div>{dealer.name}</div>
                <div className="text-xs font-normal text-slate-500">
                  {dealer.city}, {dealer.state}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROW_LABELS.map((label) => (
            <tr key={label}>
              {/* Sticky first column */}
              <td className="sticky left-0 z-10 border-b border-r border-slate-700 bg-slate-900 px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                {label}
              </td>
              {columns.map(({ reply, dealer }) => {
                let content: string = "—";
                let isLowest = false;

                switch (label) {
                  case "Price":
                    if (reply.parsed_price != null) {
                      content = formatPrice(reply.parsed_price);
                      isLowest = lowestPrice != null && reply.parsed_price === lowestPrice;
                    }
                    break;
                  case "Lead Time":
                    content = reply.parsed_lead_time || "—";
                    break;
                  case "Availability":
                    content = reply.parsed_availability || "—";
                    break;
                  case "Summary":
                    content = reply.parsed_summary
                      ? truncate(reply.parsed_summary, 100)
                      : "—";
                    break;
                }

                return (
                  <td
                    key={`${dealer.id}-${label}`}
                    className={`border-b border-slate-700 px-4 py-3 text-sm ${
                      isLowest
                        ? "bg-emerald-900/30 font-semibold text-emerald-400"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
