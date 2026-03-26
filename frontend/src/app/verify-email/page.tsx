"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail, resendVerification } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified! You can now create quote requests.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  async function handleResend() {
    setResending(true);
    setResendMessage("");
    try {
      await resendVerification();
      setResendMessage("Verification email sent! Check your inbox.");
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : "Failed to resend verification email"
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Email Verification</h1>

        {status === "loading" && (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
          </div>
        )}

        {status === "success" && (
          <>
            <div className="mt-6 rounded-lg border border-emerald-800 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-400">
              {message}
            </div>
            <Link
              href="/inventory"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mt-6 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {message}
            </div>
            <Link
              href="/inventory"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "no-token" && (
          <>
            <p className="mt-4 text-sm text-slate-400">
              Check your email for a verification link.
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            {resendMessage && (
              <p className="mt-3 text-sm text-slate-400">{resendMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
