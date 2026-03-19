"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <span className="text-lg font-bold text-white">
            DealerReach<span className="text-blue-500">.io</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/new-request"
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                New Request
              </Link>
              <button
                onClick={logout}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-300"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/new-request" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>
                  New Request
                </Link>
                <button onClick={logout} className="text-left text-sm text-slate-400">
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
