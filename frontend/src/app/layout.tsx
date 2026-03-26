import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DealerReach — The Digital Home for Exceptional Crafts",
  description:
    "Elevate your luxury showroom operations with an editorial-grade platform designed for high-end appliance and kitchen dealers.",
  openGraph: {
    title: "DealerReach — The Digital Home for Exceptional Crafts",
    description:
      "Elevate your luxury showroom operations with an editorial-grade platform designed for high-end appliance and kitchen dealers.",
    siteName: "DealerReach",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DealerReach — The Digital Home for Exceptional Crafts",
    description:
      "Elevate your luxury showroom operations with an editorial-grade platform designed for high-end appliance and kitchen dealers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#FAF8F5] text-[#1A1A1A]">
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
