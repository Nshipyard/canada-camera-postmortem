import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "The Camera Post-Mortem: every Toronto traffic camera, ranked",
  description:
    "Ontario banned municipal speed cameras on November 14, 2025. The full post-mortem the City never published: 520 speed-camera sites (2020-2025) and 321 red-light intersections (2007-2026), ranked by tickets and implied fine revenue. Open data, MIT licensed.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "The Camera Post-Mortem: every Toronto traffic camera, ranked",
    description:
      "2,150,715 speed-camera tickets. 1,304,807 red-light tickets. $424.1M in exact red-light fines. Every site ranked, on one map.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Camera Post-Mortem: every Toronto traffic camera, ranked",
    description:
      "2,150,715 speed-camera tickets. 1,304,807 red-light tickets. $424.1M in exact red-light fines. Every site ranked, on one map.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
