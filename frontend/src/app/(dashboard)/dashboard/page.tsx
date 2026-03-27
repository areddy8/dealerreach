"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listProducts, listClients } from "@/lib/api";

const MOCK_LEADS = [
  {
    client: "Meridian Interiors",
    project: "Penthouse Collection",
    status: "Active" as const,
    value: "$284,000",
  },
  {
    client: "Harlow & Associates",
    project: "Gallery Renovation",
    status: "Pending" as const,
    value: "$156,500",
  },
  {
    client: "Castellane Group",
    project: "Heritage Suite",
    status: "Review" as const,
    value: "$412,000",
  },
  {
    client: "Voss Design Studio",
    project: "Lakeside Residence",
    status: "Active" as const,
    value: "$97,200",
  },
];

const MOCK_AGENDA = [
  {
    time: "10:30 AM",
    title: "Meridian Interiors — Final Selection",
    type: "Consultation",
  },
  {
    time: "1:00 PM",
    title: "New Arrivals Photography",
    type: "Internal",
  },
  {
    time: "3:30 PM",
    title: "Castellane Group — Project Brief",
    type: "Consultation",
  },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-900/30 text-green-300",
  Pending: "bg-yellow-900/30 text-yellow-300",
  Review: "bg-blue-900/30 text-blue-300",
};

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
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/40">
          Welcome back
        </span>
        <h1 className="font-headline text-4xl md:text-5xl font-light text-[#fbf9f4] mt-2 tracking-tight">
          Curated <span className="italic text-primary">Progress</span>
        </h1>
      </div>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Showroom Engagement */}
        <div className="md:col-span-2 bg-[#252622] rounded-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">
              storefront
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/40">
              Showroom Engagement
            </span>
          </div>
          <p className="font-headline text-5xl font-light text-[#fbf9f4]">
            {productCount !== null ? productCount : "..."}
          </p>
          {/* Progress bar */}
          <div className="bg-[#363733] rounded-full h-1.5 mt-4">
            <div
              className="bg-[#775a19] h-1.5 rounded-full"
              style={{ width: "73%" }}
            />
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1 mt-4 text-xs uppercase tracking-widest text-primary hover:text-[#c5a059] transition-colors"
          >
            View Collection
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Client Leads */}
        <div className="bg-[#252622] rounded-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">
              people
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/40">
              Client Leads
            </span>
          </div>
          <p className="font-headline text-5xl font-light text-[#fbf9f4]">
            {clientCount !== null ? clientCount : "..."}
          </p>
          <p className="text-xs text-green-400 mt-2">+12% this month</p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 mt-4 text-xs uppercase tracking-widest text-primary hover:text-[#c5a059] transition-colors"
          >
            Manage
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Premier Status */}
        <div className="bg-[#775a19] rounded-lg p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
            Atelier Status
          </span>
          <p className="font-headline text-2xl font-light text-white mt-2">
            {user?.subscription_tier
              ? user.subscription_tier.charAt(0).toUpperCase() +
                user.subscription_tier.slice(1)
              : "Premier"}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {user?.company_name || "Your Showroom"}
          </p>
          <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white mt-4 inline-block">
            92%
          </span>
        </div>
      </div>

      {/* Leads Table + Atelier Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Leads Table */}
        <div className="lg:col-span-2 bg-[#252622] rounded-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl font-light text-[#fbf9f4]">
              Recent Leads
            </h2>
            <Link
              href="/clients"
              className="text-xs uppercase tracking-widest text-primary hover:text-[#c5a059] transition-colors"
            >
              View All
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fbf9f4]/5">
                <th className="text-left text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/30 pb-3">
                  Client
                </th>
                <th className="text-left text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/30 pb-3">
                  Project
                </th>
                <th className="text-left text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/30 pb-3">
                  Status
                </th>
                <th className="text-right text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/30 pb-3">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead, i) => (
                <tr
                  key={i}
                  className="border-b border-[#fbf9f4]/5 last:border-0"
                >
                  <td className="py-3 text-sm text-[#fbf9f4]/70">
                    {lead.client}
                  </td>
                  <td className="py-3 text-sm text-[#fbf9f4]/70">
                    {lead.project}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${STATUS_STYLES[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-[#fbf9f4]/70 text-right">
                    {lead.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Atelier Agenda */}
        <div className="bg-[#252622] rounded-lg p-6 md:p-8">
          <h2 className="font-headline text-2xl font-light text-[#fbf9f4] mb-6">
            Atelier Agenda
          </h2>
          <div>
            {MOCK_AGENDA.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 py-3 border-b border-[#fbf9f4]/5 last:border-0"
              >
                <span className="text-xs text-[#fbf9f4]/30 whitespace-nowrap pt-0.5">
                  {item.time}
                </span>
                <div>
                  <p className="text-sm text-[#fbf9f4]/70">{item.title}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/30 mt-1">
                    {item.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
