"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left: Hero Image */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-on-surface via-on-surface/80 to-primary/40" />
        <div className="absolute inset-0 bg-on-surface/10 mix-blend-multiply" />
        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed text-lg">architecture</span>
              </div>
              <span className="font-headline text-lg text-white/80 tracking-tight">DealerReach</span>
            </div>
            <h1 className="font-headline text-5xl text-white font-light leading-[1.15] tracking-tight">
              Where Craft Meets<br />
              <span className="italic text-primary-fixed">Digital Excellence</span>
            </h1>
            <p className="mt-6 text-white/60 text-base max-w-md leading-relaxed">
              The editorial platform for luxury showrooms to curate, present, and connect with discerning clientele.
            </p>
          </div>
        </div>
      </section>

      {/* Right: Sign In Form */}
      <main className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-surface">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <span className="font-headline text-2xl font-light tracking-tighter text-on-surface">
              DealerReach
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline text-3xl font-light text-on-surface tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-on-surface-variant text-sm">
              Sign in to access your atelier workspace
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded bg-error-container/50 px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-none border-outline-variant/30 text-primary focus:ring-primary/20" />
                <span className="text-xs text-on-surface-variant">Remember session</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:text-primary-container transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded font-label text-xs uppercase tracking-widest shadow-[0_4px_20px_-4px_rgba(119,90,25,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(119,90,25,0.5)] hover:scale-[0.98] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In to Atelier"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary-container transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
