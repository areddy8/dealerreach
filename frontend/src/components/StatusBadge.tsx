"use client";

type BadgeStatus = "draft" | "active" | "review" | "approved" | "completed" | "in_stock" | "out_of_stock";

const config: Record<string, { bg: string; text: string; pulse?: boolean }> = {
  draft: { bg: "bg-[#F0EDE8]", text: "text-[#6B6560]" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700" },
  review: { bg: "bg-amber-50", text: "text-amber-700", pulse: true },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { bg: "bg-[#F0EDE8]", text: "text-[#1A1A1A]" },
  in_stock: { bg: "bg-emerald-50", text: "text-emerald-700" },
  out_of_stock: { bg: "bg-red-50", text: "text-red-700" },
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const c = config[status] || config.draft;

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
      {status.replace("_", " ")}
    </span>
  );
}
