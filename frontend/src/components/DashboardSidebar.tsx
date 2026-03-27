"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/inventory", label: "Showroom Flow", icon: "storefront" },
  { href: "/clients", label: "Client Leads", icon: "people" },
  { href: "/curator", label: "AI Curator", icon: "auto_awesome" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-72 bg-on-surface text-surface">
      {/* Logo */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-container/20">
            <span className="material-symbols-outlined text-primary text-xl">architecture</span>
          </div>
          <div>
            <span className="font-headline text-xl font-light tracking-tight text-surface">
              The Atelier
            </span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-surface/40 mt-0.5">
              Luxury Operations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
              isActive(item.href)
                ? "bg-primary/10 text-primary border-r-4 border-primary"
                : "text-surface/60 hover:text-surface hover:bg-surface/5"
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
          className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-3 rounded font-label text-xs uppercase tracking-widest hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Consultation
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-surface/10">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-surface/40 hover:text-surface/70 transition-colors font-label text-xs uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
