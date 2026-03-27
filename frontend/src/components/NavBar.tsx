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

  return (
    <nav className="fixed top-0 w-full z-50 glass-header">
      <div className="flex justify-between items-center max-w-[1440px] mx-auto px-6 md:px-12 py-5">
        {/* Logo */}
        <Link
          href="/"
          className="font-headline text-2xl font-light tracking-tighter text-on-background"
        >
          DealerReach
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-headline text-sm uppercase tracking-wide text-on-background/70 hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="font-label text-xs uppercase tracking-widest text-on-background/70 hover:text-primary transition-colors duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="font-label text-xs uppercase tracking-widest text-on-background/50 hover:text-on-background transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="font-label text-xs uppercase tracking-widest text-on-background/70 hover:text-primary transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-on-primary px-6 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:scale-95 transition-all duration-200 shadow-sm active:scale-90"
              >
                Get Started Free
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="text-on-surface md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="glass-header px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-headline text-sm uppercase tracking-wide text-on-background/70"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-label text-sm text-on-background/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-left font-label text-sm text-on-background/50"
                >
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="font-label text-sm text-on-background/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="mt-2 inline-block bg-primary text-on-primary px-6 py-2.5 rounded text-center font-label text-xs uppercase tracking-widest"
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
