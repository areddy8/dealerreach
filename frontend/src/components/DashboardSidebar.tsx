"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/inventory", label: "Showroom Flow", icon: "storefront" },
  { href: "/inventory", label: "Material Library", icon: "palette", key: "material-library" },
  { href: "/clients", label: "Client Leads", icon: "people" },
  { href: "/curator", label: "AI Curator", icon: "auto_awesome" },
  { href: "/dashboard", label: "Staff Schedule", icon: "calendar_month", key: "staff-schedule" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(item: (typeof navItems)[number]) {
    if (item.key === "staff-schedule" || item.key === "material-library") return false;
    if (item.href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-72 bg-[#1b1c19] text-[#fbf9f4]">
      {/* Logo */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#775a19]/20">
            <span className="material-symbols-outlined text-[#775a19] text-xl">architecture</span>
          </div>
          <div>
            <span className="font-headline text-xl font-light tracking-tight text-[#fbf9f4]">
              The Atelier
            </span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#fbf9f4]/40 mt-0.5">
              Luxury Operations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.key || item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
              isActive(item)
                ? "bg-[#775a19]/10 text-[#775a19]"
                : "text-[#fbf9f4]/60 hover:text-[#fbf9f4] hover:bg-[#fbf9f4]/5"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-label text-sm tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* New Consultation CTA */}
      <div className="px-6 pb-4">
        <Link
          href="/clients"
          className="flex items-center justify-center gap-2 w-full bg-[#775a19] text-white py-3 rounded font-label text-xs uppercase tracking-widest hover:bg-[#775a19]/80 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Consultation
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-[#fbf9f4]/10 flex items-center gap-6">
        <button className="flex items-center gap-2 text-[#fbf9f4]/40 hover:text-[#fbf9f4]/70 transition-colors font-label text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-base">help</span>
          Support
        </button>
        <button className="flex items-center gap-2 text-[#fbf9f4]/40 hover:text-[#fbf9f4]/70 transition-colors font-label text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-base">archive</span>
          Archive
        </button>
      </div>
    </aside>
  );
}
