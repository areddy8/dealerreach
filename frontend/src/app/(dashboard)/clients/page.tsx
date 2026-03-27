"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { listClients } from "@/lib/api";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
            Client Leads
          </span>
          <h1 className="font-headline text-3xl font-light text-surface mt-1">
            Your Clients
          </h1>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md bg-transparent border-0 border-b border-surface/20 py-3 px-0 text-sm text-surface placeholder-surface/30 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {error && (
        <div className="rounded bg-error-container/20 px-4 py-3 text-sm text-error mb-6">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-surface/20 mb-4 block">people</span>
          <h2 className="font-headline text-2xl text-surface">Build your client relationships</h2>
          <p className="mt-2 text-surface/50">Add your first client to start managing projects and selections.</p>
          <Link href="/clients/new" className="mt-6 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-label text-xs uppercase tracking-widest">
            Add Your First Client
          </Link>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && clients.length > 0 && (
        <div className="py-16 text-center">
          <p className="text-surface/50">No clients match your search.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group bg-surface/5 rounded-lg p-6 hover:bg-surface/8 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium text-sm">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-lg text-surface truncate">{client.name}</h3>
                  {client.company && (
                    <p className="text-sm text-surface/50 truncate">{client.company}</p>
                  )}
                  <p className="mt-2 text-sm text-surface/70">{client.email}</p>
                  {client.phone && <p className="text-sm text-surface/40">{client.phone}</p>}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface/10 text-xs text-surface/30">
                Updated {new Date(client.updated_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
