import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatBattles — Compare AI Models Side-by-Side",
  description: "ChatBattles.ai lets you talk to multiple AI models at once — GPT-5-Nano, Grok-4, and DeepSeek — and see who responds best.",
  keywords: ["AI Chat Battle", "Compare AI", "Multi-Model Chat", "AI vs AI", "GPT-5-Nano", "Grok-4", "DeepSeek"],
  authors: [{ name: "Biraj" }],
  openGraph: {
    title: "ChatBattles — Compare AI Models Side-by-Side",
    description: "ChatBattles.ai lets you talk to multiple AI models at once — GPT-5-Nano, Grok-4, and DeepSeek — and see who responds best.",
    type: "website",
    url: "https://chatbattles.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatBattles — Compare AI Models Side-by-Side",
    description: "Compare AI models in real-time battle mode",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}

