import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DealerReach.io - Get Real Dealer Prices",
  description:
    "Stop playing phone tag. Get real dealer pricing on fireplaces, hot tubs, appliances, and more.",
  openGraph: {
    title: "DealerReach.io - Get Real Dealer Prices",
    description:
      "Stop playing phone tag. Get real dealer pricing on fireplaces, hot tubs, appliances, and more.",
    siteName: "DealerReach.io",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DealerReach.io - Get Real Dealer Prices",
    description:
      "Stop playing phone tag. Get real dealer pricing on fireplaces, hot tubs, appliances, and more.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-950">
        <AuthProvider>
          <NavBar />
          <main className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
