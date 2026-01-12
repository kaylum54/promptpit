import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import FeedbackButton from "@/components/FeedbackButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://promptpit.com"),
  title: "PromptPit - AI Model Debate Arena",
  description:
    "Watch AI models debate in real-time. 4 LLMs stream responses simultaneously, judged by an AI referee. Compare Claude, GPT-4o, Gemini, and Llama head-to-head.",
  keywords: [
    "AI debate",
    "LLM comparison",
    "Claude",
    "GPT-4o",
    "Gemini",
    "Llama",
    "AI models",
    "language models",
    "AI arena",
    "model comparison",
    "AI referee",
    "real-time AI",
    "streaming AI",
    "prompt engineering",
  ],
  authors: [{ name: "PromptPit" }],
  creator: "PromptPit",
  publisher: "PromptPit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptpit.com",
    siteName: "PromptPit",
    title: "PromptPit - AI Model Debate Arena",
    description:
      "Watch AI models debate in real-time. 4 LLMs stream responses simultaneously, judged by an AI referee. Compare Claude, GPT-4o, Gemini, and Llama head-to-head.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromptPit - AI Model Debate Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptPit - AI Model Debate Arena",
    description:
      "Watch AI models debate in real-time. 4 LLMs stream responses simultaneously, judged by an AI referee. Compare Claude, GPT-4o, Gemini, and Llama head-to-head.",
    images: ["/og-image.png"],
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
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-body antialiased bg-bg-base min-h-screen`}
      >
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
