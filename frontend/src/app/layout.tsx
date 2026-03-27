import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DealerReach | The Editorial Atelier",
  description:
    "Elevate your luxury showroom operations with an editorial-grade platform designed for high-end appliance and kitchen dealers.",
  openGraph: {
    title: "DealerReach | The Editorial Atelier",
    description:
      "Elevate your luxury showroom operations with an editorial-grade platform designed for high-end appliance and kitchen dealers.",
    siteName: "DealerReach",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DealerReach | The Editorial Atelier",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-surface text-on-surface">
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
