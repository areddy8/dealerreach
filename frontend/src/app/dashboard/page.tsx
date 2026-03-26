"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listQuoteRequests, archiveQuoteRequest, deleteQuoteRequest, resendVerification } from "@/lib/api";
import type { QuoteRequest, QuoteRequestStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

type StatusFilter = "all" | "active" | "completed" | "archived";
type SortOption = "newest" | "oldest" | "most_replies";

const ACTIVE_STATUSES: QuoteRequestStatus[] = [
  "pending",
  "searching",
  "enriching",
  "sending",
  "monitoring",
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "most_replies", label: "Most Replies" },
];

const CATEGORY_CARDS = [
  {
    name: "Kitchen Appliances",
    description: "Ranges, refrigerators, dishwashers, and more from top brands",
  },
  {
    name: "Fireplaces & Inserts",
    description: "Gas, electric, and wood-burning fireplaces and inserts",
  },
  {
    name: "Hot Tubs & Spas",
    description: "Premium hot tubs and swim spas for your backyard retreat",
  },
  {
    name: "Outdoor Kitchens",
    description: "Grills, pizza ovens, and outdoor kitchen components",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);

  const fetchRequests = () => {
    setError("");
    setLoading(true);
    listQuoteRequests(statusFilter === "archived")
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  // Re-fetch when switching to/from archived filter
  useEffect(() => {
    if (!user || authLoading) return;
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...requests];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((r) => ACTIVE_STATUSES.includes(r.status));
    } else if (statusFilter === "completed") {
      result = result.filter((r) => r.status === "completed");
    } else if (statusFilter === "archived") {
      result = result.filter((r) => r.status === "archived");
    } else {
      // "all" — show non-archived
      result = result.filter((r) => r.status !== "archived");
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.product_name.toLowerCase().includes(q) ||
          (r.brand && r.brand.toLowerCase().includes(q)) ||
          r.reference_code.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "most_replies") {
      result.sort((a, b) => b.reply_count - a.reply_count);
    }

    return result;
  }, [requests, searchQuery, statusFilter, sortBy]);

  const handleArchive = async (id: string) => {
    setOpenMenuId(null);
    try {
      await archiveQuoteRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive request");
    }
  };

  const handleDelete = async (id: string) => {
    setOpenMenuId(null);
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteQuoteRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request");
    }
  };

  if (authLoading || (!user && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  const hasAnyRequests = requests.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Requests</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track and manage your dealer pricing requests
          </p>
        </div>
        <Link
          href="/new-request"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          New Request
        </Link>
      </div>

      {user && !user.email_verified && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-700 bg-amber-900/30 px-4 py-3 text-sm text-amber-300">
          <span>Please verify your email to create quote requests.</span>
          <button
            onClick={async () => {
              setResendingVerification(true);
              try {
                await resendVerification();
                setVerificationResent(true);
              } catch {
                // silently fail
              } finally {
                setResendingVerification(false);
              }
            }}
            disabled={resendingVerification || verificationResent}
            className="ml-4 flex-shrink-0 rounded-md bg-amber-900/50 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-900/80 disabled:opacity-50"
          >
            {verificationResent ? "Email sent" : resendingVerification ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            onClick={fetchRequests}
            className="ml-4 flex-shrink-0 rounded-md bg-red-900/50 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/80 hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        </div>
      ) : !hasAnyRequests && statusFilter !== "archived" ? (
        /* Improved empty state when there are truly no requests */
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
            <svg
              className="h-10 w-10 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">
            No quote requests yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Start comparing renovation quotes from Bay Area dealers
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.name}
                href="/new-request"
                className="group rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/60"
              >
                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative mt-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, brand, or reference code..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status filter chips + Sort */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === f.key
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 outline-none transition-colors focus:border-blue-500"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="mt-4 text-sm text-slate-500">
            Showing {filteredAndSorted.length} of {requests.length} requests
          </p>

          {/* Request list */}
          {filteredAndSorted.length === 0 ? (
            <div className="mt-12 text-center">
              <svg
                className="mx-auto h-10 w-10 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="mt-3 text-sm text-slate-400">
                No requests match your filters
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {filteredAndSorted.map((qr) => (
                <div
                  key={qr.id}
                  className="relative rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
                >
                  <Link
                    href={`/dashboard/${qr.id}`}
                    className="block"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="truncate font-semibold text-white">
                            {qr.product_name}
                          </h3>
                          <StatusBadge status={qr.status} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                          {qr.brand && <span>{qr.brand}</span>}
                          <span className="font-mono text-xs text-slate-500">
                            #{qr.reference_code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pr-8 text-sm text-slate-400">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-white">
                            {qr.dealer_count}
                          </p>
                          <p className="text-xs text-slate-500">Dealers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-emerald-400">
                            {qr.reply_count}
                          </p>
                          <p className="text-xs text-slate-500">Replies</p>
                        </div>
                        <div className="hidden text-right text-xs text-slate-500 sm:block">
                          {new Date(qr.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute right-4 top-4" ref={openMenuId === qr.id ? menuRef : undefined}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === qr.id ? null : qr.id);
                      }}
                      className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openMenuId === qr.id && (
                      <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleArchive(qr.id);
                          }}
                          className="flex w-full items-center px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
                        >
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(qr.id);
                          }}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-400 transition-colors hover:bg-slate-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
