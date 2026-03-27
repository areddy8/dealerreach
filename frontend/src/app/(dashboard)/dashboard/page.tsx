"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listProducts, listClients } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);

  useEffect(() => {
    listProducts()
      .then((p) => setProductCount(p.length))
      .catch(() => setProductCount(0));
    listClients()
      .then((c) => setClientCount(c.length))
      .catch(() => setClientCount(0));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* Greeting */}
      <div className="mb-12">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
          Welcome back
        </span>
        <h1 className="font-headline text-4xl md:text-5xl font-light text-surface mt-2 tracking-tight">
          Curated <span className="italic text-primary">Progress</span>
        </h1>
      </div>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Showroom Products */}
        <div className="md:col-span-2 bg-surface/5 rounded-lg p-8 editorial-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
              Showroom Products
            </span>
          </div>
          <p className="font-headline text-5xl font-light text-surface">
            {productCount !== null ? productCount : "..."}
          </p>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1 mt-4 font-label text-xs uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors"
          >
            View Collection
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Active Clients */}
        <div className="bg-surface/5 rounded-lg p-8 editorial-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">people</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
              Client Leads
            </span>
          </div>
          <p className="font-headline text-5xl font-light text-surface">
            {clientCount !== null ? clientCount : "..."}
          </p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 mt-4 font-label text-xs uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors"
          >
            Manage
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Premier Status */}
        <div className="bg-primary rounded-lg p-8">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-primary/70">
            Atelier Status
          </span>
          <p className="font-headline text-2xl font-light text-on-primary mt-2">
            {user?.subscription_tier
              ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)
              : "Premier"}
          </p>
          <p className="text-xs text-on-primary/60 mt-1">
            {user?.company_name || "Your Showroom"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="font-headline text-2xl font-light text-surface mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/inventory/new"
            className="group bg-surface/5 rounded-lg p-6 hover:bg-surface/8 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-3 block">add_circle</span>
            <h3 className="font-headline text-lg text-surface">Add Product</h3>
            <p className="text-sm text-surface/40 mt-1">
              List a new piece in your showroom collection
            </p>
          </Link>
          <Link
            href="/curator"
            className="group bg-surface/5 rounded-lg p-6 hover:bg-surface/8 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-3 block">auto_awesome</span>
            <h3 className="font-headline text-lg text-surface">AI Curator</h3>
            <p className="text-sm text-surface/40 mt-1">
              Get intelligent product recommendations
            </p>
          </Link>
          <Link
            href="/clients"
            className="group bg-surface/5 rounded-lg p-6 hover:bg-surface/8 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-3 block">person_add</span>
            <h3 className="font-headline text-lg text-surface">New Client</h3>
            <p className="text-sm text-surface/40 mt-1">
              Add a client to start a curated project
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
