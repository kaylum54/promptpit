import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import FeedbackButton from "@/components/FeedbackButton";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptpit.com"),
  title: "PromptPit — The AI Product Architect",
  description:
    "Go from idea to production-ready spec in one conversation. Features, database, security, admin panel — everything you need to ship.",
  keywords: [
    "AI product architect",
    "product specification",
    "AI planning",
    "software architecture",
    "product development",
    "AI assistant",
    "spec generation",
    "database design",
    "feature planning",
    "technical specification",
    "AI-powered development",
    "product roadmap",
  ],
  authors: [{ name: "PromptPit" }],
  creator: "PromptPit",
  publisher: "PromptPit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptpit.com",
    siteName: "PromptPit",
    title: "PromptPit — The AI Product Architect",
    description:
      "Go from idea to production-ready spec in one conversation. Features, database, security, admin panel — everything you need to ship.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptPit — The AI Product Architect",
    description:
      "Go from idea to production-ready spec in one conversation. Features, database, security, admin panel — everything you need to ship.",
    creator: "@promptpit",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Elegant Typography - Cormorant Garamond for Display, DM Sans for Body */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <FeedbackButton />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
