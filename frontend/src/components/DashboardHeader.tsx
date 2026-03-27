"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/inventory", label: "Showroom", icon: "storefront" },
  { href: "/clients", label: "Clients", icon: "people" },
  { href: "/curator", label: "Curator", icon: "auto_awesome" },
  { href: "/profile", label: "Profile", icon: "person" },
];

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    inventory: "Showroom Flow",
    clients: "Client Leads",
    curator: "AI Curator",
    profile: "Profile",
    new: "New",
  };
  return segments.map((s) => labels[s] || s).join(" / ");
}

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-50 glass-header-dark">
        <div className="flex items-center justify-between px-6 md:px-8 py-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-surface/70 hover:text-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:block">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-surface/40">
              {getBreadcrumb(pathname)}
            </span>
          </div>

          {/* Center brand (mobile) */}
          <span className="lg:hidden font-headline text-xl italic text-primary">
            DealerReach
          </span>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="text-surface/50 hover:text-surface transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button className="text-surface/50 hover:text-surface transition-colors">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            {user && (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="text-on-primary-container text-xs font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-medium text-surface">{user.name}</p>
                  <p className="text-[10px] text-surface/40">{user.company_name || "Atelier Member"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-on-surface/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-on-surface p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="font-headline text-xl font-light text-surface">The Atelier</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-surface/50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-surface/60 hover:text-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="font-label text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-surface/40 hover:text-surface/70 font-label text-xs uppercase tracking-widest mt-auto pt-6 border-t border-surface/10"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
