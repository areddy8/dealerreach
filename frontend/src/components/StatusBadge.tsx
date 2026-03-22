"use client";

import type { QuoteRequestStatus, OutreachStatus } from "@/lib/types";

type BadgeStatus = QuoteRequestStatus | OutreachStatus;

const config: Record<string, { bg: string; text: string; pulse?: boolean }> = {
  pending: { bg: "bg-slate-700", text: "text-slate-300" },
  searching: { bg: "bg-blue-900/60", text: "text-blue-400", pulse: true },
  enriching: { bg: "bg-blue-900/60", text: "text-blue-400", pulse: true },
  sending: { bg: "bg-blue-900/60", text: "text-blue-400", pulse: true },
  monitoring: { bg: "bg-amber-900/60", text: "text-amber-400" },
  completed: { bg: "bg-emerald-900/60", text: "text-emerald-400" },
  archived: { bg: "bg-slate-700", text: "text-slate-400" },
  failed: { bg: "bg-red-900/60", text: "text-red-400" },
  sent: { bg: "bg-blue-900/60", text: "text-blue-400" },
  replied: { bg: "bg-emerald-900/60", text: "text-emerald-400" },
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const c = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c.bg} ${c.text}`}
    >
      {c.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {status}
    </span>
  );
}
