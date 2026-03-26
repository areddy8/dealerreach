"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listClients } from "@/lib/api";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    listClients()
      .then(setClients)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load clients")
      )
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [clients, search]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] transition-colors text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
          Your Clients
        </h1>
        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#B8965A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48]"
        >
          Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-full sm:max-w-md`}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && clients.length === 0 && (
        <div className="mt-16 text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
            Build your client relationships
          </h2>
          <p className="mt-2 text-[#6B6560]">
            Add your first client to start managing projects and selections.
          </p>
          <Link
            href="/clients/new"
            className="mt-6 inline-flex items-center rounded-lg bg-[#B8965A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48]"
          >
            Add Your First Client
          </Link>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && filtered.length === 0 && clients.length > 0 && (
        <div className="mt-16 text-center">
          <p className="text-[#6B6560]">No clients match your search.</p>
        </div>
      )}

      {/* Client cards */}
      {!loading && filtered.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group rounded-xl border border-[#E8E4DE] bg-white p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
                {client.name}
              </h3>
              {client.company && (
                <p className="mt-0.5 text-sm text-[#6B6560]">
                  {client.company}
                </p>
              )}
              <div className="mt-3 space-y-1">
                <p className="text-sm text-[#1A1A1A]">{client.email}</p>
                {client.phone && (
                  <p className="text-sm text-[#6B6560]">{client.phone}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#6B6560]">
                <span>
                  Updated{" "}
                  {new Date(client.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
