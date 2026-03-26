import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DealerReach.io - Compare Renovation Quotes from Bay Area Dealers",
  description:
    "Get real dealer pricing on home renovation products in the San Francisco Bay Area. Compare quotes on appliances, fireplaces, hot tubs, outdoor kitchens, and more.",
  openGraph: {
    title: "DealerReach.io - Compare Renovation Quotes from Bay Area Dealers",
    description:
      "Get real dealer pricing on home renovation products in the San Francisco Bay Area. Compare quotes on appliances, fireplaces, hot tubs, outdoor kitchens, and more.",
    siteName: "DealerReach.io",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DealerReach.io - Compare Renovation Quotes from Bay Area Dealers",
    description:
      "Get real dealer pricing on home renovation products in the San Francisco Bay Area. Compare quotes on appliances, fireplaces, hot tubs, outdoor kitchens, and more.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
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
