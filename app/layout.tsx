import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.chatbattles.site'),
  title: {
    default: "ChatBattles AI — Compare AI Models Side-by-Side | GPT-5, Llama-4, DeepSeek, Gemini",
    template: "%s | ChatBattles AI"
  },
  description: "ChatBattles AI lets you compare 4 top AI models simultaneously — GPT-5, Llama-4, DeepSeek v3.1, and Google Gemini 2.5 Pro. Get the best AI answers in real-time, 100% free.",
  keywords: [
    "AI Chat Battle",
    "Compare AI Models",
    "Multi-Model AI Chat",
    "AI Comparison Tool",
    "GPT-5",
    "Llama-4",
    "DeepSeek v3.1",
    "Google Gemini 2.5 Pro",
    "AI vs AI",
    "Free AI Chat",
    "ChatBattles AI",
    "Best AI Model",
    "AI Model Comparison",
    "Artificial Intelligence Chat",
    "Multiple AI Models"
  ],
  authors: [{ name: "Biraj", url: "https://www.chatbattles.site" }],
  creator: "Biraj",
  publisher: "ChatBattles AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.chatbattles.site",
    siteName: "ChatBattles AI",
    title: "ChatBattles AI — Compare AI Models Side-by-Side | GPT-5, Llama-4, DeepSeek, Gemini",
    description: "ChatBattles AI lets you compare 4 top AI models simultaneously — GPT-5, Llama-4, DeepSeek v3.1, and Google Gemini 2.5 Pro. Get the best AI answers in real-time, 100% free.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChatBattles AI - Compare AI Models Side-by-Side",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ChatBattlesAI",
    creator: "@ChatBattlesAI",
    title: "ChatBattles AI — Compare AI Models Side-by-Side",
    description: "Compare GPT-5, Llama-4, DeepSeek v3.1, and Google Gemini 2.5 Pro in real-time. 100% free AI model comparison tool.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.chatbattles.site",
  },
  verification: {
    google: "fje51Wb1lIDuYhFab-H9V0zniEOE7uU45MRrliFy5CU",
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
        <head>
          {/* Google Tag Manager */}
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMDWK3BB');`
          }} />
          {/* End Google Tag Manager */}
          
          {/* Structured Data (JSON-LD) for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "ChatBattles AI",
                "description": "Compare 4 top AI models simultaneously - GPT-5, Llama-4, DeepSeek v3.1, and Google Gemini 2.5 Pro. Get the best AI answers in real-time, 100% free.",
                "url": "https://www.chatbattles.site",
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1250"
                },
                "author": {
                  "@type": "Person",
                  "name": "Biraj"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "ChatBattles AI",
                  "url": "https://www.chatbattles.site"
                },
                "featureList": [
                  "Compare 4 AI models simultaneously",
                  "Real-time AI responses",
                  "GPT-5, Llama-4, DeepSeek v3.1, Google Gemini 2.5 Pro",
                  "100% Free",
                  "No subscription required"
                ]
              })
            }}
          />
        </head>
        <body className={inter.className}>
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MMDWK3BB"
              height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe>
          </noscript>
          {/* End Google Tag Manager (noscript) */}
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}

