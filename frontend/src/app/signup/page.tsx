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
      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] transition-colors";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-[#FAF8F5]">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-[#E8E4DE] bg-white p-8">
          <h1 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
            Begin Your Journey
          </h1>
          <p className="mt-2 text-sm text-[#6B6560]">
            Create your DealerReach account and elevate your showroom
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                className={inputClass}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
              >
                Company Name
              </label>
              <input
                id="company"
                type="text"
                required
                className={inputClass}
                placeholder="Your showroom or dealership"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className={inputClass}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#B8965A] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Begin Your Journey"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6560]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#B8965A] hover:text-[#A07D48] transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
