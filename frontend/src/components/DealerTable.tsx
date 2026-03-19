"use client";

import type { Dealer } from "@/lib/types";

interface DealerTableProps {
  dealers: Dealer[];
}

export default function DealerTable({ dealers }: DealerTableProps) {
  if (dealers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-slate-400">
          No dealers found yet. The pipeline will discover dealers automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      {/* Desktop table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          {dealers.map((d) => (
            <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3 font-medium text-white">{d.name}</td>
              <td className="px-4 py-3 text-slate-300">
                {[d.city, d.state].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="px-4 py-3 text-slate-300">{d.phone || "—"}</td>
              <td className="px-4 py-3 text-slate-300">
                {d.email ? (
                  <a
                    href={`mailto:${d.email}`}
                    className="text-blue-400 hover:underline"
                  >
                    {d.email}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                {d.website ? (
                  <a
                    href={d.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Visit
                  </a>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs capitalize">
                {d.source || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="divide-y divide-slate-800 md:hidden">
        {dealers.map((d) => (
          <div key={d.id} className="bg-slate-900 p-4 space-y-2">
            <p className="font-medium text-white">{d.name}</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              <span>Location</span>
              <span className="text-slate-300">
                {[d.city, d.state].filter(Boolean).join(", ") || "—"}
              </span>
              <span>Phone</span>
              <span className="text-slate-300">{d.phone || "—"}</span>
              <span>Email</span>
              <span className="text-slate-300 truncate">
                {d.email || "—"}
              </span>
              <span>Source</span>
              <span className="text-slate-300 capitalize">
                {d.source || "—"}
              </span>
            </div>
            {d.website && (
              <a
                href={d.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-blue-400 hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
