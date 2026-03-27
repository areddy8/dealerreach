"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
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
        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed text-lg">architecture</span>
              </div>
              <span className="font-headline text-lg text-white/80 tracking-tight">DealerReach</span>
            </div>
            <h1 className="font-headline text-5xl text-white font-light leading-[1.15] tracking-tight">
              Begin Your<br />
              <span className="italic text-primary-fixed">Atelier Journey</span>
            </h1>
            <p className="mt-6 text-white/60 text-base max-w-md leading-relaxed">
              Join the exclusive network of luxury dealers who elevate their digital presence through editorial craft.
            </p>
          </div>
        </div>
      </section>

      {/* Right: Sign Up Form */}
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
              Create Account
            </h2>
            <p className="mt-2 text-on-surface-variant text-sm">
              Set up your atelier workspace in moments
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
                htmlFor="name"
                className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company"
                className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70"
              >
                Company / Showroom
              </label>
              <input
                id="company"
                type="text"
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                placeholder="Your dealership or showroom name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70"
              >
                Professional Email
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
                Security Key
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded font-label text-xs uppercase tracking-widest shadow-[0_4px_20px_-4px_rgba(119,90,25,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(119,90,25,0.5)] hover:scale-[0.98] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Begin Your Journey"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-xs text-on-surface-variant/50 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          {/* SSO / Biometric */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 bg-surface-container rounded py-3 px-6 flex items-center justify-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-lg">fingerprint</span>
              Biometric
            </button>
            <button
              type="button"
              className="flex-1 bg-surface-container rounded py-3 px-6 flex items-center justify-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-lg">passkey</span>
              SSO
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-container transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
