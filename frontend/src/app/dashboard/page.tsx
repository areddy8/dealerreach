"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listQuoteRequests, archiveQuoteRequest, deleteQuoteRequest } from "@/lib/api";
import type { QuoteRequest } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchRequests = () => {
    setError("");
    setLoading(true);
    listQuoteRequests()
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      ) : requests.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
            <svg
              className="h-8 w-8 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">
            No requests yet
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Create your first quote request to start getting dealer prices.
          </p>
          <Link
            href="/new-request"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((qr) => (
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
    </div>
  );
}
