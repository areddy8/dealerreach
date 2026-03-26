"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const publicLinks = [
    { href: "#philosophy", label: "Collections" },
    { href: "#features", label: "Showrooms" },
    { href: "#brands", label: "Materials" },
    { href: "#about", label: "About" },
  ];

  const authLinks = [
    { href: "/inventory", label: "Inventory" },
    { href: "/clients", label: "Clients" },
    { href: "/curator", label: "Curator" },
  ];

  const navLinks = !loading && user ? authLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-50 bg-[#1A1A1A]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-serif)] text-xl tracking-wide text-[#FAF8F5]"
        >
          DealerReach
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm tracking-wide text-[#FAF8F5]/70 transition-colors hover:text-[#FAF8F5]"
            >
              {link.label}
            </Link>
          ))}

          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="text-sm tracking-wide text-[#FAF8F5]/70 transition-colors hover:text-[#FAF8F5]"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-sm tracking-wide text-[#FAF8F5]/50 transition-colors hover:text-[#FAF8F5]"
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="text-sm tracking-wide text-[#FAF8F5]/70 transition-colors hover:text-[#FAF8F5]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-[#B8965A] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#A07D48]"
              >
                Get Started Free
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="text-[#FAF8F5] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#FAF8F5]/10 bg-[#1A1A1A] px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-[#FAF8F5]/70"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-[#FAF8F5]/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-left text-sm text-[#FAF8F5]/50"
                >
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#FAF8F5]/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="mt-2 inline-block rounded bg-[#B8965A] px-5 py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
