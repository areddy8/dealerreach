"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QuoteRequestForm from "@/components/QuoteRequestForm";

export default function NewRequestPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Quote Request</h1>
        <p className="mt-2 text-sm text-slate-400">
          Tell us what product you need pricing on and we will contact local
          dealers for you.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <QuoteRequestForm />
      </div>
    </div>
  );
}
