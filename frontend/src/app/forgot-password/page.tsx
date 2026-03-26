"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="mt-6 rounded-lg border border-green-800 bg-green-900/30 px-4 py-4 text-sm text-green-400">
              If an account with that email exists, we&apos;ve sent you a reset
              link. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
